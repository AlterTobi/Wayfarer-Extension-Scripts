// ==UserScript==
// @name         WFES - Appeal Data
// @namespace    https://github.com/AlterTobi/WFES/
// @version      0.2.0
// @description  save and show appeal your statements
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
    const myID = 'nominationAppealData';
    let nomImage, appealDiv;
    let haveDiv = false;

    function storeAppealData() {
        let appealHistory = JSON.parse(localStorage.getItem(lStoreList)) || {};
        appealHistory[window.wfes.review.appeal.id] = window.wfes.review.appeal.statement;
        localStorage.setItem(lStoreList, JSON.stringify(appealHistory));
    }

    function NominationSelected() {
        const nomID = window.wfes.nominations.detail.id;
        let appealHistory = JSON.parse(localStorage.getItem(lStoreList)) || {};
        if (nomID in appealHistory) {
            nomImage = document.querySelector("app-details-pane > div > div > div > img.wf-image-modal.details-pane__image");
            if (haveDiv) {
                appealDiv.innerText = appealHistory[nomID];
            } else {
                appealDiv = document.createElement("div");
                appealDiv.setAttribute("class","ng-star-inserted");
                appealDiv.setAttribute('id',myID);
                appealDiv.innerHTML='<h5>Appeal Statement</h5><div></div>';
                appealDiv.children[1].innerText = appealHistory[nomID];
                nomImage.insertAdjacentElement('beforeBegin',appealDiv);
                haveDiv = true;
            }
        } else {
            if (document.getElementById(myID)) {
                nomImage.parentNode.removeChild(appealDiv);
                haveDiv = false;
            }
        }
    }

    window.addEventListener("WFESReviewAppealSent", storeAppealData);
    window.addEventListener("WFESNominationDetailLoaded",() => {setTimeout(NominationSelected,10);});

    console.log("WFES Script loaded: Appeal Data");
})();
