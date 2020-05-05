const btnExport = document.getElementById("WAXP_EXPORT");

document.addEventListener('click', function(e) {
    switch(e.target.id){
        case "WAXP_EXPORT":
            var exportType = document.getElementById('exportType').value;
            sendMessageToWAXP(exportType);
            break;
        case "stopButton":
            sendMessageToWAXP('stopAutoScroll');
            break;
        case "gearIcon":
            document.getElementsByTagName("fieldset")[0].classList.toggle("hidden");
            break;
    }
});

function sendMessageToWAXP(message){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type:message}, function(response){
           //nothing for now..just send message
        });
    });
}
const groupNameField = document.getElementById("groupName");

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    
    if(tabs[0].url.match(/https{0,1}:\/\/web.whatsapp.com\//)){
            document.getElementById('ol_step1').classList.add('hidden');
    }

    chrome.tabs.sendMessage(tabs[0].id, {type:"currentGroup"}, function(response){
        btnExport.disabled = response ? false : true;
        groupNameField.innerText = response;
    });
});