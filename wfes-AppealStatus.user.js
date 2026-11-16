// ==UserScript==
// @name           WFES - Appeal Status
// @version        1.2.0
// @description    tells you if an appeal is available
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://altertobi.github.io/Wayfarer-Extension-Scripts/assets/icon_32.png
// @icon64         https://altertobi.github.io/Wayfarer-Extension-Scripts/assets/icon_64.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-AppealStatus.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-AppealStatus.meta.js
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
   https://altertobi.github.io/Wayfarer-Extension-Scripts/LICENSE.txt
   If not, see <http://www.gnu.org/licenses/>.
*/

(function() {
  "use strict";

  const BASE_MIN_VERSION = "3.0.0";
  const SESSION_VAR_MISS = "warnBase";
  const SCRIPT_NAME = GM_info?.script?.name ?? "WFES - Appeal Status";
  const SCRIPT_VERSION = GM_info?.script?.version ?? "unknown";

  // === Basis-Prüfung & Logger (Standard für alle Skripte) =====
  if (typeof window.wfes === "undefined") {
    if (sessionStorage.getItem(SESSION_VAR_MISS) === null) {
      sessionStorage.setItem(SESSION_VAR_MISS, "1");
      const msg = `${SCRIPT_NAME}: Missing WFES Base. Please install from https://altertobi.github.io/Wayfarer-Extension-Scripts/`;
      alert(msg);
      console.error(msg);
    }
    return;
  }

  // Ab hier existiert wfes garantiert -> Logger ist überall verfügbar
  const logger = new window.UserScriptLogger(SCRIPT_NAME, true);

  if (!window.wfes.f.hasMinVersion(BASE_MIN_VERSION)) {
    const msg = `${SCRIPT_NAME}: Need at least wfes-Base version ${BASE_MIN_VERSION}. Please upgrade.`;
    logger.warn(msg);
    window.wfes.f.createNotification(msg, "red", { autoclose: 60 });
    return;
  }

  // === Skript-spezifische Konfiguration & Logik ===============

  const myCssId = "wfesAppealStatusCSS";
  const myStyle = `.wfesAppealStatus {
      color: #efefef;
      margin-left: 2em;
      align-self: center;
      text-align: center;
      display: block;
    }
    .dark .wfesAppealStatus {
      color: #ddd;
    }
    .wfesAppealStatusButton {
        margin: 0 auto;
    }
    .wfesCYes {
        color: #62D638;
    }
    .wfesCNo {
        color: #E13535;
    }
    `;

  const buttonID = "wfesAppealStatusButton";

  function showButton() {
    const div = document.createElement("div");
    div.className = "wfesAppealStatus";
    div.id = buttonID;

    const headline = document.createElement("p");
    headline.innerText = "Appeal";

    const canAppeal = window.wfes.g.canAppeal();
    const statusButton = document.createElement("button");
    statusButton.title = "appeal status";

    if (canAppeal) {
      statusButton.className = "wfesAppealStatusButton wfesCYes";
      statusButton.innerHTML = '<span class="material-icons">check_circle</span>';
    } else {
      statusButton.className = "wfesAppealStatusButton wfesCNo";
      statusButton.innerHTML = '<span class="material-icons">cancel</span>';
    }

    div.appendChild(headline);
    div.appendChild(statusButton);

    window.wfes.f.createHeaderButton(div, buttonID);
  }

  const init = () => {
    // auf Nominationsseite
    window.addEventListener("WFESNominationListLoaded", showButton);
    window.wfes.f.addCSS(myCssId, myStyle);
  };

  // === Start ==================================================
  init();
  logger.info(`Script loaded: version: ${SCRIPT_VERSION}`);

})();