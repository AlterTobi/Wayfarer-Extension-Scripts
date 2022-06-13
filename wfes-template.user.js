// ==UserScript==
// @name           WFES - Template
// @version        1.0.0
// @description    Template
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-template.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-template.meta.js
// @match          https://wayfarer.nianticlabs.com/*
// @grant          none
// ==/UserScript==

(function() {
  "use strict";

  const myCssId = "templateCSS";
  const myStyle = `body {
    display: none;
    `;

  function myTemplate() {
    window.wfes.f.addCSS(myCssId, myStyle);
    // YOUR CODE HERE
  }

  window.addEventListener("WFESHomePageLoaded", myTemplate);

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();