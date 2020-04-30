/*
    Written by Shan Eapen Koshy
    Date: 14 March 2020

    Instructions

    1. Open WhatsApp Web and open any group chat
    2. click group name and SCROLL TO THE BOTTOM OF THE MEMBERS LIST
    3. Copy-paste the script in the console

    NOTES
    This script uses the latest ECMA Script 2020 optional chaining..updating browser to the latest version maybe required

*/

/**
 * @params <none>
 * @returns { downloadAsCSV(), start(), stop(), debug() }
 */

WAXP = (function(){
    
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    var SCROLL_INTERVAL_CONSTANT = 3000, SCROLL_INCREMENT = 400, MEMBERS_QUEUE = {}, AUTO_SCROLL = false, TOTAL_MEMBERS;

    var membersList = document.querySelectorAll('span[title=You]')[0]?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode;
    var scrollInterval, observer;
    let header = document.getElementsByTagName('header')[0];
    let height = header.nextSibling.scrollHeight;

    console.log("%c WhatsApp Group Contacts Exporter ","font-size:24px;font-weight:bold;color:white;background:green;");

    var start = function(){
        observer = new MutationObserver(function (mutations, observer) {
            // fired when a mutation occurs   
            scrapeData();
        });
    
        // the div to watch for mutations
        observer.observe(membersList, {
            childList: true,
            subtree: true
        });

        TOTAL_MEMBERS = membersList.parentElement.parentElement.querySelector('span').innerText.match(/\d+/)[0]*1;
    
        //scroll to top before beginning
        header.nextSibling.scrollTop = 0;
       
        //FOR DEBUGGING
        // console.log({
        //     'SCROLL_INTERVAL_CONSTANT': SCROLL_INTERVAL_CONSTANT,
        //     'SCROLL_INCREMENT': SCROLL_INCREMENT,
        //     'AUTO_SCROLL': AUTO_SCROLL,
        //     'TOTAL_MEMBERS': TOTAL_MEMBERS
        // });

        if(AUTO_SCROLL) scrollInterval = setInterval(autoScroll, SCROLL_INTERVAL_CONSTANT);    
    }

    
    /**
     * Function to autoscroll the div
     */
    var autoScroll = function (){
        if(header.nextSibling.scrollTop + 59 < height) 
            header.nextSibling.scrollTop += SCROLL_INCREMENT;
        else
            stop()
    };

    var stop = function(){
        window.clearInterval(scrollInterval);
        observer.disconnect();
        console.log("Extraction Completed..")
    }

    /**
     * Function to scrape member data
     */
    var scrapeData = function () {
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

            // Push the phone to queue only if the phone num is valid and if not already present in queue
            if (phone.match(/\d+/) && !MEMBERS_QUEUE[phone]) {
                MEMBERS_QUEUE[phone] = [name, status];
            }

            console.log(`%c Extracted [${debug().size} / ${TOTAL_MEMBERS}] Members `,`font-size:13px;color:white;background:green;border-radius:10px;`)
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
    var downloadAsCSV = function () {

        var name = "member-details.csv",
            type = "data:attachment/text",
            data = "Name,Phone,Status\n";

        for (key in MEMBERS_QUEUE) {
            data += `"${MEMBERS_QUEUE[key][0]}","${key}","${MEMBERS_QUEUE[key][1]}"\n`; //[1]
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
     * Debug function 
     * @params <none>
     * @returns { size, MEMBERS_QUEUE }
     */

    var debug = function () {
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

   
    // Defines the WAXP interface following module pattern
    return {
            start: function(config){
                MEMBERS_QUEUE = {}; //reset
              
                if(config == undefined){
                    console.log('Starting with default options..');
                }else if (typeof config == 'object'){
                    // didn't use ternary op since the else part isn't used
                    if(config.AUTO_SCROLL != undefined) AUTO_SCROLL = config.AUTO_SCROLL;
                    if(config.SCROLL_INCREMENT != undefined) SCROLL_INCREMENT = config.SCROLL_INCREMENT;
                    if(config.SCROLL_INTERVAL_CONSTANT != undefined) SCROLL_INTERVAL_CONSTANT = config.SCROLL_INTERVAL_CONSTANT;
                }else{
                    console.log('Invalid options..starting with default options..')
                }
                start() //calling the private fn
            },
            stop: function(){
                stop()
            },
            resume: function(){
                //resume starts without resetting the MEMBERS_QUEUE
                start()
            },
            downloadCSV: function(){
                downloadAsCSV()
            },
            debug: function () {
                debug()
            }
    }
})();
