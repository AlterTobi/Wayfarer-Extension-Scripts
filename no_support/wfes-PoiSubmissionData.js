// @name         POI Submission Availability
// @version      0.0.1
// @description  adds information about submission availability (max, tomorrow)
// @author       AlterTobi

(function() {
  "use strict";

  const sessvarMiss = "warnBase";
  const baseMinVersion = "2.8.1";
  const myCssId = "submissiondataCSS";
  const myStyle = `.dark table {
        background-color: antiquewhite;
    }
    table {
        background-color: inherit;
    }
    `;
  const draftSel = "app-submit-wayspot-entry > div > div.drafts-section";

  // function created by ChatGPT
  function createPoiTable(poiData) {
    const table = document.createElement("table");

    // Tabellenkopf
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    ["title", "max submissions", "submissions left", "tomorrow"].forEach(text => {
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

      [
        title,
        data.maxSubmissions,
        data.submissionsLeft,
        tomorrow
      ].forEach(value => {
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