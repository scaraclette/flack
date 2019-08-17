# SocketIO Message - Flack

## Video Demo: https://youtu.be/WNAI9dzmwFw

## Background
Using Flask's SocketIO, this web application allows users across browsers to create a channel that enables them to chat.

## Features

* With the use of JavaScript's LocalStorage, existing users upon logging in will have their previous opened channel by default.
* Users are able to delete themselves where the app will delete all their previous messages.

## Installing
On working directory
```
$ export FLASK_APP=application.py
$ flask run
```

## Required
   * Python3
   * Flask
   * Flask SocketIO
