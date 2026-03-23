// ==UserScript==
// @name           WFES - dupes Scroll
// @version        1.1.3
// @description    make duplicates strip scrollable by mouse wheel
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://altertobi.github.io/Wayfarer-Extension-Scripts/assets/icon_32.png
// @icon64         https://altertobi.github.io/Wayfarer-Extension-Scripts/assets/icon_64.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-dupesScroll.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-dupesScroll.meta.js
// @match          https://wayfarer.nianticlabs.com/*
// @grant          none
// ==/UserScript==

/* Copyright 2026 AlterTobi

   This file is part of the Wayfarer Extension Scripts collection. Further scripts
   can be found on the @homepage, see above.

   Wayfarer Extension Scripts are free software: you can redistribute and/or modify
   them under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   Wayfarer Extension Scripts are distributed in the hope that they will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   GNU General Public License for more details.

   You can find a copy of the GNU General Public License at the
   web space where you got this script from
   https://altertobi.github.io/Wayfarer-Extension-Scripts/LICENSE.txt
   If not, see <http://www.gnu.org/licenses/>.
*/

(function() {
  "use strict";
  const baseMinVersion = "1.7.0";

  function filmStripScroll() {
    // Make film strip (duplicates) scrollable
    const filmStripSelector ="#check-duplicates-card div.w-full.flex.overflow-x-auto.overflow-y-hidden.ng-star-inserted";
    const candidate = window.wfes.g.reviewPageData();

    function horizontalScroll(e) {
      this.scrollLeft += e.deltaY;
      e.preventDefault(); // Stop regular scroll
    }

    if (candidate.nearbyPortals.length > 0) {
      window.wfes.f.waitForElem(filmStripSelector).then((elem)=>{
      // Hook function to scroll event in filmstrip
        elem.addEventListener("wheel", horizontalScroll, false);

        // Schleife über alle Bilder
        const bilder = document.querySelectorAll(filmStripSelector + " img");
        for (let i = 0; i < bilder.length; i++) {
          const img = bilder[i];
          const alt = img.getAttribute("alt");

          // Wenn das Bild einen Alt-Text hat, füge einen title-Text hinzu
          if (alt) {
            img.setAttribute("title", alt);
          }
        }
      })
        .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    }
  }

  if (window.wfes.f.hasMinVersion(baseMinVersion)) {
    window.addEventListener("WFESReviewPageNewLoaded", filmStripScroll);
  } else {
    console.warn(GM_info.script.name, "Need at least wfes-Base version ", baseMinVersion, " Please upgrade.");
  }

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
