// ==UserScript==
// @name           WFES - Debug
// @version        1.2.4
// @description    show some debugging info
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://altertobi.github.io/Wayfarer-Extension-Scripts/assets/icon_32.png
// @icon64         https://altertobi.github.io/Wayfarer-Extension-Scripts/assets/icon_64.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-Debug.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-Debug.meta.js
// @match          https://wayfarer.nianticlabs.com/*
// @grant          none
// ==/UserScript==

/* Copyright 2025 AlterTobi

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
  // const mainContentSelector = "app-wayfarer > div > mat-sidenav-container > mat-sidenav-content";
  const profileImageSelector = "app-root > app-wayfarer > div > wf-header > div > a";
  const myID = "wfes-debugOverlay";
  const myCssId = "wfes-debugCSS";
  const myStyle = `.wfes-debug {
    position : absolute;
    top : 75px;
    right : 15px;
    background-Color : #d9d9d9;
    padding : 5px;
    border : 1px solid black;
    max-width : 20%;
    box-shadow: 7px 7px 5px grey;
    z-index: 999;
  }
  .dark .wfes-debug {
    color: #000;
  }
  .wfes-debug > hr {
    background-Color : #828282;
    margin-top: 1em;
    margin-bottom: 1em;
    height: 2px;
  }
  .wfes-red { color: red; }
  `;

  const skipNamesCommon = ["description", "title"];

  const matrix = [
    [85, +6, +7, +6, +6, 81, +6, +0, +3, 85, +5, 84, -1, +8, +6, +0, -1, +3, +7, 86, +2, +8, +4, 81, +7, +7, +5, 82, +4, +0, 82, 85, 75, -1, +7, 7],
    [84, +7, +6, +7, +7, 80, +7, +1, +2, 84, +4, 85, -1, +9, +7, +1, -1, +2, +6, 87, +3, +9, +5, 80, +6, +6, +4, 83, +5, +1, 83, 84, -1, +7, +6, 6],
    [87, +4, +5, +4, +4, 83, +4, +2, +1, 87, +7, 86, -1, 10, +4, +2, -1, +1, +5, 84, +0, 10, +6, 83, +5, +5, +7, 80, +6, +2, 80, 87, -1, -1, +5, 5],
    [86, +5, +4, +5, +5, 82, +5, +3, +0, 86, +6, 87, +3, 11, +5, +3, -1, +0, +4, 85, +1, 11, +7, 82, +4, +4, +6, 81, +7, +3, 81, 86, -1, -1, +4, 4],
    [81, +2, +3, +2, +2, 85, +2, +4, +7, 81, +1, 80, +4, 12, +2, +4, -1, +7, +3, 82, +6, 12, +0, 85, +3, +3, +1, 86, +0, +4, 86, 81, -1, -1, +3, 3],
    [80, +3, +2, +3, +3, 84, +3, +5, +6, 80, +0, 81, -1, 13, +3, +5, -1, +6, +2, 83, +7, 13, +1, 84, +2, +2, +0, 87, +1, +5, 87, 80, -1, -1, +2, 2],
    [83, +0, +1, +0, +0, 87, +0, +6, +5, 83, +3, 82, -1, 14, +0, +6, -1, +5, +1, 80, +4, 14, +2, 87, +1, +1, +3, 84, +2, +6, 84, 83, -1, -1, +1, 1],
    [82, +1, +0, +1, +1, 86, +1, +7, +4, 82, +2, 83, -1, 15, +1, +7, -1, +4, +0, 81, +5, 15, +3, 86, +0, +0, +2, 85, +3, +7, 85, 82, -1, -1, +0, 0],
    [93, 14, 15, 14, 14, 89, 14, +8, 11, 93, 13, 92, -1, +0, 14, +8, +0, 11, 15, 94, 10, +0, 12, 89, 15, 15, 13, 90, 12, +8, 90, 93, -1, -1, 15, -1],
    [92, 15, 14, 15, 15, 88, 15, +9, 10, 92, 12, 93, -1, +1, 15, +9, +1, 10, 14, 95, 11, +1, 13, 88, 14, 14, 12, 91, 13, +9, 91, 92, -1, -1, 14, -1],
    [ 4, 87, 86, 87, 87, +0, 87, 81, 82, +4, 84, +5, -1, 89, 87, 81, 89, 82, 86, +7, 83, 89, 85, +0, 86, 86, 84, +3, 85, 81, +3, +4, -1, -1, 86, -1],
    [ 7, 84, 85, 84, 84, +3, 84, 82, 81, +7, 87, +6, -1, 90, 84, 82, 90, 81, 85, +4, 80, 90, 86, +3, 85, 85, 87, +0, 86, 82, +0, +7, -1, -1, 85, -1],
    [ 6, 85, 84, 85, 85, +2, 85, 83, 80, +6, 86, +7, -1, 91, 85, 83, -1, 80, 84, +5, 81, 91, 87, +2, 84, 84, 86, +1, 87, 83, +1, +6, -1, -1, 84, -1],
    [ 1, 82, 83, 82, 82, +5, 82, 84, 87, +1, 81, +0, -1, 92, 82, 84, -1, 87, 83, +2, 86, 92, 80, +5, 83, 83, 81, +6, 80, 84, +6, +1, -1, -1, 83, -1],
    [ 0, 83, 82, 83, 83, +4, 83, 85, 86, +0, 80, +1, -1, 93, 83, 85, -1, 86, 82, +3, 87, 93, 81, +4, 82, 82, 80, +7, 81, 85, +7, +0, -1, -1, 82, -1],
    [ 3, 80, 81, 80, 80, +7, 80, 86, 85, +3, 83, +2, -1, 94, 80, 86, -1, 85, 81, +0, 84, 94, 82, +7, 81, 81, 83, +4, 82, 86, +4, +3, -1, -1, 81, -1]
  ];

  // Funktion zur Ermittlung der GUID aus der gehashten ID
  function getGUIDFromID(id, matrix) {
    const decodedID = atob(id);
    let guid = "";

    if ((decodedID.length > 36) || (decodedID.length < 32)) {
      console.warn("decoded data contains no guid", id);
      return id;
    }

    for (let j = 0; j < decodedID.length; j++) {
      const target = decodedID.charCodeAt(j);
      let found = false;

      if (32 === j) {
        guid += ".";
        continue;
      }
      if (j > 35) {
        guid += "x";
        continue;
      }

      for (let i = 0; i < matrix.length; i++) {
        if (matrix[i][j] === target) {
          guid += i.toString(16); // Hexadezimalwert zur GUID hinzufügen
          found = true;
          break;
        }
      }

      if (!found) {
        guid += "?";
      }
    }
    return guid;
  }

  /*
  function getIDFromGUID(guid, matrix) {
    let encodedID = "";
    if (guid.length < 32 || guid.length > 36) {
      console.warn("invalid guid format", guid);
      return guid;
    }
    for (let j = 0; j < guid.length; j++) {
      const hexChar = guid[j];

      if ("." === hexChar) {
        encodedID += String.fromCharCode(75);
      } else {
        const hexValue = parseInt(hexChar, 16); // Hexadezimalwert ermitteln

        // Finde das entsprechende Zeichen in der Matrix an der Position j
        const matrixValue = matrix[hexValue][j];

        console.log("Pos", j, "Wert", hexChar, "Matrix", matrixValue);
        // Convertiere den Matrixwert zurück in das Zeichen
        encodedID += String.fromCharCode(matrixValue);
      }
    }
    // Base64 kodieren
    const encodedIDBase64 = btoa(encodedID);
    return encodedIDBase64;
  }
*/

  function showDebugBox(candidate, lskips) {
    const skipNames = [...new Set(skipNamesCommon.concat(lskips))];
    skipNames.sort();

    const skipped = [];

    window.wfes.f.addCSS(myCssId, myStyle);
    let overlay = document.getElementById(myID);
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.setAttribute("class", "wfes-debug");
      overlay.setAttribute("id", myID);
    }

    let content = "";
    for (const key in candidate) {
      if (skipNames.includes(key)) {
        skipped.push(key);
        continue;
      }
      switch(key) {
        case "expires": {
          const date = new Date(candidate[key]);
          const dateStr = date.toLocaleString();
          content += `<p><strong>${key}:</strong> ${dateStr}</p>`;
          break;
        }
        case "t1": {
          if (0.5 === candidate[key]) {
            content += `<p><strong>${key}:</strong> ${candidate[key]}</p>`;
          } else {
            content += `<p class="wfes-red"><strong>${key}:</strong> ${candidate[key]}</p>`;
          }
          break;
        }
        default:
          content += `<p><strong>${key}:</strong> ${candidate[key]}</p>`;
      }
    }

    skipped.sort();

    content += "<hr/><strong>ignored entries:</strong><br/>";
    content += `<p>${skipped.join(", ")}</p>`;
    const missing = skipNames.filter(x => !skipped.includes(x));
    if (missing.length > 0) {
      missing.sort();
      content += "<hr/><strong>missing entries:</strong><br/>";
      content += `<p>${missing.join(", ")}</p>`;
    }

    overlay.innerHTML = content;

    // const mainContent = document.querySelector(mainContentSelector);
    // mainContent.appendChild(overlay);
    const body = document.querySelector("body");
    body.appendChild(overlay);
  }

  function removeInfobox() {
    // remove the overlay
    const overlay = document.getElementById(myID);
    if (overlay ) {
      overlay.remove();
    }
  }

  function reviewInfobox(lskips) {
    const candidate = window.wfes.g.reviewPageData();
    showDebugBox(candidate, lskips);
  }

  function reviewNew() {
    const lskips = ["categoryIds", "nearbyPortals", "statement", "streetAddress", "supportingImageUrl", "imageUrl"];
    reviewInfobox(lskips);
  }

  function newPhoto() {
    const lskips = ["newPhotos"];
    reviewInfobox(lskips);
  }

  function reviewEdit() {
    const lskips = ["locationEdits", "descriptionEdits", "titleEdits", "imageUrl"];
    reviewInfobox(lskips);
  }

  function nominationDetail() {
    const lskips = ["supportingImageUrl", "imageUrl", "statement", "rejectReasons",
      "upgraded", "city", "state", "userAppealNotes", "canHold", "canReleaseHold", "appealNotes",
      "order", "day"];
    const candidate = window.wfes.g.nominationDetail();
    const poiId = wfes.g.nominationsList().find(obj => obj.id === candidate.id).poiData.id;
    if (poiId) {
      candidate.poiId = getGUIDFromID( poiId, matrix);
    }
    candidate.id = getGUIDFromID( candidate.id, matrix);
    showDebugBox(candidate, lskips);
  }

  function addMail2ProfilePic() {
    // email ADresse ausgeben
    const props = window.wfes.g.properties();
    const email = props.socialProfile.email;
    window.wfes.f.waitForElem(profileImageSelector).then(elem=>{
      elem.setAttribute("title", email);
    });
  }

  // display debug ooverlay
  window.addEventListener("WFESReviewPageNewLoaded", reviewNew);
  window.addEventListener("WFESReviewPageEditLoaded", reviewEdit);
  window.addEventListener("WFESReviewPagePhotoLoaded", newPhoto);
  window.addEventListener("WFESNominationDetailLoaded", nominationDetail);
  window.addEventListener("WFESPageLoaded", addMail2ProfilePic);

  // remove debug ooverlay - explizit alle Seiten, weil WFESPageLoaded es sonst auch auf der review-Seite wieder entfernen würde
  window.addEventListener("WFESReviewDecisionSent", removeInfobox);
  window.addEventListener("WFESHomePageLoaded", removeInfobox);
  window.addEventListener("WFESProfileLoaded", removeInfobox);
  window.addEventListener("WFESHelpPageLoaded", removeInfobox);
  window.addEventListener("WFESSettingsLoaded", removeInfobox);

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();