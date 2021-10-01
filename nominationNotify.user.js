// ==UserScript==
// @name         WFES - Nomination Notify
// @namespace    https://gitlab.com/fotofreund0815/WFES
// @version      0.2.1
// @description  show nomination status updates
// @author       AlterTobi
// @match        https://wayfarer.nianticlabs.com/*
// @downloadURL  https://github.com/AlterTobi/WFES/raw/main/nominationNotify.user.js
// @icon         https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @supportURL   https://github.com/AlterTobi/WFES/issues
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const lStoreList = 'wfesNomList';

    function localSave(name,content){
        let json = JSON.stringify(content)
        localStorage.setItem(name,json)
    }

    function addCSS(){
    	let myID = 'nominationNotifyCSS';
    	//already there?
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
				  background-color: #3e8e41CC;
				  padding: 1em;
				  margin-top: 1.5em;
				  color: white;
				}
				.wfesNotifyCloseButton{
				  float: right;
				}
    `;
            headElem.appendChild(customStyleElem);
    	}
    }

    function createNotificationArea() {
    	let myID = "wfesNotify"
    	if ( null === document.getElementById(myID)) {
			let container = document.createElement("div");
			container.id = myID;
			document.getElementsByTagName("body")[0].appendChild(container);
    	}
    }

	function createNotification(message){
		let notification = document.createElement("div");
		notification.setAttribute("class", "wfesNotification");
		notification.onclick = function(){
			notification.remove();
		};

		let content = document.createElement("p");
		content.innerText = message;

		//Purely aesthetic (The whole div closes the notification)
		let closeButton = document.createElement("div");
		closeButton.innerText = "X";
		closeButton.setAttribute("class", "wfesNotifyCloseButton");
		closeButton.setAttribute("style", "cursor: pointer;");

		notification.appendChild(closeButton);
		notification.appendChild(content);

		document.getElementById("wfesNotify").appendChild(notification);
	}

	//Useful to make comparing easier. Essentially this function iterates over all nominations
	//and uses it's unique ID as key and stores relevant values under that key.
	//This way on checking we can simply find the ID when looking at a current state nomination
	//and immediately find it's previous state.
	function makeNominationDictionary(nomList){
		let dict = {};
		for (let i = 0; i < nomList.length; i++){
			let nom = nomList[i];
			dict[nom.id] = nom;
		}
		return dict;
	}

	function detectChange(){
		let nomList = window.wfes.nominations.list;
		let historyDict = JSON.parse(localStorage.getItem(lStoreList)) || [];

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
			//Only makes sense to look for change if we have data of the previous state!
		    let today = new Date().toISOString().substr(0,10);
		    const states = ['ACCEPTED','REJECTED','VOTING','DUPLICATE','WITHDRAWN','NOMINATED'];

		    for (let i = 0; i < nomList.length; i++){
			let nom = nomList[i];
			let historicalData = historyDict[nom.id];
			let myDates = {};

			if (historicalData === undefined) {
			    myDates[nom.status] = today; // save current date and state
			    nom.Dates = myDates;
			    continue; //Skip to next as this is a brand new entry so we don't know it's previous state
                        } else {
                         // get saved dates
                            myDates = historicalData.Dates;
                        }

			// upgrade?
			if (historicalData.upgraded === false && nom.upgraded === true){
			    myDates.UPGRADE = today;
			    createNotification(`${nom.title} was upgraded!`);
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

			// save Dates of each state change
                        for (let j = 0; j < states.length; j++) {
                                if (historicalData.status !== states[j] && nom.status === states[j]){
                                        myDates[states[j]] = today;
                                }
                        }

                        nom.Dates = myDates;
                        nomList[i] = nom;
		}

		//Store the new state
		localSave(lStoreList,makeNominationDictionary(nomList));
		}
	}

    function NominationPageLoaded() {
    	addCSS();
    	createNotificationArea();
    	detectChange();
    }

    let loadNomTimerId = null;
    window.addEventListener("WFESNominationListLoaded",
    		() => { clearTimeout(loadNomTimerId); loadNomTimerId = setTimeout(NominationPageLoaded,250)});

    console.log('WFES Script loaded: Nomination Notify');
})();
