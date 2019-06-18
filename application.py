import os, requests, json

from flask import Flask, render_template, jsonify, request, redirect, url_for, session
from flask_session import Session
from flask_socketio import SocketIO, emit

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
channels = []
chatLimit = 5

"""
To access the message dictionary, example want to get userA = "alit"
userA = chat["default"][0]["user]
"""
# Messages
# chatMsg = {"default":[{"user":"alit","msg":"test","dateTime":"now"},{"user":"si","msg":"nope","dateTime":"later"}], "another default":[{"user":"alitAnother","msg":"testing12","dateTime":"before"}]}
chatMsg = {}

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

# Endpoint to get and update current chat
@app.route("/get-chat", methods=["GET"])
def messages():
    global chatMsg
    return jsonify(chatMsg)

# socketIo connection
@socketio.on("submit chat")
def chat(data):
    global chatLimit, chatMsg
    chnName = data["chnName"]
    msg = data["msg"]
    dateTime = data["dateTime"]

    # Get current channel's chat. Check limit chat to 10 for now. 
    getChat = chatMsg[chnName]
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

