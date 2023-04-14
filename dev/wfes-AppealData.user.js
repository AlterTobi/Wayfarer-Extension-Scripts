// ==UserScript==
// @name           WFES - Appeal Data
// @version        1.2.3
// @description    save and show appeal your statements
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/wfes-AppealData.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/wfes-AppealData.meta.js
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
   https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/LICENSE.txt
   If not, see <http://www.gnu.org/licenses/>.
*/

(function() {
  "use strict";

  const lStoreList = "wfes_AppealData";
  const myID = "nominationAppealData";
  let nomImage, appealDiv;
  let haveDiv = false;

  function storeAppealData() {
    const appeal = window.wfes.g.reviewAppeal();
    window.wfes.f.localGet(lStoreList, {}).then((appealHistory)=>{
      appealHistory[appeal.id] = appeal.statement;
      window.wfes.f.localSave(lStoreList, appealHistory);
    });
  }

  function NominationSelected() {
    const nomID = window.wfes.g.nominationDetail().id;
    window.wfes.f.localGet(lStoreList, {}).then((appealHistory)=>{
      if (nomID in appealHistory) {
        nomImage = document.querySelector("app-details-pane > div > div > div > img.wf-image-modal.details-pane__image");
        if (haveDiv) {
          // remove all child nodes
          while (haveDiv.children[1].lastChild) {
            haveDiv.children[1].removeChild(haveDiv.children[1].lastChild);
          }
          appealDiv.appendChild(document.createTextNode(appealHistory[nomID]));
        } else {
          appealDiv = document.createElement("div");
          appealDiv.setAttribute("class", "ng-star-inserted");
          appealDiv.setAttribute("id", myID);
          appealDiv.innerHTML="<h5>Appeal Statement</h5><div></div>";
          appealDiv.children[1].appendChild(document.createTextNode(appealHistory[nomID]));
          nomImage.insertAdjacentElement("beforeBegin", appealDiv);
          haveDiv = true;
        }
      } else if (document.getElementById(myID)) {
        nomImage.parentNode.removeChild(appealDiv);
        haveDiv = false;
      }
    });
  }

  window.addEventListener("WFESReviewAppealSent", storeAppealData);
  window.addEventListener("WFESNominationDetailLoaded", () => {setTimeout(NominationSelected, 10);});

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
