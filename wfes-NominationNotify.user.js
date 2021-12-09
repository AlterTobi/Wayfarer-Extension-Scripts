// ==UserScript==
// @name         WFES - Nomination Notify
// @namespace    https://github.com/AlterTobi/WFES/
// @version      0.6.0
// @description  show nomination status updates
// @author       AlterTobi
// @match        https://wayfarer.nianticlabs.com/*
// @downloadURL  https://github.com/AlterTobi/WFES/raw/main/wfes-NominationNotify.user.js
// @icon         https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @supportURL   https://github.com/AlterTobi/WFES/issues
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const lStoreList = 'wfesNomList';
    const states = ['ACCEPTED','REJECTED','VOTING','DUPLICATE','WITHDRAWN','NOMINATED','APPEALED'];

    function localSave(name,content){
        let json = JSON.stringify(content);
        localStorage.setItem(name,json);
    }

    function addCSS(){
        let myID = 'nominationNotifyCSS';
        // already there?
        if ( null === document.getElementById(myID)) {
            let headElem = document.getElementsByTagName("HEAD")[0];
            let customStyleElem = document.createElement("style");
            customStyleElem.setAttribute('id',myID);
                customStyleElem.innerText = `
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
            headElem.appendChild(customStyleElem);
        }
    }

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

    // Useful to make comparing easier. Essentially this function iterates
    // over all nominations and uses it's unique ID as key and stores relevant
    // values under that key.
    // This way on checking we can simply find the ID when looking at a
    // current state nomination and immediately find it's previous state.
    function makeNominationDictionary(nomList){
        let dict = {};
        for (let i = 0; i < nomList.length; i++){
            let nom = nomList[i];
            dict[nom.id] = nom;
        }
        return dict;
    }

    function getCurrentDateStr(){
        return new Date().toISOString().substr(0,10);
    }

    function detectChange(){
        // make a copy
        let nomList = JSON.parse(JSON.stringify(window.wfes.nominations.list));
        let historyDict = JSON.parse(localStorage.getItem(lStoreList)) || [];
        // const missingDict = detectMissing();

        if ( 0 === historyDict.length){
            // first run, import from Wayfarer+, if exists
            let wfpList = JSON.parse(localStorage.getItem('wfpNomList'));
            if (wfpList === null) {
                localSave(lStoreList, makeNominationDictionary(nomList));
            } else {
                // import WF+ Data
                localSave(lStoreList, wfpList);
            }
        }else{
            // Only makes sense to look for change if we have data
            // of the previous state!
            let today = getCurrentDateStr();
            let myDates, historicalData, nom;

            for (let i = 0; i < nomList.length; i++){
                nom = nomList[i];
                historicalData = historyDict[nom.id];
                myDates = {};

                // detect unknown states
                if (!states.includes(nom.status)) {
                    createNotification(`${nom.title} has unknown state: ${nom.status}`,'blue');
                }

                if (historicalData === undefined) {
                    myDates[nom.status] = today; // save current date and
                                                 // state
                    nom.Dates = myDates;
                    continue; // Skip to next as this is a brand new
                    // entry so we don't know it's previous
                    // state
                } else {
                    // get saved dates - if they exist
                    if (undefined !== historicalData.Dates) {
                        myDates = historicalData.Dates;
                    }
                }

                // upgrade?
                if (historicalData.upgraded === false && nom.upgraded === true){
                    myDates.UPGRADE = today;
                    createNotification(`${nom.title} was upgraded!`);
                }

                // Niantic Review?
                if (historicalData.isNianticControlled === false && nom.isNianticControlled === true){
                    myDates.NIANTICREVIEW = today;
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

                // save Dates of each state change
                for (let j = 0; j < states.length; j++) {
                    if (historicalData.status !== states[j] && nom.status === states[j]){
                        myDates[states[j]] = today;
                    }
                }

                nom.Dates = myDates;
                nomList[i] = nom;
            }

            // Store the new state

            let nomDict = makeNominationDictionary(nomList);
            localSave(lStoreList,nomDict);
// let fullDict = Object.assign(nomDict,missingDict);
// localSave(lStoreList,fullDict);
        }
    }

    function detectMissing(){
        // check if saved nomination is not in current list
        // might be in review by Niantic staff
        let nomDict = makeNominationDictionary(window.wfes.nominations.list);
        let historyDict = JSON.parse(localStorage.getItem(lStoreList)) || [];
        let today = getCurrentDateStr();
        let missingDict = {};
        let myDates = {};
        let miss = {};

        for (let histID in historyDict){
            if (undefined === nomDict[histID]){
                // missing
                miss = historyDict[histID];
                if ((miss.status !== "MISSING")){
                    miss.Dates.MISSING = today;
                    miss.status = 'MISSING';
                    createNotification(`${miss.title} is missing`,'red');
                }
                missingDict[histID] = miss;
            }
        }
        return missingDict;
    }

    function NominationSelected() {
        addCSS();
        const myID = window.wfes.nominations.detail.id;
        let historyDict = JSON.parse(localStorage.getItem(lStoreList)) || [];
        let myDates = historyDict[myID].Dates || {};
        let elem = window.document.querySelector('div.card.details-pane > div.flex.flex-row > span');
        // Inhalt entfernen
        while (elem.childNodes.length > 0) {
            elem.removeChild(elem.firstChild);
        }
        elem.innerText = '';
        let p = document.createElement("p");
        p.innerText = window.wfes.nominations.detail.day + ' - NOMINATED';
        elem.appendChild(p);
        for ( let dat in myDates) {
            if ('NOMINATED' === dat) {
                continue;
            }
            p = document.createElement("p");
            p.innerText = myDates[dat] + ' - ' + dat;
            elem.appendChild(p);
        }
    }

    function NominationPageLoaded() {
        addCSS();
        createNotificationArea();
        detectChange();
    }

    let loadNomTimerId = null;
    window.addEventListener("WFESNominationListLoaded",
                            () => { clearTimeout(loadNomTimerId); loadNomTimerId = setTimeout(NominationPageLoaded,250);});
    window.addEventListener("WFESNominationDetailLoaded",() => {setTimeout(NominationSelected,10);});

    console.log('WFES Script loaded: Nomination Notify');
})();
