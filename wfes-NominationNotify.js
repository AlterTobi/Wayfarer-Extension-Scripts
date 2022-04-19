// @name         Nomination Notify
// @version      1.0.3
// @description  show nomination status updates
// @author       AlterTobi

(function() {
    'use strict';

    const lStoreList = 'wfesNomList';
    const lStoreVersion = 'wfesNomListVersion';
    const lCanAppeal = 'wfes_CurrentAppealState';
    const states = ['ACCEPTED','REJECTED','VOTING','DUPLICATE','WITHDRAWN','NOMINATED','APPEALED','NIANTIC_REVIEW','HELD'];

    const myCssId = 'nominationNotifyCSS';
    const myStyle = `
                #wfesNotify{
                position: absolute;
                bottom: 1em;
                right: 1em;
                width: 30em;
                z-index: 100;
                }
                .wfesNotification{
                border-radius: 0.5em;
                padding: 1em;
                margin-top: 1.5em;
                color: white;
                }
                .wfesBgGreen{
                background-color: #3e8e41CC;
                }
                .wfesBgRed{
                background-color: #CC0000B0;
                }
                .wfesBgOrange{
                background-color: #FC9000D0;
                }
                .wfesBgBlue{
                background-color: #0010DFD0;
                }
                .wfesNotifyCloseButton{
                float: right;
                }
                `;

    function createNotificationArea() {
        let myID = "wfesNotify";
        if ( null === document.getElementById(myID)) {
            let container = document.createElement("div");
            container.id = myID;
            document.getElementsByTagName("body")[0].appendChild(container);
        }
    }

    function createNotification(message, color = 'green'){
        let notification = document.createElement("div");
        switch (color) {
            case 'red':
                notification.setAttribute("class", "wfesNotification wfesBgRed");
                break;
            case 'orange':
                notification.setAttribute("class", "wfesNotification wfesBgOrange");
                break;
            case 'blue':
                notification.setAttribute("class", "wfesNotification wfesBgBlue");
                break;
            default:
                notification.setAttribute("class", "wfesNotification wfesBgGreen");
                break;
        }
        notification.onclick = function(){
            notification.remove();
        };

        let content = document.createElement("p");
        content.innerText = message;

        // Purely aesthetic (The whole div closes the notification)
        let closeButton = document.createElement("div");
        closeButton.innerText = "X";
        closeButton.setAttribute("class", "wfesNotifyCloseButton");
        closeButton.setAttribute("style", "cursor: pointer;");

        notification.appendChild(closeButton);
        notification.appendChild(content);

        document.getElementById("wfesNotify").appendChild(notification);
    }

    function getCurrentDateStr(){
        return new Date().toISOString().substr(0,10);
    }

    function checkAppeal() {
        let canAppeal = window.wfes.g.canAppeal();
        let savedState = JSON.parse(localStorage.getItem(lCanAppeal)) || false;
        if (!savedState) {
            if(canAppeal) {
                createNotification('new Appeal available', 'red');
                window.wfes.f.localSave(lCanAppeal,true);
            }
        } else {
            if(!canAppeal) {
                window.wfes.f.localSave(lCanAppeal,false);
            }
        }
    }

    function checkNomListVersion() {
        let version = JSON.parse(localStorage.getItem(lStoreVersion)) || 0;
        if (version < 1) {
            console.warn('NomListVersion less then 1, converting');
            // convert Dates
            let historyDict = JSON.parse(localStorage.getItem(lStoreList)) || [];
            let myDates;
            // only if we have any saved data
            for (let histID in historyDict){
                myDates = [];
                for (let dat in historyDict[histID].Dates) {
                  myDates.push([historyDict[histID].Dates[dat],dat]);
                }
                historyDict[histID].wfesDates = myDates;
                delete historyDict[histID].Dates;
            }
            window.wfes.f.localSave(lStoreList,historyDict);
            window.wfes.f.localSave(lStoreVersion,1);
        }
    }

    function detectChange(){
        let nomList = window.wfes.g.nominationsList();
        let historyDict = JSON.parse(localStorage.getItem(lStoreList)) || [];
        // const missingDict = detectMissing();

        if ( 0 === historyDict.length){
            // first run, import from Wayfarer+, if exists
            let wfpList = JSON.parse(localStorage.getItem('wfpNomList'));
            if (wfpList === null) {
                window.wfes.f.localSave(lStoreList, window.wfes.f.makeIDbasedDictionary(nomList));
            } else {
                // import WF+ Data
                window.wfes.f.localSave(lStoreList, wfpList);
            }
        }else{
            // Only makes sense to look for change if we have data
            // of the previous state!
            let today = getCurrentDateStr();
            let myDates, historicalData, nom;

            for (let i = 0; i < nomList.length; i++){
                nom = nomList[i];
                historicalData = historyDict[nom.id];
                myDates = [];

                // detect unknown states
                if (!states.includes(nom.status)) {
                    createNotification(`${nom.title} has unknown state: ${nom.status}`,'blue');
                }

                if (historicalData === undefined) {
                    myDates.push([today,nom.status]); // save current date and
                                                    // status
                    nom.wfesDates = myDates;
                    continue; // Skip to next as this is a brand new
                    // entry so we don't know it's previous
                    // status
                } else {
                    // get saved dates - if they exist
                    if (undefined !== historicalData.wfesDates) {
                        myDates = historicalData.wfesDates;
                    }
                }

                // upgrade?
                if (historicalData.upgraded === false && nom.upgraded === true){
                    myDates.push([today,'UPGRADE']);
                    createNotification(`${nom.title} was upgraded!`);
                }

                // Niantic Review?
                if (historicalData.isNianticControlled === false && nom.isNianticControlled === true){
                    createNotification(`${nom.title} went into Niantic review!`, 'red');
                }

                // was missing?
                if ((historicalData.status === "MISSING")){
                    createNotification(`${nom.title} returned`, 'orange');
                }
                // In queue -> In voting
                if ((historicalData.status !== "VOTING") && (nom.status === "VOTING")){
                    createNotification(`${nom.title} went into voting!`);
                }else if (historicalData.status !== "ACCEPTED" && historicalData.status !== "REJECTED" && historicalData.status !== "DUPLICATE"){
                    if (nom.status === "ACCEPTED") {
                        createNotification(`${nom.title} was accepted!`);
                    }else if(nom.status === "REJECTED"){
                        createNotification(`${nom.title} was rejected!`);
                    }else if(nom.status === "DUPLICATE"){
                        createNotification(`${nom.title} was marked as a duplicate!`);
                    }
                } else if ((historicalData.status !== "APPEALED") && (nom.status === "APPEALED")){
                    createNotification(`${nom.title} was appealed!`);
                }

                // save Date if state changes
                if (historicalData.status !== nom.status){
                        myDates.push([today,nom.status]);
                }

                nom.wfesDates = myDates;
                nomList[i] = nom;
            }

            // Store the new state

            let nomDict = window.wfes.f.makeIDbasedDictionary(nomList);
            window.wfes.f.localSave(lStoreList,nomDict);
// let fullDict = Object.assign(nomDict,missingDict);
// window.wfes.f.localSave(lStoreList,fullDict);
        }
    }

/*
 * function detectMissing(){ // check if saved nomination is not in current list //
 * might be in review by Niantic staff let nomDict =
 * window.wfes.f.makeIDbasedDictionary(window.wfes.g.nominationsList()); let
 * historyDict = JSON.parse(localStorage.getItem(lStoreList)) || []; let today =
 * getCurrentDateStr(); let missingDict = {}; let miss = {};
 * 
 * for (let histID in historyDict){ if (undefined === nomDict[histID]){ //
 * missing miss = historyDict[histID]; if ((miss.status !== "MISSING")){
 * miss.wfesDates.push([today,'MISSING']); miss.status = 'MISSING';
 * createNotification(`${miss.title} is missing`,'red'); } missingDict[histID] =
 * miss; } } return missingDict; }
 */
    function NominationPageLoaded() {
        window.wfes.f.addCSS(myCssId,myStyle);
        createNotificationArea();
        checkNomListVersion();
        detectChange();
        checkAppeal();
    }

    function NominationSelected() {
        window.wfes.f.addCSS(myCssId,myStyle);
        let nomDetail = window.wfes.g.nominationDetail();
        const myID = nomDetail.id;
        let historyDict = JSON.parse(localStorage.getItem(lStoreList)) || [];
        let myDates = historyDict[myID].wfesDates || [];
        let elem = window.document.querySelector('div.card.details-pane > div.flex.flex-row > span');
        // Inhalt entfernen
        while (elem.childNodes.length > 0) {
            elem.removeChild(elem.firstChild);
        }
        elem.innerText = '';
        let p = document.createElement("p");
        p.innerText = nomDetail.day + ' - NOMINATED';
        elem.appendChild(p);
        for ( let i = 0 ; i < myDates.length; i++) {
            if ((0 === i ) && ('NOMINATED' === myDates[i][1])) {
                continue;
            }
            p = document.createElement("p");
            p.innerText = myDates[i][0] + ' - ' + myDates[i][1];
            elem.appendChild(p);
        }
    }

    function garbageCollection(){
        // remove old entries, if new ones exist
        if (Object.prototype.hasOwnProperty.call(localStorage,lStoreList)){
            if(localStorage.hasOwnProperty('wfpNomList')){
                localStorage.removeItem('wfpNomList');
            }
        }
        if (Object.prototype.hasOwnProperty.call(localStorage,lStoreList)){
            if(Object.prototype.hasOwnProperty.call(localStorage,'wftuNomList')){
                localStorage.removeItem('wftuNomList');
            }
        }
    }

    let loadNomTimerId = null;
    window.addEventListener("WFESNominationListLoaded",
                            () => { clearTimeout(loadNomTimerId); loadNomTimerId = setTimeout(NominationPageLoaded,250);});
    window.addEventListener("WFESNominationDetailLoaded",() => {setTimeout(NominationSelected,10);});
    garbageCollection();

    console.log("Script loaded:", GM_info.script.name, 'v' + GM_info.script.version);
})();
