// ==UserScript==
// @name         WFES - Userscript
// @namespace    https://github.com/AlterTobi/WFES/
// @version      0.9.0
// @description  WFES 
// @author       AlterTobi
// @match        https://wayfarer.nianticlabs.com/*
// @icon         https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @downloadURL  https://github.com/AlterTobi/WFES/raw/release/v0.9/wfes-template.user.js
// @updateURL    https://github.com/AlterTobi/WFES/raw/release/v0.9/wfes-template.user.js
// @supportURL   https://github.com/AlterTobi/WFES/issues
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function myTemplate() {
        // CODE HERE
    }

    window.addEventListener("EVENT", myTemplate);

    /* we are done :-) */
    console.log("WFES Script loaded:", GM_info.script.name, 'v', GM_info.script.version);
})();