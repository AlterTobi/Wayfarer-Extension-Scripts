// @name         Notification Log
// @version      0.0.3
// @description  shows notification log archive
// @author       AlterTobi
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/wfes-NotificationLog.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/wfes-NotificationLog.meta.js

(function() {
  "use strict";

  const sessvarMiss = "warnBase";

  /*
  const myCssId = "templateCSS";
  const myStyle = `body {
        display: none;
    }
    `;
*/

  const idbLogStoreBase = "logMessages"; // Objectstore für Log-Nachrichten
  let idbLogStore = idbLogStoreBase + "_temp";
  //  const mainContentSel = "body > app-root > app-wayfarer > div > mat-sidenav-container > mat-sidenav-content > div";

  // Funktion zum Auslesen von Log-Nachrichten, nach Datum sortiert
  const getLogMessages = () => {
    return new Promise((resolve, reject) => {
      window.wfes.f.getIDBInstance().then(db => {
        const tx = db.transaction([idbLogStore], "readonly");
        const store = tx.objectStore(idbLogStore);
        const request = store.getAll();
        request.onsuccess = () => {
          const logMessages = request.result.sort((a, b) => a.timestamp - b.timestamp);
          resolve(logMessages);
        };
        request.onerror = () => {
          reject("Failed to retrieve log messages");
        };
      })
        .catch(reject);
    });
  };

  function showLogEntries() {
    getLogMessages().then( logs => {
      console.log(logs);
    }
    );
  }


  function notificationLog() {
    // window.wfes.f.addCSS(myCssId, myStyle);

    wfes.f.waitForElem("app-sidebar-link").then(sidebar => {
      /*
            const image = document.createElement('img');
            image.classList.add('sidebar-link__icon');
            image.style.width = '24px';
            image.src = 'data:image/svg+xml;base64,'
                + 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgdmlld0JveD0iMCAwIDc'
                + '1LjExNzcwNiA1Ny43NTQ3MTYiIHZlcnNpb249IjEuMSIgd2lkdGg9Ijc1LjExNzcwNiIgaGVpZ2h0PSI1Ny43NTQ3MTkiIHhtbG'
                + '5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgP'
                + 'HBhdGggZD0ibSAzNy42MTQ3MDksMCBjIC0yMC43MTIsMCAtMzcuNTAyOTk5NTQsMTEuMjY0IC0zNy41MDI5OTk1NCwyNS4xNjYg'
                + 'MCw3LjQ5NCA0Ljg4NTAwMDA0LDE0LjIxOCAxMi42Mjc5OTk1NCwxOC44MjggLTEuNjQ4LDMuMDU0IC00LjkwNDk5OTUsNi45NTE'
                + 'gLTExLjYzOTk5OTUsMTIuMjM0IC0xLjEwMDAwMDAzNjczLDAuODYyIC0yLjQ3NCwyLjExIDEuOTc0LDEuMjIxIDcuNDQ3OTk5NS'
                + 'wtMS40OSAxNS4zOTU5OTk1LC01LjI4OCAyMS40NTQ5OTk1LC04LjY5MyA0LjA3NSwxLjAxOSA4LjQ4MiwxLjU3NyAxMy4wODcsM'
                + 'S41NzcgMjAuNzExLDAgMzcuNTAyLC0xMS4yNjQgMzcuNTAyLC0yNS4xNjYgMCwtMTMuOTAyIC0xNi43OTIsLTI1LjE2NyAtMzcu'
                + 'NTAzLC0yNS4xNjcgeiIgLz4KPC9zdmc+Cg==';
        */
      const text = document.createElement("span");
      text.textContent = "Notifications";
      const a = document.createElement("a");
      a.classList.add("sidebar-link");
      // a.appendChild(image);
      a.appendChild(text);
      a.addEventListener("click", showLogEntries);
      const item = document.createElement("div");
      item.appendChild(a);
      sidebar.parentNode.appendChild(item);
    });

  }

  const init = () => {
    window.addEventListener("WFESHomePageLoaded", notificationLog);

    window.wfes.g.userId().then(name => {
      idbLogStore = idbLogStoreBase + "_" + name;
    })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
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