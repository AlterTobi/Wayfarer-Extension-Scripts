// ==UserScript==
// @name           WFES - Template
// @version        1.3.0
// @description    Template (do not install)
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://altertobi.github.io/Wayfarer-Extension-Scripts/assets/icon_32.png
// @icon64         https://altertobi.github.io/Wayfarer-Extension-Scripts/assets/icon_64.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-template.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-template.meta.js
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
  const SCRIPT_NAME = GM_info?.script?.name ?? "WFES - Script";
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
  const CSS_ID = "wfesTemplateCSS";
  const CSS_STYLE = `
    body {
      display: none;
    }
  `;

  const myTemplate = () => {
    window.wfes.f.addCSS(CSS_ID, CSS_STYLE);
    // YOUR CODE HERE
    // .catch((err) => { logger.warn(err); });
  };

  const init = () => {
    window.addEventListener("WFESHomePageLoaded", myTemplate);
  };

  // === Start ==================================================
  init();
  logger.info(`Script loaded: version: ${SCRIPT_VERSION}`);
})();
