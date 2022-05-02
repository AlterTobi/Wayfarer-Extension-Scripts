// ==UserScript==
// @name         WFES - show Wayfarer version
// @namespace    https://github.com/AlterTobi/WFES/
// @version      0.9.3
// @description  WFES - show current Wayfarer version
// @author       AlterTobi
// @match        https://wayfarer.nianticlabs.com/*
// @icon         https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @downloadURL  https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-showWFVersion.user.js
// @updateURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-showWFVersion.user.js
// @supportURL   https://github.com/AlterTobi/WFES/issues
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let versionDivID = 'wfVersionDiv';

    function addCSS() {
        let myID = 'wfVersionCSS';
        // already there?
        if ( null === document.getElementById(myID)) {
            let headElem = document.getElementsByTagName("head")[0];
            let customStyleElem = document.createElement("style");
            customStyleElem.setAttribute('id',myID);
            customStyleElem.innerText = `.wfVersionCSS {
                position: absolute;
                z-index: 9999;
                left: 15px;
                top: 10px;
                background-color: white;
                border: 2px solid red;
                padding: 5px; box-shadow: 7px 7px 5px grey;}
                `;
            headElem.appendChild(customStyleElem);
        }
    }
    function showVersion() {
        addCSS();
        if (null === document.getElementById(versionDivID)) {
            let bodyElem = document.getElementsByTagName("body")[0];
            let versionDiv = document.createElement("div");
            versionDiv.setAttribute('class','wfVersionCSS');
            versionDiv.innerText = 'version: ' + window.wfes.properties.version;
            bodyElem.appendChild(versionDiv);
        } else {
            let versionDiv = document.getElementById(versionDivID);
            versionDiv.innerText = 'version: ' + window.wfes.properties.version;
        }
    }

    window.addEventListener("WFESPropertiesLoaded", showVersion);
    window.addEventListener("WFESHomePageLoaded", showVersion);
    window.addEventListener("WFESProfileLoaded", showVersion);
    window.addEventListener("WFESNominationListLoaded", showVersion);

    /* we are done :-) */
    console.log("Script loaded:", GM_info.script.name, 'v' + GM_info.script.version);
})();