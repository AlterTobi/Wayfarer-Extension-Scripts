// ==UserScript==
// @name         WFES - dupes Scroll
// @namespace    https://github.com/AlterTobi/WFES/
// @version      0.9.0
// @description  WFES make duplicates strip scrollable by mouse wheel
// @author       AlterTobi
// @match        https://wayfarer.nianticlabs.com/*
// @icon         https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @downloadURL  https://github.com/AlterTobi/WFES/raw/release/v0.9/wfes-dupesScroll.user.js
// @supportURL   https://github.com/AlterTobi/WFES/issues
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function filmStripScroll() {
        // Make film strip (duplicates) scrollable
        function horizontalScroll(e) {
            filmStripElem.scrollLeft += e.deltaY;
            e.preventDefault(); // Stop regular scroll
        }

        let filmStripElem = document
                .querySelector('#check-duplicates-card div.w-full.flex.overflow-x-auto.overflow-y-hidden.ng-star-inserted');

        if (null === filmStripElem) {
            setTimeout(filmStripScroll, 100);
            return;
        }

        // Hook function to scroll event in filmstrip
        filmStripElem.addEventListener("wheel", horizontalScroll, false);
    }

    window.addEventListener("WFESReviewPageNewLoaded", filmStripScroll);

    console.log("WFES Script loaded: Dupes Scroll");
})();