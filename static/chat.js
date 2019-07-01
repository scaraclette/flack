var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

document.addEventListener('DOMContentLoaded', () => {
    channelList();

    // By default create channel button is disabled
    disableButton('channelSubmit', 'channelInput');
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
}

// ************** HELPER FUNCTIONS **********************
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