// @name         Edit Challenge Counter
// @version      1.0.2
// @description  Count Edit Contributions for the 2024 Wayfarer Edit Challenge
// @author       AlterTobi

(function() {
  "use strict";

  const sessvarMiss = "warnBase";
  const myCssId = "wfesEdChCoCSS";
  const myStyle = `.wfesEdChCo {
      color: #333;
      margin-left: 2em;
      padding-top: 0.3em;
      text-align: center;
      display: block;
    }
    .dark .wfesEdChCo {
      color: #ddd;
    } 
    .wfesEdChCoText {
      font-size: 20px;
      color: #20B8E3;
    }
    .wfesEdChCoSmall {
      font-size: smaller;
    }
    `;

  const buttonID = "wfesECCButton";

  // Startdatum, Enddatum und gesuchte Typen als Konstanten definieren
  const START_DATE = "2024-10-30";
  const END_DATE = "2024-11-13";
  const TYPES = ["PHOTO", "EDIT_TITLE", "EDIT_DESCRIPTION", "EDIT_LOCATION"]; // Typen, die berücksichtigt werden sollen

  // Funktion zur Zählung der Objekte
  function countContributions(contributions) {
    // Zählobjekt für die Ergebnisse
    const counts = {};

    // Initialisiere die Zählwerte für jeden Typ in TYPES
    TYPES.forEach(type => {
      counts[type] = 0;
    });

    // Zählprozess
    contributions.forEach(item => {
      // Vergleiche Datum und Typ des Objekts
      const itemDate = new Date(item.day);
      const startDate = new Date(START_DATE);
      const endDate = new Date(END_DATE);

      if (itemDate >= startDate && itemDate <= endDate && TYPES.includes(item.type)) {
        counts[item.type]++;
      }
    });

    return counts;
  }

  function createButton(header, text, count) {
    window.wfes.f.waitForElem("wf-logo").then(elem=>{
      const buttonEl = document.getElementById(buttonID);
      if (null !== buttonEl) {
        // remove
        buttonEl.remove();
      }

      const div = document.createElement("div");
      div.className = "wfesEdChCo";
      div.id = buttonID;

      const headerEl = document.createElement("p");
      headerEl.innerText = header;
      div.appendChild(headerEl);

      const countEl = document.createElement("span");
      countEl.className = "wfesEdChCoText";
      countEl.innerText = count;
      div.appendChild(countEl);

      const textEl = document.createElement("span");
      textEl.className = "wfesEdChCoSmall";
      textEl.innerText = text;
      div.appendChild(textEl);

      const container = elem.parentNode.parentNode;
      container.appendChild(div);
    })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
  }

  function handleContributions() {
    window.wfes.f.addCSS(myCssId, myStyle);
    const contributions = window.wfes.g.nominationsList();

    const result = countContributions(contributions);
    const resultSum = result.PHOTO + result.EDIT_TITLE + result.EDIT_DESCRIPTION + result.EDIT_LOCATION;
    const resulttext = " (P" + result.PHOTO + " T" + result.EDIT_TITLE +
      " D" + result.EDIT_DESCRIPTION + " L" + result.EDIT_LOCATION + ")";

    createButton("2024 Edit Challenge", resulttext, resultSum);
  }

  const init = () => {
    window.addEventListener("WFESNominationListLoaded", handleContributions);

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

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();