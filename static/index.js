document.addEventListener('DOMContentLoaded', () => {

    // ********* Index page ****************
    disableButton('#userSubmit', '#username');

});

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