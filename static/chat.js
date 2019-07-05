var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

document.addEventListener('DOMContentLoaded', () => {
    deleteLocal();

    // By default create channel button is disabled
    disableButton('channelSubmit', 'channelInput');
    document.getElementById('chatInput').disabled = true;
    document.getElementById('chatSubmit').disabled = true;

    document.querySelector('#checkSession').onsubmit = () => {
        const request = new XMLHttpRequest();
        request.open('GET', '/check');

        request.onload = () => {
            const data = JSON.parse(request.responseText);
            let curUser = data['currentUser']
            document.querySelector('#currentSession').innerHTML = curUser;
        }

        request.send();
        return false;
    }
    
});

function deleteLocal() {
     const request = new XMLHttpRequest();
        request.open('GET', '/get-channels');

        request.onload = () => {
            const data = JSON.parse(request.responseText);
            let channels = data['channels']
            
            // Clear previous localStorages
            for (let i = 0; i < localStorage.length; i++) {
                let currentItem = localStorage.getItem(localStorage.key(i));
                if (!channels.includes(currentItem)) {
                    localStorage.removeItem(localStorage.key(i));
                    i--;
                }
            }

            channelList();
            
        }

    request.send();
    return false;
}

function channelList() {
    socket.emit('open_channels');

    document.querySelector('#newChannel').onsubmit = () => {
        let newChannel = document.querySelector('#channelInput').value;
        document.getElementById('channelInput').value = '';
        disableButton('channelSubmit', 'channelInput');
        socket.emit('create_channel', {'newChannel':newChannel})
        return false;
    }

    socket.on('current_channels', data => {
        let channels = data['channels']
        let currentUser = data['currentUser']

        // Clear previous localStorages
        for (let i = 0; i < localStorage.length; i++) {
            let currentItem = localStorage.getItem(localStorage.key(i));
            if (!channels.includes(currentItem)) {
                localStorage.removeItem(localStorage.key(i));
                i--;
            }
        }

        // Clears previous channel list
        clearList('channelList');

        channels.forEach(function(obj) {
            let btn = document.createElement('button');
            btn.innerHTML = obj;
            btn.setAttribute('id', obj);
            btn.onclick = function() {openChannel(obj, currentUser)};
            document.getElementById('channelList').appendChild(btn);
        });

    });

    openLocal();

    socket.on('channel_exists', data => {
        let message = data['msg'];
        alert(message);
    })
};

function openLocal() {
    const request = new XMLHttpRequest();
    request.open('GET', '/check');

    request.onload = () => {
        const data = JSON.parse(request.responseText);
        let curUser = data['currentUser']
        // document.querySelector('#currentSession').innerHTML = curUser;
        if (localStorage.getItem(curUser) !== null) {
            let toOpen = localStorage.getItem(curUser);
            openChannel(toOpen);
        }
    }

    request.send();
    return false;
}

function openChannel(chnName, currentUser) {

    localStorage.setItem(currentUser, chnName);

    console.log(chnName);
    document.getElementById('selectedChannel').innerHTML = '<b>' + chnName + '</b>'

    socket.emit('set_room', {'chnName':chnName});

    socket.on('show_message', data => {
        document.getElementById('chatInput').disabled = false;
    disableButton('chatSubmit', 'chatInput');

        clearList('messageList');
        let chat = data['chat']
        createChat(chat);

    });

    document.querySelector('#newChat').onsubmit = () => {
        startChat();
        return false;
    }

    socket.on('live_chat', data => {
        clearList('messageList');
        let chat = data['chat']
        createChat(chat);
    })
}

function startChat() {
    let msg = document.getElementById('chatInput').value;
    document.getElementById('chatInput').value = '';
        
    // Create chat 
    let today = new Date();
    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let dateTime = date + ' ' + time;

    socket.emit('submit_chat', {'msg':msg, 'dateTime':dateTime});
}


// ************** HELPER FUNCTIONS **********************

function createChat(chat) {
    chat.forEach(function(index) {
        let node = document.createElement('li');
        let textNode = document.createTextNode(index['user'] + " (" + index['dateTime'] + "): " + index['msg']);
    node.appendChild(textNode);
        document.getElementById('messageList').appendChild(node);
    });
}

function clearList(elmName) {
    let listNode = document.getElementById(elmName);
    while(listNode.firstChild) {
        listNode.removeChild(listNode.firstChild);
    }
}

function disableButton(submitId, formId) {
    document.getElementById(submitId).disabled = true;
    // To prevent empty userInput
    document.getElementById(formId).onkeyup = () => {
        let userInput = document.getElementById(formId).value;
        userInput = userInput.replace(/\s+/g, '');
        if (userInput.length > 0) {
            document.getElementById(submitId).disabled = false;
        } else {
            document.getElementById(submitId).disabled = true;
        }
    }
}

// Delete message list
function deleteMl() {
    let ml = document.getElementById('messageList');
    while (ml.firstChild) {
        ml.removeChild(ml.firstChild);
    }
}