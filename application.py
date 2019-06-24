import os, requests, json

from flask import Flask, render_template, jsonify, request, redirect, url_for, session
from flask_session import Session
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Variables within Flask memory
usernames = []
currentUser = ""
# channels = ["default", "another default"]
channels = ["test", "default", "another default"]
chatLimit = 5

"""
To access the message dictionary, example want to get userA = "alit"
userA = chat["default"][0]["user]
"""
# Messages
chatMsg = {"default":[{"user":"alit","msg":"test","dateTime":"now"},{"user":"si","msg":"nope","dateTime":"later"}], "another default":[{"user":"alitAnother","msg":"testing12","dateTime":"before"}], "test":[]}


@app.route("/")
def index():
    return render_template("chat.html")


# Endpoint that returns current available channels
@app.route("/get-channels", methods=["GET", "POST"])
def getChannels():
    global channels, usernames

    if request.method == "GET":
        print(usernames)
        return jsonify(channels)

    # If request is POST, set new channel
    newChannel = request.form.get("newChannel")
    if newChannel is not None:
        newChannel = newChannel.strip().lower()
    # Add new channel both to channel names and chatMsg
    if newChannel not in channels:
        channels.append(newChannel)    
        chatMsg.update({newChannel:[]})

    return jsonify(channels)

# Endpoint to get current user
@app.route("/current-user", methods=["GET","POST"])
def current_user():
    if session.get("username") is None:
        print("setting default username")
        session["username"] = "USER"

    if request.method == "POST":
        crUser = request.form.get("crUser")
        if crUser is not None:
            session["username"] = crUser
        print(session["username"])

    # Get statement returns current user
    return jsonify({"username":session["username"]})

# Endpoint to set user's channel session
@app.route("/set-channel", methods=["POST"])
def setChannel():
    if session.get("room") is None:
        print("no current channels")
        session["room"] = None

    if request.method == "POST":
        session["room"] = request.form.get("chnName")
        print("CURRENT CHANNEL:", session["room"])

    return jsonify({"chnName":session["chnName"]})

# Endpoint to get and update current chat
@app.route("/get-chat", methods=["GET"])
def messages():
    global chatMsg
    session["room"] = request.form.get("chnName")
    print("current room", session["room"])
    currentChannel = chatMsg[session["room"]]
    return jsonify(currentChannel)

# socketIo connection
@socketio.on("submit chat")
def chat(data):
    global chatLimit, chatMsg

    # chnName = data["chnName"]
    chnName = session["room"]

    print("******************")
    print("DATA[CHNNAME]:", data["chnName"])
    print("******************")
    print("CHNNAME:", chnName)
    print("******************")
    msg = data["msg"]
    dateTime = data["dateTime"]

    # Get current channel's chat. Check limit chat to 10 for now. 
    getChat = chatMsg[chnName]
    print("******************")
    print("GET CHAT:", getChat)
    print("******************")
    if len(getChat) == chatLimit:
        print("where here")
        del getChat[0]
    getChat.append({'user':session["username"], 'msg':msg, 'dateTime':dateTime})

    # DEBUG
    print("******************")
    print("CURRENT GETCHAT", getChat)
    print("user:", session["username"])
    print("msg:", msg)
    print("dateTime:", dateTime)
    print("******************")

    # Update the key's value
    chatMsg[chnName] = getChat
    print(chatMsg)

    emit("show chat", getChat, broadcast=True)

@socketio.on('join')
def join(data):
    if session.get("room") is not None:
        leave_room(session["room"])

    newChn = data["newChn"]
    join_room(newChn)

    session["room"] = newChn
    print(session["room"])

    emit('joined_room', {'room':session["room"]})

