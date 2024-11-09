// @name         Edit Challenge Counter
// @version      1.1.2
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
      cursor: pointer;
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
    .wfesEdChCo-bg {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 100vw;
        background-color: rgba(0,0,0,0.5);
        z-index: 100000;
    }
    .wfesEdChCo-popup {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translateX(-50%) translateY(-50%);
        overflow: auto;
        background-color: #fff;
        padding: 1em;
        max-width: 95vw;
        max-height: 95vh;
    }
    .dark .wfesEdChCo-popup {
        background-color: #333;
    }
    .wfesEdChCo-popup h1 {
        margin-bottom: 20px;
        float: left;
        font-size: 1.5rem;
    }
    .wfesEdChCo-close {
        z-index: 2;
        font-size: 2em;
        cursor: pointer;
        opacity: 0.5;
        float: right;
        margin-left: 14px;
    }
    .wfesEdChCo-close:hover {
        opacity: 1;
    }
    .wfesEdChCo-box {
        height: calc(100% - 60px);
        display: flex;
        background-color: #ddd;
        clear: both;
    }
    .dark .wfesEdChCo-box {
        background-color: #222;
    }
    .wfesEdChCo-box > table {
        margin: auto;
        width: 100%; 
        border: 1px;
        border-color: black;
    }
    .wfesEdChCo-box th, td {
        padding: 8px 12px;      /* Abstand innerhalb der Zellen */
        text-align: right;      /* Rechtsbündige Ausrichtung der Inhalte */
    }
    .wfesEdChCo-box th {
        background-color: #eee;
        border-color: #000;
    }
    .wfesEdChCo-box td {
        background-color: #fff;
        border-color: #000;
    }
    .wfesEdChCo-box tr#total th,
    .wfesEdChCo-box tr#total td {
        background-color: #eee;
        font-weight: bold;
    }

    .dark .wfesEdChCo-box th,
    .dark .wfesEdChCo-box td {
        background-color: #333;
        border-color: #eee;
    }
    .dark .wfesEdChCo-box tr#total th,
    .dark .wfesEdChCo-box tr#total td {
        background-color: #444;
        font-weight: bold;
    }
    .wfesEdChCo-box tr#empty > th,
    .wfesEdChCo-box tr#empty > td {
        background-color: #eee;
        font-weight: bold;
    }
    .dark .wfesEdChCo-box tr#empty > th,
    .dark .wfesEdChCo-box tr#empty > td {
        background-color: #000;
    }
    .wfesEdChCo-box td#alltotal {
        color: #20B8E3;
        font-size: x-large;
    }
    /* Anpassungen für Bildschirme bis zu einer Breite von 600px (Mobiltelefone) */
    @media (max-width: 900px) {
        .wfesEdChCo-popup {
            padding: 0.5em;  /* Weniger Abstand um das Popup herum */
            font-size: smaller;
        }
        .wfesEdChCo-popup h1 {
            font-size: 1rem; /* Kleinere Schriftgröße für Mobilgeräte */
            margin-bottom: 10px; /* Weniger Abstand unter dem Titel */
        }
        .wfesEdChCo-box th, td {
            padding: 3px 6px;      /* Abstand innerhalb der Zellen */
        }
    }
    `;

  const buttonID = "wfesECCButton";

  // Startdatum, Enddatum und gesuchte Typen als Konstanten definieren
  const START_DATE = "2024-10-30";
  const END_DATE = "2024-11-13";
  const TYPES = ["PHOTO", "EDIT_TITLE", "EDIT_DESCRIPTION", "EDIT_LOCATION"]; // Typen, die berücksichtigt werden sollen
  const TYPE_LABELS = {
    "PHOTO": "Photo",
    "EDIT_TITLE": "Title",
    "EDIT_DESCRIPTION": "Description",
    "EDIT_LOCATION": "Location"
  };
  const STATUSES = ["NOMINATED", "VOTING", "NIANTIC_REVIEW", "ACCEPTED", "REJECTED", "WITHDRAWN"]; // Erwartete Statuswerte
  const STATUS_LABELS = {
    "NOMINATED": "Nominated",
    "VOTING": "Voting",
    "NIANTIC_REVIEW": "Niantic",
    "ACCEPTED": "Accepted",
    "REJECTED": "Rejected",
    "WITHDRAWN": "Withdrawn"
  };
  // Funktion zur erweiterten Zählung nach Typ und Status
  function countContributionsExtended(contributions) {
    // Zweidimensionales Array für die Zählung initialisieren
    const counts = {};
    TYPES.forEach(type => {
      counts[type] = {};
      STATUSES.forEach(status => {
        counts[type][status] = 0;
      });
    });

    // Zählprozess mit Überprüfung von Typ und Status
    const startDate = new Date(START_DATE);
    const endDate = new Date(END_DATE);

    contributions.forEach(item => {
      const itemDate = new Date(item.day);

      if (itemDate >= startDate && itemDate <= endDate && TYPES.includes(item.type)) {
        if (STATUSES.includes(item.status)) {
          counts[item.type][item.status]++;
        } else {
          console.log("Unbekannter Status:", item.status, "bei ID:", item.id);
        }
      }
    });

    return counts;
  }

  // Modalbox für Ausgabe der erweiterten Statistik
  // Idea and (parts of) code taken from https://github.com/tehstone/wayfarer-addons/raw/main/wayfarer-ticket-saver.user.js
  function showCounterModal() {
    // Funktion zur Umwandlung des Zähl-Arrays in eine HTML-Tabelle
    function generateHTMLTable(counts) {
      let html = "<table>";

      // Tabellenkopf für Typen
      html += "<tr><th>&nbsp;</th>";
      TYPES.forEach(type => {
        const label = TYPE_LABELS[type] || type; // Verwende Übersetzung oder Originalnamen als Fallback
        html += `<th>${label}</th>`;
      });
      html += "<th></th><th>TOTAL</th></tr>";

      // Tabellenzeilen für jeden Status
      STATUSES.forEach(status => {
        const label = STATUS_LABELS[status] || status; // Verwende Übersetzung oder Originalnamen als Fallback
        let rowtotal = 0;
        html += `<tr><th>${label}</th>`;
        TYPES.forEach(type => {
          rowtotal += counts[type][status];
          html += `<td>${counts[type][status]}</td>`;
        });
        html += `<td></td><th>${rowtotal}</th>`;
        html += "</tr>";
      });

      // Leerzeile hinzufügen
      html += `<tr id="empty"><th></th>${TYPES.map(() => "<td></td>").join("")}<td></td><td></td></tr>`;

      html += '<tr id="total"><th>TOTAL</th>';

      let alltotal = 0;
      TYPES.forEach(type => {
        let typeTotal = 0;
        STATUSES.forEach(status => {
          typeTotal += counts[type][status];
        });
        html += `<td>${typeTotal}</td>`;
        alltotal += typeTotal;
      });
      html += `<td></td><td id="alltotal">${alltotal}</td></tr></table>`;

      return html;
    }

    const outer = document.createElement("div");
    outer.classList.add("wfesEdChCo-bg");
    document.querySelector("body").appendChild(outer);

    const inner = document.createElement("div");
    inner.classList.add("wfesEdChCo-popup");
    outer.appendChild(inner);

    const header = document.createElement("h1");
    header.textContent = "2024 Edit Challenge Statistics";
    inner.appendChild(header);

    const closeBtn = document.createElement("div");
    closeBtn.textContent = "❌";
    closeBtn.title = "Close";
    closeBtn.classList.add("wfesEdChCo-close");
    closeBtn.addEventListener("click", () => {
      outer.remove();
    });
    inner.appendChild(closeBtn);

    // contributions holen
    const contributions = window.wfes.g.nominationsList();

    // zählen
    const resultCounts = countContributionsExtended(contributions);
    const htmlTable = generateHTMLTable(resultCounts);

    const box = document.createElement("div");
    box.classList.add("wfesEdChCo-box");
    box.innerHTML = htmlTable;
    inner.appendChild(box);

  }

  // /Modalbox

  // Funktion zur Zählung der Objekte
  function countContributions(contributions) {
    // Zählobjekt für die Ergebnisse
    const counts = {};

    // Initialisiere die Zählwerte für jeden Typ in TYPES
    TYPES.forEach(type => {
      counts[type] = 0;
    });

    // Zählprozess
    const startDate = new Date(START_DATE);
    const endDate = new Date(END_DATE);
    contributions.forEach(item => {
      // Vergleiche Datum und Typ des Objekts
      const itemDate = new Date(item.day);

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
      div.addEventListener("click", showCounterModal);

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
    let resultSum = 0;
    TYPES.forEach(type => {
      resultSum += result[type];
    });
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