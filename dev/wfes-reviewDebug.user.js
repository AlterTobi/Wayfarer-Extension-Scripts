// ==UserScript==
// @name           WFES - review Debug
// @version        1.0.1
// @description    show some debugging info
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/wfes-reviewDebug.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/wfes-reviewDebug.meta.js
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
  const mainContentSelector = "app-wayfarer > div > mat-sidenav-container > mat-sidenav-content";
  const myID = "wfes-debugOverlay";
  const myCssId = "wfes-debugCSS";
  const myStyle = `.wfes-debug {
    position : absolute;
    top : 10px;
    right : 10px;
    background-Color : #d9d9d9;
    padding : 5px;
    border : 1px solid black;
    max-width : 20%;
    box-shadow: 7px 7px 5px grey;
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

  let overlay = null;

  function reviewInfobox(lskips) {
    const skipNames = [...new Set(skipNamesCommon.concat(lskips))];
    skipNames.sort();

    const skipped = [];

    window.wfes.f.addCSS(myCssId, myStyle);
    const candidate = window.wfes.g.reviewPageData();

    overlay = document.createElement("div");
    overlay.setAttribute("class", "wfes-debug");
    overlay.setAttribute("id", myID);

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

    content += "<hr/><strong>skipped entries:</strong><br/>";
    content += `<p>${skipped.join(", ")}</p>`;
    const missing = skipNames.filter(x => !skipped.includes(x));
    if (missing.length > 0) {
      missing.sort();
      content += "<hr/><strong>missing entries:</strong><br/>";
      content += `<p>${missing.join(", ")}</p>`;
    }

    overlay.innerHTML = content;

    const mainContent = document.querySelector(mainContentSelector);
    mainContent.appendChild(overlay);
  }

  function removeInfobox() {
    // remove the overlay
    if (overlay && document.getElementById(myID)) {
      overlay.parentNode.removeChild(overlay);
      overlay = null;
    }
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

  // display debug ooverlay
  window.addEventListener("WFESReviewPageNewLoaded", reviewNew);
  window.addEventListener("WFESReviewPageEditLoaded", reviewEdit);
  window.addEventListener("WFESReviewPagePhotoLoaded", newPhoto);

  // remove debug ooverlay
  window.addEventListener("WFESReviewDecisionSent", removeInfobox);

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();