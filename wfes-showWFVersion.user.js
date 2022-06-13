// ==UserScript==
// @name           WFES - show Wayfarer version
// @version        1.0.1
// @description    show current Wayfarer version
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-showWFVersion.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-showWFVersion.meta.js
// @match          https://wayfarer.nianticlabs.com/*
// @grant          none
// ==/UserScript==

(function() {
  "use strict";

  const versionDivID = "wfVersionDiv";
  const myCssId = "wfVersionCSS";
  const myStyle = `.wfVersionCSS {
    position: absolute;
    z-index: 9999;
    left: 15px;
    top: 10px;
    background-color: white;
    border: 2px solid red;
    padding: 5px; box-shadow: 7px 7px 5px grey;}
    `;

  function showVersion() {
    const wfVersion = window.wfes.g.wfVersion();
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

  window.addEventListener("WFESVersionChanged", showVersion);

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
