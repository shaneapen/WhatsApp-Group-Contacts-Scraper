
WA_Group_Exporter = {}

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var SCROLL_INTERVAL_CONSTANT = 3000, SCROLL_INCREMENT = 400;

var membersList = document.querySelectorAll('span[title=You]')[0]?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode;
var MEMBERS_QUEUE = {};

console.log("%c WhatsApp Group Contact Exporter","font-size:24px;font-weight:bold;color:white;background:green;");
console.group("WhatsApp Group Contact Exporter Logs");

var observer = new MutationObserver(function (mutations, observer) {
    // fired when a mutation occurs   
    WA_Group_Exporter.scrapeData();
});

// the div to watch for mutations
observer.observe(membersList, {
    childList: true,
    subtree: true
});


let header = document.getElementsByTagName('header')[0];
let height = header.nextSibling.scrollHeight;

//scroll to top before beginning
header.nextSibling.scrollTop = 0;
let scrollInterval = setInterval(WA_Group_Exporter.autoScroll, SCROLL_INTERVAL_CONSTANT);

/**
 * Function to autoscroll the div
 */
WA_Group_Exporter.autoScroll = function (){
    if(header.nextSibling.scrollTop < height)
        header.nextSibling.scrollTop += SCROLL_INCREMENT;
    else{
        clearInterval(scrollInterval);
        console.log("Extraction Completed..")
    }

    console.log(`Page (${Math.ceil(header.nextSibling.scrollTop/SCROLL_INCREMENT)} / ${Math.ceil(height/SCROLL_INCREMENT)}) | Size: ${debug().size}`)
};

/**
 * Function to scrape member data
 */
WA_Group_Exporter.scrapeData = function () {
    var phone, status, name;
    var memberCard = membersList.querySelectorAll(':scope > div');

    for (let i = 0; i < memberCard.length; i++) {

        // STATUS
        status = memberCard[i].querySelectorAll('span[title]')[1] ? memberCard[i].querySelectorAll('span[title]')[1].title : "NIL";

        // PHONE
        if (memberCard[i].querySelector('img')) {
            phone = memberCard[i].querySelector('img').src;
            phone = phone.match(/u=[0-9]*/) ? phone.match(/u=[0-9]*/)[0].substring(2).replace(/[+\s]/g, '') : "NIL";
        } else {
            //no image instead placeholder SVG is shown [happens when the contact info is not saved]
            var s = memberCard[i].querySelector('span[data-icon="default-user"]');
            name = s ? (s ?.parentNode?.parentNode?.parentNode?.nextSibling.querySelector('span[title]').title) : "NIL";
        }

        // NAME
        if (memberCard[i].querySelector('span[title]')) {
            name = memberCard[i].querySelector('span[title]').getAttribute('title');
            /**
             * Phone number shown in place of name when contact is not saved
             */
            if (name.match(/(.?)*[0-9]{3}$/)) {
                phone = name.match(/(.?)*[0-9]{3}$/)[0].replace(/[+\s]/g, '');
                name = memberCard[i].firstChild.firstChild.childNodes[1].childNodes[1].querySelector('span[dir=auto]')?.innerText;
            }
        } else {
            name = "NIL";
        }

        //Push the phone to queue if not already present
        if (!MEMBERS_QUEUE[phone]) {
            MEMBERS_QUEUE[phone] = [name, status];
        }
    }
}


/**
 * A utility function to download the result as CSV file
 * @params <none>
 * 
 * References
 * [1] - https://stackoverflow.com/questions/4617935/is-there-a-way-to-include-commas-in-csv-columns-without-breaking-the-formatting
 * 
 */
 WA_Group_Exporter.downloadAsCSV = function () {

    var name = "member-details.csv",
        type = "data:attachment/text",
        data = "Name,Phone,Status\n";

    for (key in MEMBERS_QUEUE) {
        data += `${MEMBERS_QUEUE[key][0]},${key},"${MEMBERS_QUEUE[key][1]}"\n`; //[1]
    }
    var a = document.createElement('a');
    a.style.display = "none";

    var url = window.URL.createObjectURL(new Blob([data], {
        type: type
    }));
    a.setAttribute("href", url);
    a.setAttribute("download", name);
    document.body.append(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
}

/**
 * A debug function to print size of the object
 * @params none
 * @returns {size}
 */

WA_Group_Exporter.debug = function () {

    var size = 0,
        key;
    for (key in MEMBERS_QUEUE) {
        if (MEMBERS_QUEUE.hasOwnProperty(key)) size++;
    }

    return {
        size: size,
        q: MEMBERS_QUEUE
    }
}

console.groupEnd();