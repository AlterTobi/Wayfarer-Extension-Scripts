// ==UserScript==
// @name           WFES - POI Submission Availability
// @version        1.0.0
// @description    adds information about submission availability (max, tomorrow)
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/assets/icon_32.png
// @icon64         https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/assets/icon_64.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/wfes-PoiSubmissionData.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/wfes-PoiSubmissionData.meta.js
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
  const baseMinVersion = "2.8.1";
  const myCssId = "submissiondataCSS";
  const myStyle = `table {
        background-color: antiquewhite;
    }
    th, td {
        border-color: inherit;
    }
    .dark table {
        background-color: inherit;
    }
    `;
  const draftSel = "app-submit-wayspot-entry > div > div.drafts-section";

  const descriptions = {
    POI_CATEGORY_VOTE_SUBMISSION: "add category",
    POI_TEXT_METADATA_UPDATE: "text update",
    POI_SUBMISSION: "submit new",
    POI_TAKEDOWN_REQUEST:"report wayspot",
    POI_LOCATION_UPDATE: "edit location",
    POI_IMAGE_SUBMISSION: "add photo",
  };

  // function mostly created by ChatGPT
  function createPoiTable(poiData) {
    const table = document.createElement("table");

    // Tabellenkopf
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    ["", "max available", "available today", "added tomorrow"].forEach(text => {
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
      const rowtitle = descriptions[title] || title;

      [ rowtitle,
        data.maxSubmissions,
        data.submissionsLeft,
        tomorrow].forEach(value => {
        const td = document.createElement("td");
        td.textContent = value;
        row.appendChild(td);
      });

      tbody.appendChild(row);
    }

    table.appendChild(tbody);
    return(table);
  }

  function submissionData() {
    window.wfes.f.addCSS(myCssId, myStyle);

    const submissionData = window.wfes.g.submitAvailable();
    const table = createPoiTable(submissionData);
    window.wfes.f.waitForElem(draftSel).then(elem => {
      elem.insertAdjacentElement("beforeBegin", table);
    })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
  }

  const init = () => {
    window.addEventListener("WFESSubmitAvailable", submissionData);
  };

  // === no changes needed below this line ======================
  if("undefined" === typeof(wfes)) {
    if (undefined === sessionStorage[sessvarMiss]) {
      sessionStorage[sessvarMiss] = 1;
      alert("Missing WFES Base. Please install from https://altertobi.github.io/Wayfarer-Extension-Scripts/");
      console.error("Missing WFES Base. Please install from https://altertobi.github.io/Wayfarer-Extension-Scripts/");
    }
  } else if (window.wfes.f.hasMinVersion(baseMinVersion)) {
    init();
  } else {
    console.warn(GM_info.script.name, "Need at least wfes-Base version ", baseMinVersion, " Please upgrade.");
  }

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();