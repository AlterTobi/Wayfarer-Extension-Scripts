// ==UserScript==
// @name         WFTU Open In
// @namespace    http://tampermonkey.net/
// @version      0.2.3
// @description  add "Open In" for maps
// @author       AlterTobi
// @match        https://wayfarer.nianticlabs.com/*
// @downloadURL  https://github.com/AlterTobi/WayFarer-Toolkit-Userscripts/raw/release/OpenIn.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // map URLs, %lat%, %lng% will be replaced by nominations coordinates
    let customMaps = [
    	{ title: "Google", url: "https://maps.google.com/maps?q=%lat%,%lng%"},
    	{ title: "Intel", url: "https://intel.ingress.com/intel?ll=%lat%,%lng%&z=18"},
    	{ title: "OSM", url: "https://www.openstreetmap.org/?mlat=%lat%&mlon=%lng%#map=18/%lat%/%lng%"}
    ];

    let tryCounter = 0;
    let buttonID = 'openInButton';

    function addCSS(){
    	let myID = 'openInCSS';
    	//already there?
    	if ( null === document.getElementById(myID)) {
            let headElem = document.getElementsByTagName("HEAD")[0];
            let customStyleElem = document.createElement("style");
            customStyleElem.setAttribute('id',myID);
            customStyleElem.innerText = `
    			.mapsDropdown {
    			  background-color: white;
    			  border-radius: 5px;
    			  box-shadow: grey 2px 2px 10px;
    			  margin-bottom: .5em;
    			  font-size: 1.1em;
    			  color: black;
    			  padding: .25em;
    			  width: 7em;
    			  text-align: center;
    			}
    			.dropdown-content {
    			  display: none;
    			  position: absolute;
    			  /* left: -.25em; */
    			  transform: translateY(-100%);
    			  border-radius: 5px;
    			  background-color: #f9f9f9;
    			  min-width: 160px;
    			  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    			  z-index: 9001;
    			}
    			.dropdown-content a {
    			  color: black;
    			  padding: 12px 16px;
    			  text-decoration: none;
    			  display: block;
    			}
    			.dropdown-content a:hover {
    			  background-color: #f1f1f1
    			  border-radius: 5px;
    			}
    			.mapsDropdown:hover .dropdown-content {
    			  display: block;
    			}
    			.mapsDropdown:hover .dropbtn {
    			  background-color: #3e8e41;
    			}
    `;
            headElem.appendChild(customStyleElem);
    	}
    }

    function getMapDropdown(lat, lng){
    	//Create main dropdown menu ("button")
    	let mainButton = document.createElement("div");
    	mainButton.setAttribute("class","mapsDropdown");
    	mainButton.id = buttonID;

    	let buttonText = document.createElement("span");
    	buttonText.innerText = "Open in ...";

    	let dropdownContainer = document.createElement("div");
    	dropdownContainer.setAttribute("class", "dropdown-content");
    	dropdownContainer.innerHTML = null;

    	mainButton.appendChild(dropdownContainer);
    	mainButton.appendChild(buttonText);

    	// let customMaps = JSON.parse(settings["customMaps"]); settings später vielleicht
    	if (customMaps.length === 0){
    		let emptySpan = document.createElement("span");
    		emptySpan.innerText = "No custom maps set!";
    		dropdownContainer.appendChild(emptySpan);
    	} else {
        	for (let i=0; i < customMaps.length; i++){
        		let title = customMaps[i].title;
        		let link = customMaps[i].url;

        		//Link editing:
        		link = link.replace(/%lat%/g, lat).replace(/%lng%/g, lng);

        		let button = document.createElement("a");
        		button.href = link;
       			button.setAttribute("target", getStringHash(customMaps[i].url));
                // On URL with placeholders as those are the same between different wayspots but not between different maps!
        		button.innerText = title;
        		dropdownContainer.appendChild(button);
        	}
    	}
    	return mainButton;
    }

    //NON-SECURE (But good enough for uniqueID on URLs)
    function getStringHash(str){
        var hash = 0;
        if (str.length === 0) {
            return hash;
        }
        for (var i = 0; i < str.length; i++) {
            var char = str.charCodeAt(i);
            hash = ((hash<<5)-hash)+char;
            hash = hash & hash;
        }
        return hash;
    }

    function addDropdownReview() {
        let elem, elemlist;

        console.warn('WFTU addDropdownReview triggered - ', window.wft.reviewApp.pageData.type);
        addCSS();
    	let mainButton = getMapDropdown(window.wft.reviewApp.pageData.lat, window.wft.reviewApp.pageData.lng);

    	switch (window.wft.reviewApp.pageData.type) {
    		case "NEW":
                elem = document.getElementById("location-accuracy-card");
                if (null === elem) {
                    if (tryCounter++ > 10) {
                        console.warn('WFTU - Open In - no DOM - abort');
                    } else {
                        setTimeout(addDropdownReview,100);
                    }
                    return;
                }
                tryCounter = 0;
    			elem.children[2].insertAdjacentElement('afterbegin', mainButton);
    			break;
    		case "EDIT":
                console.log('WFTU -- EDIT');
                elemlist = document.getElementsByClassName("review-edit-info card p-4 ng-star-inserted");
                elem = elemlist[elemlist.length-1];
                elem.insertAdjacentElement('afterEnd', mainButton);
    			break;
    		case "PHOTO":
                console.log('WFTU -- PHOTO');
                elem = document.getElementsByClassName("review-photo__info")[0];
                elem.children[0].insertAdjacentElement('beforeend', mainButton);
    			break;
    	}
        console.log('addDropdownReview loaded');
    }

    function NominationPageLoaded() {
        addCSS();
        console.log('NominationPageLoaded loaded');
    }

    function addDropdownNomination(){
    	let elem;
    	// remove existing first
    	let button = document.getElementById(buttonID);
    	if (button !== null) {
    		button.parentNode.removeChild(button);
    	}
        let mainButton = getMapDropdown(window.wft.nominationsApp.selectedNomination.nomination.lat, window.wft.nominationsApp.selectedNomination.nomination.lng);
        elem = document.getElementsByClassName("details-pane__map")[0];
        elem.parentNode.appendChild(mainButton);
        console.log('addDropdownNomination loaded');
    }

    let selNomTimerId = null;
    let loadNomTimerId = null;

    window.addEventListener("WFTReviewPageLoad", () => {setTimeout(addDropdownReview,100)});
    window.addEventListener("WFTNominationSelected", () => { clearTimeout(selNomTimerId); selNomTimerId = setTimeout(addDropdownNomination,250)});
    window.addEventListener("WFTNominationListLoad", () => { clearTimeout(loadNomTimerId); loadNomTimerId = setTimeout(NominationPageLoaded,250)});

    console.log('WFTU Script loaded: Open In');
})();
