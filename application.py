import os, requests, json

from flask import Flask, render_template, jsonify, request, redirect, url_for
# from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
# socketio = SocketIO(app)

# Variables within Flask memory
usernames = []
currentUser = ""
channels = ["default"]

"""
To access the message dictionary, example want to get userA = "alit"
userA = chat["default"][0]["user]
"""
# Messages
chatMsg = {"default":[{"user":"alit","msg":"test","time":"now"},{"user":"si","msg":"nope","time":"later"}]}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST", "GET"])
def chat():
    global usernames, currentUser

    if request.method == "POST":
        user = request.form.get("username")
        if user is not None:
            user = user.strip()
            print(len(user) == 0)
        if user is not None and len(user) != 0:
            currentUser = user
            if currentUser not in usernames:
                usernames.append(currentUser)
            print("CURRENT USER:", currentUser)
            return render_template("chat.html", currentUser=currentUser)
    

    # If there is no user input, redirect to index.html
    return redirect(url_for('index'))

# Endpoint that returns current available channels
@app.route("/get-channels", methods=["GET", "POST"])
def getChannels():
    global channels

    if request.method == "GET":
        return jsonify(channels)

    # If request is post set new channel
    newChannel = request.form.get("newChannel")
    if newChannel is not None:
        newChannel = newChannel.strip().lower()
    if newChannel not in channels:
        channels.append(newChannel)    

    return jsonify(channels)

# Endpoint to get current user
@app.route("/current-user", methods=["GET","POST"])
def current_user():
    global currentUser
    print("USER TO SEND:", currentUser)
    return jsonify(currentUser)

