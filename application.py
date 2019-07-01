import os, requests, json

from flask import Flask, redirect, render_template, jsonify, request, redirect, url_for, session
from flask_session import Session
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Variables
chatLimit = 5
usernames = ["USER"]
# Create channel 
channels = ["default", "another default"]
chatMsg = {"default":[{"user":"USER", "msg":"test", "dateTime":"now"}, {"user":"USER", "msg":"another test", "dateTime":"later"}], "another default":[{"user":"USER", "msg":"test", "dateTime":"now"}, {"user":"USER", "msg":"another test", "dateTime":"another default later"}]}

@app.route("/")
def index():
    return render_template("login.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    global usernames

    currentUser = request.form.get("usernameInput")
    if currentUser is None:
        return "ENTER USERNAME"
    session["username"] = currentUser
    if currentUser not in usernames:
        usernames.append(currentUser)
        
    return render_template("chat.html", user=session["username"])

@app.route("/logout")
def logout():
    session.pop('username', None)
    return redirect(url_for('index'))

@socketio.on('open_channels')
def openChannels():
    global channels
    emit('current_channels', {'channels':channels}, broadcast=True)

@socketio.on('create_channel')
def createChannel(data):
    global channels, chatMsg
    newChannel = data['newChannel']

    # if newChannel exists, emit error message
    if newChannel in channels:
        emit('channel_exists', {'msg':'channel already exists!'})
    else:
        channels.append(newChannel)
        chatMsg.update({newChannel:[]})
        emit('current_channels', {'channels':channels}, broadcast=True)

@socketio.on('set_room')
def setRoom(data):
    global chatMsg

    chnName = data['chnName']

    if session.get('room') is not None:
        leave_room(session['room'])

    session['room'] = chnName
    join_room(chnName)

    emit('show_message', {'chat':chatMsg[chnName]})

@socketio.on('submit_chat')
def submitChat(data):
    global chatLimit, chatMsg

    chnName = session['room']
    msg = data['msg']
    dateTime = data['dateTime']

    getChat = chatMsg[chnName]
    if len(getChat) == chatLimit:
        del getChat[0]
    getChat.append({'user':session['username'], 'msg':msg, 'dateTime':dateTime})

    chatMsg[chnName] = getChat

    emit('live_chat', {'chat':getChat}, room=session['room'], broadcast=True)
