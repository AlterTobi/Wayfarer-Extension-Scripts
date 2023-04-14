// ==UserScript==
// @name           WFES - Expire Timer
// @version        1.0.5
// @description    Adds a simple timer to the top of the screen showing how much time you have left on the current review.
// @author         MrJPGames / AlterTobi
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-ExpireTimer.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-ExpireTimer.meta.js
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
  let timeElem;
  let headerTimer;

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
    const header = document.getElementsByTagName("wf-header")[0].children[0].children[0];
    const headerTimerWrapper = document.createElement("div");
    headerTimer = document.createElement("span");
    headerTimer.appendChild(document.createTextNode(message));
    headerTimerWrapper.appendChild(headerTimer);
    headerTimerWrapper.setAttribute("style", "display: inline-block; margin-left: 5em;");
    headerTimerWrapper.setAttribute("class", "revExprTimer");
    timeElem = document.createElement("div");
    timeElem.appendChild(document.createTextNode("??:??"));
    timeElem.style.display = "inline-block";
    headerTimerWrapper.appendChild(timeElem);
    header.insertAdjacentElement("afterend", headerTimerWrapper);
    updateTimer();
  }

  window.addEventListener("WFESReviewPageLoaded", () => createTimer("Time remaining: "));
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
