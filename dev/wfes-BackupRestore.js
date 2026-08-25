// @name         Backup Restore IDB Data
// @version      0.4.0
// @description  Allows backup and restore of WFES IDB data
// @author       AlterTobi
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/wfes-IDBBackupRestore.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/wfes-IDBBackupRestore.meta.js

(function() {
  "use strict";

  const sessvarMiss = "warnBase";
  const baseMinVersion = "2.8.5";
  const myCssId = "wfesBackupRestoreCSS";
  const myStyle = `.wfesBackupRestore {
      color: #333;
      margin-left: 2em;
      padding-top: 0.3em;
      text-align: center;
      display: block;
    }
    .dark .wfesBackupRestore {
      color: #ddd;
    }
    .wfesBackupRestoreButton {
        color: #20B8E3;
        margin: 0 auto;
        padding: 0em 0.3em;
    }
    `;

  const buttonID = "wfesBackupRestoreButton";

  function removeButton() {
    const button = document.getElementById(buttonID);
    if (button !== null) {
      button.remove();
    }
  }

  async function downloadBackup() {

    const userId = await window.wfes.g.userId;
    const data = await window.wfes.f.exportIDB(userId);

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "wfes-indexeddb-backup.json";
    a.click();

    URL.revokeObjectURL(url);
  }

  function showButton() {
    window.wfes.f.waitForElem("wf-logo").then(elem => {
      // remove if exist
      removeButton();
      const div = document.createElement("div");
      div.className = "wfesBackupRestore";
      div.id = buttonID;

      const headline = document.createElement("p");
      headline.innerText = "WFES Backup";

      const downButton = document.createElement("button");
      downButton.title = "backup and download";
      downButton.className = "wfesBackupRestoreButton";
      downButton.innerHTML = '<span class="material-icons">download</span>';
      downButton.addEventListener("click", function() {
        downloadBackup();
      });

      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json,application/json";
      input.style.display = "none";

      const upButton = document.createElement("button");
      upButton.title = "upload and restore";
      upButton.className = "wfesBackupRestoreButton";
      upButton.innerHTML = '<span class="material-icons">upload</span>';
      upButton.addEventListener("click", function() {
        input.click();
      });

      input.onchange = async() => {
        if (!input.files.length) {return;}
        try {
          const backup = JSON.parse(await input.files[0].text());
          await window.wfes.f.importIDB(backup);
        } finally {
          input.value = "";
        }
      };

      div.appendChild(headline);
      div.appendChild(downButton);
      div.appendChild(upButton);
      const container = elem.parentNode.parentNode;
      container.appendChild(div);
    })
      .catch((e) => {
        console.warn(GM_info.script.name, ": ", e);
      });
  }

  const init = () => {
    // auf Profil-Seite einblenden
    window.addEventListener("WFESProfileLoaded", showButton);
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