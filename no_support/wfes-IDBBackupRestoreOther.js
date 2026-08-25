// @name         Backup IDB Data from wayfarer tools
// @version      0.1.1
// @description  backup and restore of wayfarer tools IDB data
// @author       AlterTobi

(function() {
  "use strict";

  const sessvarMiss = "warnBase";
  const baseMinVersion = "2.8.5";
  const myCssId = "wfesBackupRestoreOtherOtherCSS";
  const myStyle = `.wfesBackupRestoreOther {
      color: #333;
      margin-left: 2em;
      padding-top: 0.3em;
      text-align: center;
      display: block;
    }
    .dark .wfesBackupRestoreOther {
      color: #ddd;
    }
    .wfesBackupRestoreOtherButton {
        margin: 0 auto;
        padding: 0em 0.3em;
    }
    .wfbkCDown {
        color: #32D6B8;
    }
    .wfbkCUp {
        color: #F7b105;
    }
    `;

  const buttonID = "wfesBackupRestoreOtherButton";

  const idbName = "wayfarer-tools-db";

  function getDateTimeAsString() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${year}${month}${day}_${hours}${minutes}`;
  }


  function removeButton() {
    const button = document.getElementById(buttonID);
    if (button !== null) {
      button.remove();
    }
  }

  /* =========== IndexedDB ============================= */
  const getIDBInstance = version => new Promise((resolve, reject) => {

    if (!window.indexedDB) {
      reject("This browser doesn't support IndexedDB!");
      return;
    }

    const openRequest = window.indexedDB.open(idbName, version);
    openRequest.onsuccess = event => {
      const db = event.target.result;
      resolve(db);
    };
    openRequest.onerror = (event) => {
      console.error("Error using IndexedDB", event.target.errorCode);
      reject(event.target.error);
    };
  });
  /* =========== /IndexedDB ============================ */

  const exportIDB = async function() {
    const db = await getIDBInstance();

    const tx = db.transaction(db.objectStoreNames, "readonly");
    const promises = [];

    for (let i = 0; i < db.objectStoreNames.length; i++) {
      const storeName = db.objectStoreNames.item(i);
      const store = tx.objectStore(storeName);

      promises.push(
        new Promise((resolve, reject) => {
          const request = store.getAll();

          request.onsuccess = () => {
            resolve([storeName, request.result]);
          };

          request.onerror = event => {
            reject(event.target.error);
          };
        })
      );
    }

    const stores = await Promise.all(promises);

    return Object.fromEntries(stores);
  };


  async function downloadBackup() {
    const data = await exportIDB();

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const datestr = getDateTimeAsString();
    const a = document.createElement("a");
    a.href = url;
    a.download = "wayfarer-indexeddb-backup_" + datestr + ".json";
    a.click();

    URL.revokeObjectURL(url);
  }

  const importIDB = async function(records) {
    return records;
    /*
    const db = await getIDBInstance();

    return new Promise((resolve, reject) => {
      const tx = db.transaction([idbLocalStorageCompat], "readwrite");
      const store = tx.objectStore(idbLocalStorageCompat);

      for (const record of records) {
        store.put(record);
      }

      tx.oncomplete = () => {
        db.close();
        resolve();
        window.wfes.f.createNotification("import done");
      };

      tx.onerror = reject;
    });
*/
  };
  function showButton() {
    window.wfes.f.waitForElem("wf-logo").then(elem => {
      // remove if exist
      removeButton();
      const div = document.createElement("div");
      div.className = "wfesBackupRestoreOther activ";
      div.id = buttonID;

      const headline = document.createElement("p");
      headline.innerText = "WF Backup";

      const downButton = document.createElement("button");
      downButton.title = "backup and download";
      downButton.className = "wfesBackupRestoreOtherButton wfbkCDown";
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
      upButton.className = "wfesBackupRestoreOtherButton wfbkCUp";
      upButton.innerHTML = '<span class="material-icons">upload</span>';
      upButton.addEventListener("click", function() {
        input.click();
      });

      input.onchange = async() => {
        if (!input.files.length) {return;}
        try {
          const backup = JSON.parse(await input.files[0].text());
          await importIDB(backup);
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