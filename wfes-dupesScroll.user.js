// ==UserScript==
// @name           WFES - dupes Scroll
// @version        1.0.1
// @description    make duplicates strip scrollable by mouse wheel
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-dupesScroll.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-dupesScroll.meta.js
// @match          https://wayfarer.nianticlabs.com/*
// @grant          none
// ==/UserScript==

(function() {
  "use strict";

  function filmStripScroll() {
    // Make film strip (duplicates) scrollable
    const filmStripElem = document
      .querySelector("#check-duplicates-card div.w-full.flex.overflow-x-auto.overflow-y-hidden.ng-star-inserted");

    function horizontalScroll(e) {
      filmStripElem.scrollLeft += e.deltaY;
      e.preventDefault(); // Stop regular scroll
    }

    if (null === filmStripElem) {
      setTimeout(filmStripScroll, 100);
      return;
    }

    // Hook function to scroll event in filmstrip
    filmStripElem.addEventListener("wheel", horizontalScroll, false);
  }

  window.addEventListener("WFESReviewPageNewLoaded", filmStripScroll);

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
