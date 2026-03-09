// ==UserScript==
// @name           WFES - ORCa
// @version        1.0.2
// @description    ORCa
// @author         AlterTobi
// @resource       orca https://altertobi.github.io/Wayfarer-Extension-Scripts/images/orca.png
// @grant          GM_getResourceURL
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://altertobi.github.io/Wayfarer-Extension-Scripts/assets/icon_32.png
// @icon64         https://altertobi.github.io/Wayfarer-Extension-Scripts/assets/icon_64.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-orca.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-orca.meta.js
// @match          https://wayfarer.nianticlabs.com/*
// ==/UserScript==

/* Copyright 2026 AlterTobi

   This file is part of the Wayfarer Extension Scripts collection. Further scripts
   can be found on the @homepage, see above.

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

  const myCssId = "wfesORCaCSS";
  const myStyle = `.wfesORC {
      color: #333;
      margin-left: 2em;
      text-align: center;
      display: block;
    }
    `;

  const sessvarMiss = "warnBase";
  const acceptBtnList = ["#appropriate-card", "#safe-card", "#accurate-and-high-quality-card", "#permanent-location-card"];
  const rejectBtnList = ["#socialize-card", "#exercise-card", "#explore-card"];
  const categoriesSel = "#categorization-card > div.wf-review-card__body > div > mat-button-toggle-group > mat-button-toggle:nth-child(2) > button";
  const buttonID = "orcaButton";

  function removeButton() {
    const button = document.getElementById(buttonID);
    if (button !== null) {
      button.remove();
    }
  }

  function orcaClick() {
    // die ersten 4 Daumen hoch
    acceptBtnList.forEach(sel => {
      const fulSel = sel + "> div > div.action-buttons-row > button:nth-child(1)";
      wfes.f.waitForElem(fulSel).then((elem) => {elem.click();})
        .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    });
    // die nächsten 3 Daumen runter
    rejectBtnList.forEach(sel => {
      const fulSel = sel + "> div > div.action-buttons-row > button:nth-child(2)";
      wfes.f.waitForElem(fulSel).then((elem) => {elem.click();})
        .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    });

    // alle Kategorien abwählen
    const noBtnsList = document.querySelectorAll(categoriesSel);
    noBtnsList.forEach(elem => {elem.click();});
  }


  function createButton() {
    removeButton(); // remove before creating new
    wfes.f.waitForElem("wf-logo").then(elem=>{
      const image = GM_getResourceURL("orca");
      const div = document.createElement("div");
      div.className = "wfesORC";
      div.id = buttonID;
      const link = document.createElement("a");
      link.title = "ORC";
      link.addEventListener("click", orcaClick);
      const img = document.createElement("img");
      img.setAttribute("style", "height: 60px;");
      img.src = image;
      link.appendChild(img);
      div.appendChild(link);
      const container = elem.parentNode.parentNode;
      container.appendChild(div);
    })
      .catch(e => {
        console.warn(GM_info.script.name, ": ", e);
      });
  }

  function ORCa() {
    wfes.f.addCSS(myCssId, myStyle);
    createButton();
  }

  function init() {
    window.addEventListener("WFESReviewPageNewLoaded", ORCa);
    window.addEventListener("WFESReviewDecisionSent", removeButton);
  }

  if("undefined" === typeof(wfes)) {
    if (undefined === sessionStorage[sessvarMiss]) {
      sessionStorage[sessvarMiss] = 1;
      alert("Missing WFES Base. Please install from https://altertobi.github.io/Wayfarer-Extension-Scripts/");
      console.error("Missing WFES Base. Please install from https://altertobi.github.io/Wayfarer-Extension-Scripts/");
    }
  } else {
    init();
  }

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();