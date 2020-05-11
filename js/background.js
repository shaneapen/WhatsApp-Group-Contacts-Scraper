chrome.runtime.onMessage.addListener(
    function(message, callback) {
      if (message == “runContentScript”){
        chrome.tabs.executeScript({
          file: '/js/WAXP.js'
        });
      }
});