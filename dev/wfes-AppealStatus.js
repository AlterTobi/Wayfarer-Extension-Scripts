// @name         Appeal Status
// @version      0.1.0
// @description  simply shows if you have an appeal available
// @author       AlterTobi

(function() {
  "use strict";

  const sessvarMiss = "warnBase";
  const baseMinVersion = "2.8.5";
  const myCssId = "wfesAppealStatusCSS";
  const myStyle = `.wfesAppealStatus {
      color: #333;
      margin-left: 2em;
      padding-top: 0.3em;
      text-align: center;
      display: block;
    }
    .dark .wfesAppealStatus {
      color: #ddd;
    }
    .wfesAppealStatusButtonYes {
        color: #62D638;
        margin: 0 auto;
    }
    .wfesAppealStatusButtonNo {
        color: #E13535;
        margin: 0 auto;
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
      headline.innerText = "Appeal Status";

      const canAppeal = window.wfes.g.canAppeal();

      const statusButton = document.createElement("button");
      statusButton.title = "appeal status";

      if (canAppeal) {
        statusButton.className = "wfesAppealStatusButtonYes";
        statusButton.innerHTML = '<span class="material-icons">check_circle</span>';
      } else {
        statusButton.className = "wfesAppealStatusButtonNo";
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
    // auf Profil-Seite einblenden
    window.addEventListener("WFESNominationListLoaded", showButton);
    window.wfes.f.addCSS(myCssId, myStyle);
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
    const msg = GM_info.script.name + "Need at least wfes-Base version " + baseMinVersion+ " Please upgrade.";
    console.warn(msg);
    window.wfes.f.createNotification( msg, "red", {autoclose: 60});
  }

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();