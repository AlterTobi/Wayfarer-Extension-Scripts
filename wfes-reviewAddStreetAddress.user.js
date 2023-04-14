// ==UserScript==
// @name           WFES - review Add Street Address
// @version        1.0.4
// @description    fix for missing Street Address in Wayfarer 5.2
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-reviewAddStreetAddress.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-reviewAddStreetAddress.meta.js
// @match          https://wayfarer.nianticlabs.com/*
// @grant          none
// ==/UserScript==

/* Copyright 2023 AlterTobi

   This file is part of the Wayfarer Extension Scripts collection.

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

  function addStreetAddress() {
    window.wfes.f.waitForElem("app-should-be-wayspot > wf-review-card > div.wf-review-card__footer.ng-star-inserted")
      .then((elem) => {
        const data = window.wfes.g.reviewPageData();
        const atext = document.createElement("span");
        atext.appendChild(document.createTextNode(data.streetAddress));
        atext.style.backgroundColor = "yellow";
        elem.insertAdjacentElement("afterBegin", atext);
      });
  }

  window.addEventListener("WFESReviewPageNewLoaded", addStreetAddress);

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
