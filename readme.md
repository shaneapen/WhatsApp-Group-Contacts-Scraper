## WAXP - WhatsAPP Group Contact Exporter

### Unit Test Phone

```
function scrapePhoneNum(el){
    var phone;
     if (el.querySelector('img') && el.querySelector('img').src.match(/u=[0-9]*/)) {
        phone = el.querySelector('img').src.match(/u=[0-9]*/)[0].substring(2).replace(/[+\s]/g, '');
     } else {
        var temp = el.querySelector('span[title]').getAttribute('title').match(/(.?)*[0-9]{3}$/);
        phone = temp ? temp[0].replace(/\D/g,'') : 'NIL';
     }
   return phone;
}
```

Call `scrapePhoneNum($0)` from Chrome console on the membercard

### Unit Test Name
function scrapeName(el){
    var expectedName;
    expectedName = el.firstChild.firstChild.childNodes[1].childNodes[1].childNodes[1].querySelector('span').innerText;
    if(expectedName == ""){
        return el.querySelector('span[title]').getAttribute('title');
    }
    return expectedName;
}
Call `scrapeName($0)` from Chrome console on the membercard
```


```
