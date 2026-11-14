// @name         Appeal Status
// @version      1.1.98
// @description  tells you if an appeal is available

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

  /*
  const myCssId = "wfesAppealStatusCSS";
  const myStyle = `.wfesAppealStatus {
      color: #333;
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

  function removeButton() {
    const button = document.getElementById(buttonID);
    if (button !== null) {
      button.remove();
    }
  }

  function showButton() {
    window.wfes.f.waitForElem("wf-logo").then(elem => {
      // remove if exist
      removeButton();
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
      const container = elem.parentNode.parentNode;
      container.appendChild(div);
    })
      .catch((e) => {
        console.warn(GM_info.script.name, ": ", e);
      });
  }

  const init = () => {
    // auf Nominationsseite
    window.addEventListener("WFESNominationListLoaded", showButton);
    window.wfes.f.addCSS(myCssId, myStyle);
  };

  // === Start ==================================================
  init();
  logger.info(`Script loaded: version: ${SCRIPT_VERSION}`);
*/
  logger.error(`need fix and update: ${SCRIPT_VERSION}`);

})();