# SocketIO Message - Flack

## Background
Using Flask's SocketIO, this web application allows users across browsers to create a channel that enables them to chat.

## Features

    <li>With the use of JavaScript's LocalStorage, existing users upon logging in will have their previous opened channel by default.</li>
    <li>Users are able to delete themselves where the app will delete all their previous messages</li>

## Installing
On working directory
```
$ export FLASK_APP=application.py
$ flask run
```

## Required
    <li>Python3</li>
    <li>Flask</li>
    <li>Flask SocketIO</li>
