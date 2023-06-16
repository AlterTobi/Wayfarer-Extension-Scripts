// @name         show Wayfarer version
// @version      1.3.0
// @description  show current Wayfarer version
// @author       AlterTobi

(function() {
  "use strict";

  const versionDivID = "wfVersionDiv";
  const myCssId = "wfVersionCSS";
  const myStyle = `.wfVersionCSS {
    position: absolute;
    z-index: 9999;
    right: 70px;
    top: 10px;
    background-color: white;
    border: 2px solid red;
    padding: 5px;
    max-width: 50%;
    box-shadow: 7px 7px 5px grey;
    cursor: pointer;}
    /* Styles for dark mode */
    @media (prefers-color-scheme: dark) {
    .wfVersionCSS {
        background-color: #303030;
        box-shadow: 6px 6px 4px darkgrey;
      }
    }
    .wfes-hidden { display: none; }
    .wfes-versionChanged {
      background-color: red !important;
      border-color: yellow !important;
      color: white !important;
    }
    `;

  const lStoreHist = "wfes_WFVersionHistory";
  let wfVersion;

  function showVersion(history) {
    function toggleVersions() {
      const versionList = document.getElementById("version-list");
      versionList.classList.toggle("wfes-hidden");
    }

    window.wfes.f.addCSS(myCssId, myStyle);
    // Erstelle das Dropdown-Menü
    const versionDropdown = document.createElement("div");
    versionDropdown.setAttribute("id", "version-dropdown");

    const versionButton = document.createElement("button");
    versionButton.setAttribute("id", "version-button");
    versionButton.appendChild(document.createTextNode("Version: " + wfVersion));
    versionDropdown.appendChild(versionButton);

    const versionList = document.createElement("ul");
    versionList.setAttribute("id", "version-list");
    versionList.setAttribute("class", "wfes-hidden");
    versionList.style.fontFamily = "Courier New, monospace"; // Nichtproportionaler Font
    versionDropdown.appendChild(versionList);

    for (let i = history.length - 1; i >= 0; i--) {
      const version = history[i].version;
      const date = history[i].date;
      const listItem = document.createElement("li");
      listItem.textContent = `${version} (${date})`;
      versionList.appendChild(listItem);
    }

    if (null === document.getElementById(versionDivID)) {
      const bodyElem = document.getElementsByTagName("body")[0];
      const versionDiv = document.createElement("div");
      versionDiv.setAttribute("class", "wfVersionCSS");
      versionDiv.setAttribute("id", versionDivID);
      versionDiv.appendChild(versionDropdown);
      bodyElem.appendChild(versionDiv);
    } else {
      const versionDiv = document.getElementById(versionDivID);
      // remove existing child first - skip null check, because it must be there
      versionDiv.removeChild(document.getElementById("version-dropdown"));
      versionDiv.appendChild(versionDropdown);
    }
    versionDropdown.addEventListener("click", toggleVersions);
  }

  function versionChanged() {
    console.warn(GM_info.script.name, "version changed");
    const elem = document.getElementById(versionDivID);
    if (null !== elem) {
      elem.classList.add("wfes-versionChanged");
    }
  }

  function handleVersion(versionHistory) {
    // get latest version
    const len = versionHistory.length;
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    const now = new Date().toLocaleString(undefined, options);
    const v = {};
    v.date = now;
    v.version = wfVersion;

    if ( len > 0 ) {
      const last = versionHistory[len-1].version;
      if (last !== wfVersion) {
        versionChanged();
        versionHistory.push(v);
        window.wfes.f.localSave(lStoreHist, versionHistory);
      }
    } else {
      // first entry
      versionHistory.push(v);
      window.wfes.f.localSave(lStoreHist, versionHistory);
    }
  }

  function init() {
    wfVersion = window.wfes.g.wfVersion();
    window.wfes.f.localGet(lStoreHist, []).then((hist)=>{
      showVersion(hist);
      handleVersion(hist);
    });
  }

  window.addEventListener("WFESVersionChanged", init);

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
