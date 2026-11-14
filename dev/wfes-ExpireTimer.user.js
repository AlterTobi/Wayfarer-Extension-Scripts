// ==UserScript==
// @name           WFES - Expire Timer
// @version        1.2.99-beta914.issue182
// @description    Adds a simple timer to the top of the screen showing how much time you have left on the current review.
// @author         MrJPGames / AlterTobi
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/assets/icon_32.png
// @icon64         https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/assets/icon_64.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/wfes-ExpireTimer.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/wfes-ExpireTimer.meta.js
// @match          https://wayfarer.scopely.com/*
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

  const logger = new window.UserScriptLogger(GM_info.script.name, true);

  const sessvarMiss = "warnBase";
  const baseMinVersion = "3.0.0";

  const myCSSId = "wfesExpireCSS";
  const myStyle = `.wfesExpire {
      color: #efefef;
      margin-left: 2em;
      align-self: center;
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

    window.wfes.f.createHeaderButton(div, buttonID);
    updateTimer();

  }

  const init = () => {
    window.addEventListener("WFESReviewPageLoaded", () => createTimer("Time remaining: "));
    window.addEventListener("WFESReviewDecisionSent", () => window.wfes.f.removeButton(buttonID));
  };


  // === no changes needed below this line ======================
  if("undefined" === typeof(wfes)) {
    if (undefined === sessionStorage[sessvarMiss]) {
      sessionStorage[sessvarMiss] = 1;
      alert("Missing WFES Base. Please install from https://altertobi.github.io/Wayfarer-Extension-Scripts/");
      logger.error("Missing WFES Base. Please install from https://altertobi.github.io/Wayfarer-Extension-Scripts/");
    }
  } else if (window.wfes.f.hasMinVersion(baseMinVersion)) {
    init();
  } else {
    const msg = GM_info.script.name + ": Need at least wfes-Base version " + baseMinVersion+ " Please upgrade.";
    logger.warn(msg);
    window.wfes.f.createNotification( msg, "red", {autoclose: 60});
  }

  /* we are done :-) */
  logger.info("Script loaded: version:" + GM_info.script.version);
})();
