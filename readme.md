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


### Note

This script uses optional chaining according to ECMAScript-262. [Learn more.](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) 