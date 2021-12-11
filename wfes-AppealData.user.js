// ==UserScript==
// @name         WFES - handle Appeal Data
// @namespace    https://github.com/AlterTobi/WFES/
// @version      0.1.0
// @description  WFES 
// @author       AlterTobi
// @match        https://wayfarer.nianticlabs.com/*
// @icon         https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @downloadURL  https://github.com/AlterTobi/WFES/raw/main/wfes-AppealData.user.js
// @supportURL   https://github.com/AlterTobi/WFES/issues
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const lStoreList = 'wfes_AppealData';

    function storeAppealData() {
        let appealHistory = JSON.parse(localStorage.getItem(lStoreList)) || {};
        appealHistory[window.wfes.review.appeal.id] = window.wfes.review.appeal.statement;
        localStorage.setItem(lStoreList, JSON.stringify(appealHistory));
    }

    window.addEventListener("WFESReviewAppealSent", storeAppealData);

    console.log("WFES Script loaded: store Appeal Data");
})();
