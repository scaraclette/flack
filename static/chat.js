document.addEventListener('DOMContentLoaded', () => {
    //Initially, clear storage for debugging. Later create a function
    //Todo: only delete keys that are not available in get channels

    // By default the creating channel and typing message are disabled
    defaultDisable();    

    // ******** Current user **************
    curUsr();

    // ********* Chat page *****************

    // ********* TEST ***************
    // testChat();


});

// Disable others
function defaultDisable() {
    document.querySelector('#channelInput').disabled = true;
    document.querySelector('#channelSubmit').disabled = true;
    document.querySelector('#chatInput').disabled = true;
    document.querySelector('#chatSubmit').disabled = true;
}

// Function that gets current user to use for localStorage later
function curUsr() {
    disableButton('#userSubmit', '#userInput');
    document.querySelector('#enterUser').onsubmit = () => {
        document.querySelector('#channelInput').disabled = false;
        
        let currentUser = document.querySelector('#userInput').value;

        const request = new XMLHttpRequest();
        request.open('POST', '/current-user');

        request.onload = () => {
            const data = JSON.parse(request.responseText);
            document.querySelector('#currentUser').innerHTML = "Current user: " + data["username"];

            // if (localStorage.getItem(data["username"] === null)) {
            //     localStorage.setItem(data["username"], "default");
            // }

            // open channels function
            channels(data["username"]);
        }

        const data = new FormData();
        data.append("crUser", currentUser);
        request.send(data)
        return false;
    }

}

// Function that creates new channels and shows existing ones
function channels(username) {
    // Initially both the submit buttons for new channel and send chat are disabled.
    // send chat will call disableButton function later when a channel is selected
    disableButton('#channelSubmit', '#channelInput')
    document.querySelector('#chatInput').disabled = true;
    document.querySelector('#chatSubmit').disabled = true;

    // Set the initial stored channels
    getChannels(username);

    // When creating a new channel, send Ajax request
    document.querySelector('#newChannel').onsubmit = () => {
        const request = new XMLHttpRequest();
        request.open('POST', '/get-channels');

        let newChannelInput = document.querySelector('#channelInput').value;
        request.onload = () => {
            getChannels(username);
        }

        //Send channel
        const data = new FormData();
        data.append("newChannel", newChannelInput);
        request.send(data)

        document.getElementById("channelInput").value = "";
        return false;
    };

}
// Function that gets existing channels from server and updates '#channelList' dynamically
function getChannels(username) {
    const request = new XMLHttpRequest();
    request.open('GET', '/get-channels');

    request.onload = () => {
        const data = JSON.parse(request.responseText);

        // Remove previous if channel is updated
        clearList('channelList');

        console.log("BEFORE: " + localStorage);
        // Delete/Keep items in localStorage
        for (let i = 0; i < localStorage.length; i++) {
            let currentItem = localStorage.getItem(localStorage.key(i));
            if (!data.includes(currentItem)) {
                localStorage.removeItem(localStorage.key(i));
                i--;
            }
        }
        console.log("AFTER: " + localStorage);

        // Show the list of channel links
        console.log("DATA: " + data[0]);
        data.forEach(function(obj) {
            let btn = document.createElement('button');
            btn.innerHTML = obj;
            btn.setAttribute('id', obj);
            // Enables button-onclick on the generated channels
            // btn.onclick = function() {openChannel(obj, username, true);}; 
            btn.onclick = function() {openChannel(obj, username)}  
            
            document.getElementById('channelList').appendChild(btn);
        });

        // TODO: implement localStorage

    }

    request.send();
}

function openChannel(chnName, username) {
    // Delete previous messageList items
    deleteMl();
    const request = new XMLHttpRequest();
    request.open('POST', '/set-channel')

    request.onload = () => {
        const data = JSON.parse(request.responseText);
        console.log(data)
        // let currentRoom = data['chnName'];
        let currentChat = data['chatMsg'];
        console.log(currentChat)
        showChat(currentChat);
    }
    
    const data = new FormData();
    data.append("chnName", chnName);
    request.send(data)

    console.log("here!")

    // Enable submit button for chat
    document.querySelector('#chatInput').disabled = false;
    disableButton('#chatSubmit', '#chatInput');

    // Update div for channel name
    document.querySelector('#currentChannel').innerHTML = "Current channel: " + chnName;

    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', function() {
        // socket.emit('join', {chnName:chnName})
        console.log("connected!")
    });

    socket.emit('join', {'newChn':chnName})

    socket.on('joined_room', function(data) {
        console.log('chnName: ' + data.room);

        // Submit a chat
        document.querySelector('#newChat').onsubmit = () => {
            let msg = document.querySelector('#chatInput').value;
            console.log("CURRENT MESSAGE: " + msg);

            // Get current timestamp
            let today = new Date();
            let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            let dateTime = date + ' ' + time;

            // Send message and chnName
            socket.emit('submit chat', {'chnName': chnName, 'msg':msg, 'dateTime':dateTime})

            document.getElementById("chatInput").value = "";
            return false;
        }

        // When chat is received, update to '#messageList'
        socket.on('show chat', data => {
            // An example of getting a message value: getChat[0]['msg']
            // For debugging purposes, keep track of count in console
            let count = 1;
            // Delete the contents of messageList first
            deleteMl();

            console.log(data["room"])

            let room = data["room"]
            let currentChat = data["chatMsg"][room]
            // console.log(data["chatMsg"])
            // Update message list first
            currentChat.forEach(function(index) {
                // Debugging purposes
                console.log(count + ": " + index['user'] + ": " + index['msg'] + " (" + index['dateTime'] + ")");
                count++;

                let node = document.createElement('li');
                let textNode = document.createTextNode(index['user'] + " (" + index['dateTime'] + "): " + index['msg']);
                node.appendChild(textNode);
                document.getElementById('messageList').appendChild(node);
            });
        });
    })


}

function showChat(data) {
    // Update message list first
    let count=1;
    data.forEach(function(index) {
        // Debugging purposes
        console.log(count + ": " + index['user'] + ": " + index['msg'] + " (" + index['dateTime'] + ")");
        count++;

        let node = document.createElement('li');
        let textNode = document.createTextNode(index['user'] + " (" + index['dateTime'] + "): " + index['msg']);
        node.appendChild(textNode);
        document.getElementById('messageList').appendChild(node);
    });

    console.log(data)
}

function deleteMl() {
    // Delete the contents of messageList first
    let ml = document.querySelector('#messageList');
    while (ml.firstChild) {
        ml.removeChild(ml.firstChild);
    }
}

function userLocalStorage(chnName) {
    let currentUser = document.querySelector('#userInput').value;
    localStorage.setItem(currentUser, chnName);
}


// ************** HELPER FUNCTIONS **********************
function clearList(elmName) {
    let list1Node = document.getElementById(elmName);
    while(list1Node.firstChild) {
        list1Node.removeChild(list1Node.firstChild);
    }
}

// Function that disables specific submit button
function disableButton(submitId, formId) {
    document.querySelector(submitId).disabled = true;
    // To prevent empty userinput
    document.querySelector(formId).onkeyup = () => {
        let userInput = document.querySelector(formId).value;
        userInput = userInput.replace(/\s+/g, '');
        if (userInput.length > 0) {
            document.querySelector(submitId).disabled = false;
        } else {
            document.querySelector(submitId).disabled = true;
        }
    }
}