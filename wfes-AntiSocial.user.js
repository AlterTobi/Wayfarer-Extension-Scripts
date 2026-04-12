// ==UserScript==
// @name           WFES - Anti Social
// @version        1.0.1
// @description    hides group size selection from socialize card (greetings to @Tntnnbltn)
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://altertobi.github.io/Wayfarer-Extension-Scripts/assets/icon_32.png
// @icon64         https://altertobi.github.io/Wayfarer-Extension-Scripts/assets/icon_64.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-AntiSocial.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-AntiSocial.meta.js
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

  const myCssId = "antiSocialCSS";
  const myStyle = `div#socialize-card > div:nth-child(2) {
    display: none;
    }
    `;

  function antiSocial() {
    window.wfes.f.addCSS(myCssId, myStyle);
  }

  window.addEventListener("WFESReviewPageNewLoaded", antiSocial);

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();