/*
    Written by Shan Eapen Koshy
    Date: 14 March 2020
*/

chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        switch(message.type) {
            case "export-all-with-probable-names":
                function start(){
                    try {
                        WAXP.start();
                    } catch (error) {
                        console.log(error,'\nRETRYING in 1 second')
                        setTimeout(start, 1000);
                    }
                }
                start();
                break;
            case "instant-export-unknown-numbers":
                WAXP.download_Unknown_Numbers_Only();
                break;
            case "stopAutoScroll":
                WAXP.stop();
                break;
            case "currentGroup":
                if(document.querySelectorAll("#main > header span")[1]) 
                    sendResponse(document.querySelectorAll("#main > header span")[1].title)
                else sendResponse('')
            break;
        }
    }
);

WAXP = (function(){
    
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    var SCROLL_INTERVAL_CONSTANT = 3000, 
        SCROLL_INCREMENT = 450, 
        AUTO_SCROLL = true, 
        MEMBERS_QUEUE = {},
        TOTAL_MEMBERS;

    var scrollInterval, observer, membersList, header;

    console.log("%c WhatsApp Group Contacts Exporter ","font-size:24px;font-weight:bold;color:white;background:green;");

    var start = function(){
        
        membersList = document.querySelectorAll('span[title=You]')[0]?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode;
        header = document.getElementsByTagName('header')[0];

        if(!membersList){
            document.querySelector("#main > header").firstChild.click();
            membersList = document.querySelectorAll('span[title=You]')[0]?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.parentNode;
            header = document.getElementsByTagName('header')[0];
        }

        observer = new MutationObserver(function (mutations, observer) {   
            scrapeData(); // fired when a mutation occurs
        });
    
        // the div to watch for mutations
        observer.observe(membersList, {
            childList: true,
            subtree: true
        });

        TOTAL_MEMBERS = membersList.parentElement.parentElement.querySelector('span').innerText.match(/\d+/)[0]*1;
        
        // click the `n more` button to show all members
        document.querySelector("span[data-icon=down]")?.click()

        //scroll to top before beginning
        header.nextSibling.scrollTop = 100;
        scrapeData();

        if(AUTO_SCROLL) scrollInterval = setInterval(autoScroll, SCROLL_INTERVAL_CONSTANT);    
    }

    
    /**
     * @description Function to autoscroll the div
     */

    var autoScroll = function (){
        if(!utils.scrollEndReached(header.nextSibling)) 
            header.nextSibling.scrollTop += SCROLL_INCREMENT;
        else
            stop();
    };

    /**
     * @description Stops the current scrape instance
     */

    var stop = function(){
        window.clearInterval(scrollInterval);
        observer.disconnect();
        console.log(`%c Extracted [${utils.queueLength()} / ${TOTAL_MEMBERS}] Members. Starting Download..`,`font-size:13px;color:white;background:green;border-radius:10px;`)
        downloadAsCSV()
    }

    /**
     * @description Function to scrape member data
     */
    var scrapeData = function () {
        var phone, status, name;
        var memberCard = membersList.querySelectorAll(':scope > div');

        for (let i = 0; i < memberCard.length; i++) {

            status = memberCard[i].querySelectorAll('span[title]')[1] ? memberCard[i].querySelectorAll('span[title]')[1].title : "";
            phone = scrapePhoneNum(memberCard[i]);
            name = scrapeName(memberCard[i]);

            if (phone!='NIL' && !MEMBERS_QUEUE[phone]) {
                MEMBERS_QUEUE[phone] = [name, status];
            }

            if(utils.queueLength() >= TOTAL_MEMBERS) {
                stop();
                break;
            }
                
            //console.log(`%c Extracted [${utils.queueLength()} / ${TOTAL_MEMBERS}] Members `,`font-size:13px;color:white;background:green;border-radius:10px;`)
        }
    }

    /**
     * @description scrapes phone no from html node
     * @param {object} el - HTML node
     * @returns {string} - phone number without special chars
     */

    var scrapePhoneNum = function(el){
        var phone;
        if (el.querySelector('img') && el.querySelector('img').src.match(/u=[0-9]*/)) {
           phone = el.querySelector('img').src.match(/u=[0-9]*/)[0].substring(2).replace(/[+\s]/g, '');
        } else {
           var temp = el.querySelector('span[title]').getAttribute('title').match(/(.?)*[0-9]{3}$/);
           phone = temp ? temp[0].replace(/\D/g,'') : 'NIL';
        }
        return phone;
    }
    
    /**
     * @description Scrapes name from HTML node
     * @param {object} el - HTML node
     * @returns {string} - returns name..if no name is present phone number is returned
     */

    var scrapeName = function (el){
        var expectedName;
        expectedName = el.firstChild.firstChild.childNodes[1].childNodes[1].childNodes[1].querySelector('span').innerText;
        if(expectedName == ""){
            return el.querySelector('span[title]').getAttribute('title');
        }
        return expectedName;
    }


    /**
     * @description A utility function to download the result as CSV file
     * @References
     * [1] - https://stackoverflow.com/questions/4617935/is-there-a-way-to-include-commas-in-csv-columns-without-breaking-the-formatting
     * 
     */
    var downloadAsCSV = function () {

        var groupName = document.querySelectorAll("#main > header span")[1].title;
        var fileName = groupName.replace(/[^\d\w\s]/g,'') ? groupName.replace(/[^\d\w\s]/g,'') : 'WAXP-group-members';

        var name = `${fileName}.csv`, data = "Name,Phone,Status\n";

        for (key in MEMBERS_QUEUE) {
            // Wrapping each variable around double quotes to prevent commas in the string from adding new cols in CSV
            // replacing any double quotes within the text to single quotes
            data += `"${MEMBERS_QUEUE[key][0]}","${key}","${MEMBERS_QUEUE[key][1].replace(/\"/g,"'")}"\n`;
        }
        utils.createDownloadLink(data,name);
    }

    var download_Unknown_Numbers_Only = function(){

        var members = document.querySelectorAll("#main > header span")[2].title.replace(/ /g,'').split(','), unSavedContacts;
        for (i=0; i < members.length ;++i){
            if(!members[i].match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)) continue;
            else{
                unSavedContacts = members.splice(i);
                break;
            }
        }
        unSavedContacts.pop(); //removing 'YOU' from array

        if(unSavedContacts.length > 0){
            var groupName = document.querySelectorAll("#main > header span")[1].title;
            var fileName = groupName.replace(/[^\d\w\s]/g,'') ? groupName.replace(/[^\d\w\s]/g,'') : 'WAXP-group-members';

            var name = `${fileName}.csv`, data = "Phone Number\n";
            for (i in unSavedContacts) {
                data += `${unSavedContacts[i]}\n`;
            }   
            utils.createDownloadLink(data,name);
        }else{
            alert('No unsaved numbers exists in this group');
        }
    }

    /**
     * @description Helper functions
     * @references [1] https://stackoverflow.com/questions/53158796/get-scroll-position-with-reactjs/53158893#53158893
     */

    var utils = (function(){

        return {
           scrollEndReached: function(el){
               if((el.scrollHeight - (el.clientHeight + el.scrollTop)) == 0)
                    return true;
                return false;
           },
           queueLength: function() {
               var size = 0, key;
               for (key in MEMBERS_QUEUE) {
                   if (MEMBERS_QUEUE.hasOwnProperty(key)) size++;
               }
               return size;
           },
           createDownloadLink: function (data,name) {
               var a = document.createElement('a');
               a.style.display = "none";

               var url = window.URL.createObjectURL(new Blob([data], {
                   type: "data:attachment/text"
               }));
               a.setAttribute("href", url);
               a.setAttribute("download", name);
               document.body.append(a);
               a.click();
               window.URL.revokeObjectURL(url);
               a.remove();
           }
        }
    })();

   
    // Defines the WAXP interface following module pattern
    return {
            start: function(config){
                MEMBERS_QUEUE = {}; //reset
              
                if(config == undefined){
                    console.log("%cExtraction started with default options..%c ",'font-size:20px;',  'font-size:25px;background:url(https://i.gifer.com/ZlXo.gif) no-repeat; background-size:contain;display:flex;vertical-align:text-top');
                }else if (typeof config == 'object'){
                    // didn't use ternary op since the else part isn't used
                    if(config.AUTO_SCROLL != undefined) AUTO_SCROLL = config.AUTO_SCROLL;
                    if(config.SCROLL_INCREMENT != undefined) SCROLL_INCREMENT = config.SCROLL_INCREMENT;
                    if(config.SCROLL_INTERVAL_CONSTANT != undefined) SCROLL_INTERVAL_CONSTANT = config.SCROLL_INTERVAL_CONSTANT;
                    console.log("%cExtraction started with given options..%c ",'font-size:20px;',  'font-size:25px;background:url(https://i.gifer.com/ZlXo.gif) no-repeat; background-size:contain;display:flex;vertical-align:text-top');
                }else{
                    console.log("%cInvalid options..Extraction started with default options instead..%c ",'font-size:20px;',  'font-size:25px;background:url(https://i.gifer.com/ZlXo.gif) no-repeat; background-size:contain;display:flex;vertical-align:text-top');
                }
                start()
            },
            stop: function(){
                stop()
            },
            resumeManually: function(){
                //resume starts without resetting the MEMBERS_QUEUE
                AUTO_SCROLL = false;
                start();
            },
            download_Unknown_Numbers_Only: function(){
                download_Unknown_Numbers_Only()
            },
            download_All_Contacts_With_Names: function(){
                downloadAsCSV()
            },
            debug: function(){
                return {
                    size: utils.queueLength(),
                    q: MEMBERS_QUEUE,
                    globals: function(){
                        // Show the current global variables
                      console.log({
                        'SCROLL_INTERVAL_CONSTANT': SCROLL_INTERVAL_CONSTANT,
                        'SCROLL_INCREMENT': SCROLL_INCREMENT,
                        'AUTO_SCROLL': AUTO_SCROLL,
                        'TOTAL_MEMBERS': TOTAL_MEMBERS
                        });
                    }
                }
            }
    }
})();