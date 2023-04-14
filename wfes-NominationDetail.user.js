// ==UserScript==
// @name           WFES - Nomination Detail
// @version        1.0.4
// @description    improvements for nomination detail page
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-NominationDetail.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-NominationDetail.meta.js
// @match          https://wayfarer.nianticlabs.com/*
// @grant          none
// ==/UserScript==

/* Copyright 2023 AlterTobi

   This file is part of the Wayfarer Extension Scripts collection.

   Wayfarer Extension Scripts are free software: you can redistribute and/or modify
   them under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   Wayfarer Extension Scripts are distributed in the hope that they will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   GNU General Public License for more details.

   You can find a copy of the GNU General Public License at the
   web space where you got this script from
   https://altertobi.github.io/Wayfarer-Extension-Scripts/LICENSE.txt
   If not, see <http://www.gnu.org/licenses/>.
*/

(function() {
  "use strict";

  let propsLoaded = false;
  let needDiv = true;
  let rejDiv, flexDiv;

  function modifyNomDetail() {
    const myLang = window.wfes.g.properties().language;
    const messages = window.wfes.g.messages();
    const allStr = messages[myLang];
    const myID = "nominationDetailRejectDiv";
    const startTime = Date.now();
    const maxWaitTime = 5000;

    if (propsLoaded) {
      const nomDetail = window.wfes.g.nominationDetail();

      if (needDiv && ("APPEALED" === nomDetail.status)) {
        // add a DIV to bring back reject reasons
        rejDiv = document.createElement("div");
        rejDiv.setAttribute("class", "ng-star-inserted");
        rejDiv.setAttribute("id", myID);
        rejDiv.innerHTML = '<div class="details-pane__section"><h5>' +
                    allStr["criteria.rejection"] +"</h5><div></div><div></div>";
        flexDiv = document.querySelector("app-details-pane > div > div > div > div.flex.flex-row.justify-between");
        flexDiv.insertAdjacentElement("afterEnd", rejDiv);
        needDiv = false;
      } else if ("REJECTED" === nomDetail.status) {
        if (flexDiv && document.getElementById(myID)) {
          flexDiv.parentNode.removeChild(rejDiv);
          needDiv = true;
        }
      }

      if (["REJECTED", "APPEALED"].includes(nomDetail.status)) {
        let rlc, rName, rNameShort, fullText;
        const rejectReasons = [];

        for (let i=0; i < nomDetail.rejectReasons.length; i++) {
          rlc = nomDetail.rejectReasons[i].reason.toLowerCase();
          rName = "reject.reason." + rlc;
          rNameShort = rName + ".short";
          if (undefined === allStr[rName]) {
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
    } else if (Date.now() - startTime >= maxWaitTime) {
      console.log(GM_info.script.name, ": properties not loaded, retry");
      setTimeout(modifyNomDetail, 500);
    } else {
      console.warn(GM_info.script.name, ": properties not loaded, abort");
    }
  }

  window.addEventListener("WFESNominationDetailLoaded", () => {setTimeout(modifyNomDetail, 200);});
  window.addEventListener("WFESPropertiesLoaded", () => {propsLoaded = true;});

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
