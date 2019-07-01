var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

document.addEventListener('DOMContentLoaded', () => {
    channelList();

    // By default create channel button is disabled
    disableButton('channelSubmit', 'channelInput');
    document.getElementById('chatInput').disabled = true;
    document.getElementById('chatSubmit').disabled = true;
    
});

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

        // Clears previous channel list
        clearList('channelList');

        channels.forEach(function(obj) {
            let btn = document.createElement('button');
            btn.innerHTML = obj;
            btn.setAttribute('id', obj);
            btn.onclick = function() {openChannel(obj)};
            document.getElementById('channelList').appendChild(btn);
        })
    });

    socket.on('channel_exists', data => {
        let message = data['msg'];
        alert(message);
    })
};

function openChannel(chnName) {
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

function startChat1() {

    document.querySelector('#newChat').onsubmit = () => {
        let msg = documet.getElementById('chatInput').value;
        document.getElementById('chatInput').value = '';
        
        // Create chat 
        let today = new Date();
        let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        let dateTime = date + ' ' + time;

        socket.emit('submit_chat', {'msg':msg, 'dateTime':dateTime});

        return false;
    }

    socket.on('live_chat', data => {
        clearList('messageList');
        let chat = data['chat']
        createChat(chat);
    });
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