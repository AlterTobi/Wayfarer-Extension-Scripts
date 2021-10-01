// ==UserScript==
// @name         WFES - WF+ Dark Mode
// @namespace    https://gitlab.com/fotofreund0815/WFES
// @version      1.0.1
// @description  Apply WayFarer+ like dark mode on the "new" (sept 21) Wayfarer
// @author       MrJPGames / AlterTobi
// @match        https://wayfarer.nianticlabs.com/*
// @icon         https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @downloadURL  https://github.com/AlterTobi/WFES/raw/main/no_suppport/DarkMode.user.js
// @supportURL   https://github.com/AlterTobi/WFES/issues
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let customStyleSheet = "\
    .mat-drawer-content { background: black !important; }\
    .wf-review-card { border-color: white !important; }\
    .ng-option { background: black !important; }\
    .ng-option-marked { background: rgb(20,20,20) !important; color: white !important; }\
    .dark .bg-gray-200.ng-star-inserted { background: black !important; border: 1px white solid; border-radius: 0.25rem; color: white; }\
    .dark .review-edit-info__info { background: black !important; border: 1px white solid; border-radius: 0.25rem; }\
    body { color: white; }\
    .dark .mat-dialog-container { background: black !important; }\
    .dark .mat-expansion-panel:not([class*=mat-elevation-z]) { background: black; }\
    .wf-rate { color: black; filter: invert(); }\
    .dark wf-split-button > button[wf-button].wf-button { color: black !important; }\
    .dark wf-logo > .dark\\:filter-icon {filter: invert(1) !important;}\
    .dark .mat-slide-toggle-bar { background: black; }\
    .dark .mat-slide-toggle-thumb { background-color: black; }\
    wf-slide-toggle { filter: invert(1); }\
    .sidebar-link--active, .sidebar-link:hover { border-color: #20b8e3 !important; } \
    button[wf-button] { filter: invert(1); color: black !important; font-weight: 900; } \
    .dark .nominations-item--selected { border-color: rgba(32,184,227,var(--tw-border-opacity)) !important; }\
    ";
    let headElem = document.getElementsByTagName("head")[0];
    let styleElem = document.createElement("style");
    styleElem.innerText = customStyleSheet;
    headElem.appendChild(styleElem);

    //Apply default dark mode if not already enabled:
    window.addEventListener("WFESPropertiesLoaded", () => document.getElementsByTagName("body")[0].classList.add("dark"));
    
    console.log( "WFES Beta Script loaded: Dark Mode");
})();