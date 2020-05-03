const btnExport = document.getElementById("WAXP_EXPORT");
btnExport.addEventListener("click", exportFile, false);

const selectedGroupIs = document.getElementById("selectedGroup");
setInterval(currentGroup,300);


function exportFile(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type:"startDefault"}, function(response){
            
        });
    });
}

function currentGroup(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type:"currentGroup"}, function(response){
            btnExport.disabled = response ? false : true;
            if(response != selectedGroupIs.innerText) selectedGroupIs.innerText = response;
        });
    });
}

