// ==UserScript==
// @name           WFES - Expire Timer
// @version        1.1.1
// @description    Adds a simple timer to the top of the screen showing how much time you have left on the current review.
// @author         MrJPGames / AlterTobi
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/assets/icon_32.png
// @icon64         https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/assets/icon_64.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/wfes-ExpireTimer.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/wfes-ExpireTimer.meta.js
// @match          https://wayfarer.nianticlabs.com/*
// @grant          none
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
   https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/LICENSE.txt
   If not, see <http://www.gnu.org/licenses/>.
*/

(function() {
  "use strict";

  const sessvarMiss = "warnBase";
  const myCSSId = "wfesExpireCSS";
  const myStyle = `.wfesExpire {
      color: #333;
      margin-left: 2em;
      padding-top: 0.3em;
      text-align: center;
      display: flex;
      align-items: center;
    }
    .dark .wfesExpire {
      color: #ddd;
    }
`;

  const buttonID = "expireButton";
  let timeElem;

  function removeButton() {
    const button = document.getElementById(buttonID);
    if (button !== null) {
      button.remove();
    }
  }

  // Helper functions
  function pad(num, size) {
    let s = num + "";
    while (s.length < size) {s = "0" + s;}
    return s;
  }

  function updateTimer() {
    const now = Date.now();
    const tDiff = window.wfes.g.reviewPageData().expires - now;

    if (tDiff > 0) {
      const tDiffMin = Math.floor(tDiff / 1000 / 60);
      const tDiffSec = Math.ceil((tDiff / 1000) - (60 * tDiffMin));
      timeElem.innerText = pad(tDiffMin, 2) + ":" + pad(tDiffSec, 2);
      // Retrigger function in 1 second
      setTimeout(updateTimer, 1000);
    } else {
      timeElem.innerText = "EXPIRED!";
      timeElem.setAttribute("style", "color: red;");
    }
  }

  function createTimer(message) {
    window.wfes.f.addCSS(myCSSId, myStyle);
    wfes.f.waitForElem("wf-logo").then(elem=>{
      const div = document.createElement("div");
      div.className = "wfesExpire";
      div.id = buttonID;
      const expireTimer = document.createElement("span");
      expireTimer.appendChild(document.createTextNode(message));
      div.appendChild(expireTimer);
      timeElem = document.createElement("div");
      timeElem.appendChild(document.createTextNode("??:??"));
      timeElem.style.display = "inline-block";
      div.appendChild(timeElem);
      const container = elem.parentNode.parentNode;
      container.appendChild(div);
      updateTimer();
    })
      .catch(e => {
        console.warn(GM_info.script.name, ": ", e);
      });
  }

  const init = () => {
    window.addEventListener("WFESReviewPageLoaded", () => createTimer("Time remaining: "));
    window.addEventListener("WFESReviewDecisionSent", removeButton);
  };


  // === no changes needed below this line ======================
  if("undefined" === typeof(wfes)) {
    if (undefined === sessionStorage[sessvarMiss]) {
      sessionStorage[sessvarMiss] = 1;
      alert("Missing WFES Base. Please install from https://altertobi.github.io/Wayfarer-Extension-Scripts/");
      console.error("Missing WFES Base. Please install from https://altertobi.github.io/Wayfarer-Extension-Scripts/");
    }
  } else {
    init();
  }

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
