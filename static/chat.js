document.addEventListener('DOMContentLoaded', () => {

    // By default the creating channel and typing message are disabled
    defaultDisable();    

    // ******** Current user **************
    disableButton('#userSubmit', '#userInput');
    document.querySelector('#enterUser').onsubmit = () => {
        document.querySelector('#channelInput').disabled = false;
        
        let currentUser = document.querySelector('#userInput').value;
        document.querySelector('#currentUser').innerHTML = "Current user: " + currentUser;

        const request = new XMLHttpRequest();
        request.open('POST', '/current-user');

        request.onload = () => {
            channels();
        }

        const data = new FormData();
        data.append("crUser", currentUser);
        request.send(data)
        return false;
    }

    // ********* Chat page *****************

    // ********* TEST ***************


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
    const request = new XMLHttpRequest();
    request.open('GET', '/current-user');
    request.send(null);

    request.onload = () => {
        const data = JSON.parse(request.responseText);
        console.log(data)
        let currentUser = data;
        document.querySelector('#currentUser').innerHTML = "Current user: " + currentUser;
    }

}

// Function that creates new channels and shows existing ones
function channels() {
    // Initially both the submit buttons for new channel and send chat are disabled.
    // send chat will call disableButton function later when a channel is selected
    disableButton('#channelSubmit', '#channelInput')
    document.querySelector('#chatInput').disabled = true;
    document.querySelector('#chatSubmit').disabled = true;

    // Set the initial stored channels
    getChannels();

    // On submit, send Ajax request
    document.querySelector('#newChannel').onsubmit = () => {
        const request = new XMLHttpRequest();
        request.open('POST', '/get-channels');

        let newChannelInput = document.querySelector('#channelInput').value;
        request.onload = () => {
            getChannels();
        }

        //Send channel
        const data = new FormData();
        data.append("newChannel", newChannelInput);
        request.send(data)

        return false;
    };

}
// Function that gets existing channels from server and updates '#channelList' dynamically
function getChannels() {
    const request = new XMLHttpRequest();
    request.open('GET', '/get-channels');

    request.onload = () => {
        const data = JSON.parse(request.responseText);

        // Remove previous if channel is updated
        clearList('channelList');

        // Show the list of channel links
        console.log("DATA: " + data[0]);
        data.forEach(function(obj) {
            let btn = document.createElement('button');
            btn.innerHTML = obj;
            btn.setAttribute('id', obj);
            // Enables button-onclick on the generated channels
            btn.onclick = function() {openChannel(obj);};   
            
            // Check if previous localStorage exists
            let currentUser = document.querySelector('#userInput').value;
            let userChannel = localStorage.getItem(currentUser);
            // previous local storage exists
            if (userChannel !== null) {
                openChannel(userChannel);
            }
            
            document.getElementById('channelList').appendChild(btn);
        })

    }

    request.send();
}

// Function that starts the chat
function openChannel(chnName) {
    // Update localStorage onclick
    userLocalStorage(chnName);

    console.log("CURRENT LOCAL STORAGE");
    console.log(localStorage)
    // Enable submit button for chat
    document.querySelector('#chatInput').disabled = false;
    disableButton('#chatSubmit', '#chatInput');

    // Function that assigns local storage of user and channel
    // channelStorage(chnName);

    document.querySelector('#currentChannel').innerHTML = "Current channel: " + chnName;

    // Start WebSocket
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