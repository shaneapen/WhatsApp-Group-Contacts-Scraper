## WAXP - WhatsApp Group Contact Exporter

### Instructions
1. Open [WhatsApp Web](https://web.whatsapp.com) and open any group chat
2. Copy-paste the script into the console
3. Now run `WAXP.start()`

### `WAXP.start([optional config])`

```
const config = {
    SCROLL_INTERVAL_CONSTANT = 1000, 
    SCROLL_INCREMENT = 400, 
    AUTO_SCROLL = true, 
}

WAXP.start(config);
```
### TO DO
- Show the number of contacts whose phone number were not available..optionally push their details to the sheet
- Create a chrome plugin

## Bookmark Script
**Script injection not possible inside Whatsapp Web**
Go to bookmarks and add new page. Enter the following code in the URL field and save with any name.
```
javascript: (function(e, s) {
    e.src = s;
    e.onload = function() {
        WAXP.start();
    };
    var k = document.head.querySelector('script:last-child');
    if(!k.src.contains('WAXP.js')){
        document.head.appendChild(e);
    }
})(document.createElement('script'), '//codegena.com/WAXP/WAXP.js')
```
### How to start Chrome extension *****

In development mode, go to Chrome > Settings > More Tools > Extensions > "Developer mod" > Load unpacked >

select the folder with the application > launch

### Note

This script uses optional chaining according to ECMAScript-262. [Learn more.](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) 

## Disclaimer
This is an unofficial enhancement for WhatsApp Web. WAXP do not promote any unethical activity, this is made just to automate and make work easier.