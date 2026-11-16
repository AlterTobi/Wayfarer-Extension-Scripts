// ==UserScript==
// @name           WFES - POI Submission Availability
// @version        1.2.0
// @description    adds information about submission availability (max, tomorrow)
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/assets/icon_32.png
// @icon64         https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/assets/icon_64.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/wfes-PoiSubmissionData.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/wfes-PoiSubmissionData.meta.js
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

  const BASE_MIN_VERSION = "3.0.0";
  const SESSION_VAR_MISS = "warnBase";
  const SCRIPT_NAME = GM_info?.script?.name ?? "WFES - POI Submission Availability";
  const SCRIPT_VERSION = GM_info?.script?.version ?? "unknown";

  // === Basis-Prüfung & Logger =================================
  if (typeof window.wfes === "undefined") {
    if (sessionStorage.getItem(SESSION_VAR_MISS) === null) {
      sessionStorage.setItem(SESSION_VAR_MISS, "1");
      const msg = `${SCRIPT_NAME}: Missing WFES Base. Please install from https://github.io`;
      alert(msg);
      console.error(msg);
    }
    return;
  }

  const logger = new window.UserScriptLogger(SCRIPT_NAME, true);

  if (!window.wfes.f.hasMinVersion(BASE_MIN_VERSION)) {
    const msg = `${SCRIPT_NAME}: Need at least wfes-Base version ${BASE_MIN_VERSION}. Please upgrade.`;
    logger.warn(msg);
    window.wfes.f.createNotification(msg, "red", { autoclose: 60 });
    return;
  }

  // === Konfiguration & Konstanten =============================
  const CSS_ID = "submissiondataCSS";
  const CSS_STYLE = `
    table {
      background-color: antiquewhite;
    }
    th, td {
      border-color: inherit;
    }
    .dark table {
      background-color: inherit;
    }
  `;

  //  const DRAFT_SELECTOR = "app-submit-wayspot-entry > div > div.drafts-section";
  const DRAFT_SELECTOR = "#root > div > div > div > div > div > nav";

  const DESCRIPTIONS = {
    POI_CATEGORY_VOTE_SUBMISSION: "add category",
    POI_TEXT_METADATA_UPDATE: "text update",
    POI_SUBMISSION: "submit new",
    POI_TAKEDOWN_REQUEST: "report wayspot",
    POI_LOCATION_UPDATE: "edit location",
    POI_IMAGE_SUBMISSION: "add photo",
  };

  const TABLE_HEADERS = ["", "max available", "available today", "added tomorrow"];

  // === Hauptlogik =============================================
  const createPoiTable = (poiData) => {
    const table = document.createElement("table");

    // Tabellenkopf
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    TABLE_HEADERS.forEach((text) => {
      const th = document.createElement("th");
      th.textContent = text;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Tabelleninhalt
    const tbody = document.createElement("tbody");

    for (const [title, data] of Object.entries(poiData)) {
      const row = document.createElement("tr");

      const tomorrow = Math.min(
        data.maxSubmissions - data.submissionsLeft,
        data.dailyNewSubmissions
      );
      const rowTitle = DESCRIPTIONS[title] ?? title;

      [rowTitle, data.maxSubmissions, data.submissionsLeft, tomorrow].forEach((value) => {
        const td = document.createElement("td");
        td.textContent = value;
        row.appendChild(td);
      });

      tbody.appendChild(row);
    }

    table.appendChild(tbody);
    return table;
  };

  const handleSubmissionData = () => {
    window.wfes.f.addCSS(CSS_ID, CSS_STYLE);

    const availData = window.wfes.g.submitAvailable();
    const table = createPoiTable(availData);

    window.wfes.f.waitForElem(DRAFT_SELECTOR)
      .then((elem) => {
        elem.insertAdjacentElement("beforeBegin", table);
      })
      .catch((err) => {
        logger.warn(err);
      });
  };

  // === Initialisierung & Start ================================
  const init = () => {
    window.addEventListener("WFESSubmitAvailable", handleSubmissionData);
  };

  init();
  logger.info(`Script loaded: version: ${SCRIPT_VERSION}`);
})();
