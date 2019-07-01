var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

document.addEventListener('DOMContentLoaded', () => {
    channelList();
});

function channelList() {
    socket.emit('open_channels');

    document.querySelector('#newChannel').onsubmit = () => {
        let newChannel = document.querySelector('#channelInput').value;
        document.querySelector('#channelInput').value = '';
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