// ==UserScript==
// @name         WFES - Nomination Detail
// @namespace    https://github.com/AlterTobi/WFES/
// @version      0.9.1
// @description  WFES improvements for nomination detail page
// @author       AlterTobi
// @match        https://wayfarer.nianticlabs.com/*
// @icon         https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @downloadURL  https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-NominationDetail.user.js
// @supportURL   https://github.com/AlterTobi/WFES/issues
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let propsLoaded = false;
    let needDiv = true;
    let rejDiv,flexDiv;

    function modifyNomDetail() {
        const myLang = window.wfes.properties.language;
        const allStr = window.wfes.messages[myLang];
        const myID = 'nominationDetailRejectDiv';

        if (propsLoaded) {

            if (needDiv && ('APPEALED' === window.wfes.nominations.detail.status)) {
                // add a DIV to bring back reject reasons
                rejDiv = document.createElement("div");
                rejDiv.setAttribute("class","ng-star-inserted");
                rejDiv.setAttribute('id',myID);
                rejDiv.innerHTML = '<div class="details-pane__section"><h5>' +
                    allStr["criteria.rejection"] +'</h5><div></div><div></div>';
                flexDiv = document.querySelector("app-details-pane > div > div > div > div.flex.flex-row.justify-between");
                flexDiv.insertAdjacentElement('afterEnd',rejDiv);
                needDiv = false;
            } else if ('REJECTED' === window.wfes.nominations.detail.status) {
                if (flexDiv && document.getElementById(myID)) {
                    flexDiv.parentNode.removeChild(rejDiv);
                    needDiv = true;
                }
            }

            if (['REJECTED','APPEALED'].includes(window.wfes.nominations.detail.status)) {

                let rejectReasons = [], rlc, rName, rNameShort, fullText;

                for (let i=0; i < window.wfes.nominations.detail.rejectReasons.length;i++) {
                    rlc = window.wfes.nominations.detail.rejectReasons[i].reason.toLowerCase();
                    rName = "reject.reason." + rlc;
                    rNameShort = rName + ".short";
                    if (undefined == allStr[rName]) {
                        fullText = rName;
                    } else {
                        fullText = "<strong>" + rlc + "</strong>: " + allStr[rNameShort]+" - "+allStr[rName];
                    }
                    rejectReasons.push(fullText);
                }
                const rejSection = document.querySelector("div.details-pane__section");
                // first child is heading, so start with 1 (second child)
                for (let i = 1; i <= rejectReasons.length; i++) {
                    rejSection.children[i].innerHTML = rejectReasons[i-1];
                }
            }
        } else {
            console.log("WFES Nomination Detail: properties not loaded, retry");
            setTimeout(modifyNomDetail,500);
            return;
        }
    }

    window.addEventListener("WFESNominationDetailLoaded", () => {setTimeout(modifyNomDetail,200)});
    window.addEventListener("WFESPropertiesLoaded", () => {propsLoaded = true});

    console.log("WFES Script loaded: Nomination Detail");
})();
