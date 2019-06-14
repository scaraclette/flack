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
    return render_template("chat.html")


# Endpoint that returns current available channels
@app.route("/get-channels", methods=["GET", "POST"])
def getChannels():
    global channels, usernames

    if request.method == "GET":
        print(usernames)
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
    print("IM HERE")

    if request.method == "POST":
        crUser = request.form.get("crUser")
        print(crUser)
        if crUser is not None:
            currentUser = crUser
            if currentUser not in usernames:
                usernames.append(currentUser)
        print(usernames)
        return jsonify()

    # Get statement returns current user
    return jsonify(currentUser)

