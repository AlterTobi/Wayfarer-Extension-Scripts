// @name         show Wayfarer version
// @version      1.2.2
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
    box-shadow: 7px 7px 5px grey;}
    /* Styles for dark mode */
    @media (prefers-color-scheme: dark) {
    .wfVersionCSS {
        background-color: #303030;
        box-shadow: 6px 6px 4px darkgrey;
      }
    }
    `;

  const lStoreHist = "wfes_WFVersionHistory";
  let wfVersion;

  function showVersion(wfVersion) {
    window.wfes.f.addCSS(myCssId, myStyle);
    if (null === document.getElementById(versionDivID)) {
      const bodyElem = document.getElementsByTagName("body")[0];
      const versionDiv = document.createElement("div");
      versionDiv.setAttribute("class", "wfVersionCSS");
      versionDiv.innerText = "version: " + wfVersion;
      bodyElem.appendChild(versionDiv);
    } else {
      const versionDiv = document.getElementById(versionDivID);
      versionDiv.innerText = "version: " + wfVersion;
    }
  }

  function handleVersion(versionHistory) {
    // get latest version
    const len = versionHistory.length;
    const now = new Date().toLocaleString();
    const v = {};
    v.date = now;
    v.version = wfVersion;

    if ( len > 0 ) {
      const last = versionHistory[len-1].version;
      if (last !== wfVersion) {
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
    showVersion(wfVersion);
    window.wfes.f.localGet(lStoreHist, []).then((hist)=>{
      handleVersion(hist);
    });
  }

  window.addEventListener("WFESVersionChanged", init);

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
