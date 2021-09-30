// ==UserScript==
// @name         WFTU nomination Notify
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  show nomination Status updates
// @author       AlterTobi
// @match        https://wayfarer.nianticlabs.com/*
// @downloadURL  https://github.com/AlterTobi/WayFarer-Toolkit-Userscripts/raw/release/nominationNotify.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function addCSS(){
    	let myID = 'nominationNotifyCSS';
    	//already there?
    	if ( null === document.getElementById(myID)) {
            let headElem = document.getElementsByTagName("HEAD")[0];
            let customStyleElem = document.createElement("style");
            customStyleElem.setAttribute('id',myID);
            customStyleElem.innerText = `
	            #wftuNotify{
				  position: absolute;
				  bottom: 1em;
				  right: 1em;
				  width: 30em;
				  z-index: 100;
				}
				.wftuNotification{
				  border-radius: 0.5em;
				  background-color: #3e8e41CC;
				  padding: 1em;
				  margin-top: 1.5em;
				  color: white;
				}
				.wftuNotifyCloseButton{
				  float: right;
				}


    `;
            headElem.appendChild(customStyleElem);
    	}
    }

    function createNotificationArea() {
    	let myID = "wftuNotify"
    	if ( null === document.getElementById(myID)) {
			var container = document.createElement("div");
			container.id = myID;
			document.getElementsByTagName("html")[0].appendChild(container);
    	}
	}

	function createNotification(message){
		var notification = document.createElement("div");
		notification.setAttribute("class", "wftuNotification");
		notification.onclick = function(){
			notification.remove();
		};

		var content = document.createElement("p");
		content.innerText = message;

		//Purely aesthetic (The whole div closes the notification)
		var closeButton = document.createElement("div");
		closeButton.innerText = "X";
		closeButton.setAttribute("class", "wftuNotifyCloseButton");
		closeButton.setAttribute("style", "cursor: pointer;");

		notification.appendChild(closeButton);
		notification.appendChild(content);

		document.getElementById("wftuNotify").appendChild(notification);
	}

	//Useful to make comparing easier. Essentially this function iterates over all nominations
	//and uses it's unique ID as key and stores relevant values under that key.
	//This way on checking we can simply find the ID when looking at a current state nomination
	//and immediately find it's previous state.
	function makeNominationDictionary(nomList){
		var dict = {};
		for (var i = 0; i < nomList.length; i++){
			var nom = nomList[i];
			dict[nom.id] = nom;
		}
		return dict;
	}

	function detectChange(){
        console.log('WFTU nomination Notify: detectChange');

		let nomList = window.wft.nominationsApp.listData.nominationsList.nominations;

		if (localStorage.wftuNomList === undefined){
			// first run
			if (localStorage.wfpNomList === undefined) {
				localStorage.wftuNomList = JSON.stringify(makeNominationDictionary(nomList));
			} else {
				// import WF+ Data
				localStorage.wftuNomList = localStorage.wfpNomList;
			}
		}else{
			//Only makes sense to look for change if we have data of the previous state!

			var historyDict = JSON.parse(localStorage.wftuNomList);

			for (var i = 0; i < nomList.length; i++){
				var nom = nomList[i];
				var historicalData = historyDict[nom.id];

				if (historicalData === undefined) {
					continue; //Skip to next as this is a brand new entry so we don't know it's previous state
                }
				// upgrade?
				if (historicalData.upgraded === false && nom.upgraded === true){
					createNotification(`${nom.title} was upgraded!`)
				}
				//In queue -> In voting
				if (historicalData.status !== "VOTING" && nom.status === "VOTING"){
					createNotification(`${nom.title} went into voting!`);
				}else if (historicalData.status !== "ACCEPTED" && historicalData.status !== "REJECTED" && historicalData.status !== "DUPLICATE"){
					if (nom.status === "ACCEPTED") {
						createNotification(`${nom.title} was accepted!`);
					}else if(nom.status === "REJECTED"){
						createNotification(`${nom.title} was rejected!`);
					}else if(nom.status === "DUPLICATE"){
						createNotification(`${nom.title} was marked as a duplicate!`);
					}
				}
			}

			//Store the new state
			localStorage.wftuNomList = JSON.stringify(makeNominationDictionary(nomList));
		}
	}

    function NominationPageLoaded() {
    	console.log('WFTU nomination Notify: NominationPageLoaded loaded');
    	addCSS();
    	createNotificationArea();
    	detectChange();
    }

    let loadNomTimerId = null;
    window.addEventListener("WFTNominationListLoad",
    		() => { clearTimeout(loadNomTimerId); loadNomTimerId = setTimeout(NominationPageLoaded,250)});

    console.log('WFTU Script loaded: nomination Notify');
})();
