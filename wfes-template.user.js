// ==UserScript==
// @name           WFES - Template
// @version        1.2.0
// @description    Template (do not install)
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://altertobi.github.io/Wayfarer-Extension-Scripts/assets/icon_32.png
// @icon64         https://altertobi.github.io/Wayfarer-Extension-Scripts/assets/icon_64.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-template.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-template.meta.js
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

  const sessvarMiss = "warnBase";
  const baseMinVersion = "2.3.0";
  const myCssId = "templateCSS";
  const myStyle = `body {
        display: none;
    }
    `;

  function myTemplate() {
    window.wfes.f.addCSS(myCssId, myStyle);
    // YOUR CODE HERE
    // .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
  }

  const init = () => {
    window.addEventListener("WFESHomePageLoaded", myTemplate);

  };

  // === no changes needed below this line ======================
  if("undefined" === typeof(wfes)) {
    if (undefined === sessionStorage[sessvarMiss]) {
      sessionStorage[sessvarMiss] = 1;
      alert("Missing WFES Base. Please install from https://altertobi.github.io/Wayfarer-Extension-Scripts/");
      console.error("Missing WFES Base. Please install from https://altertobi.github.io/Wayfarer-Extension-Scripts/");
    }
  } else if (window.wfes.f.hasMinVersion(baseMinVersion)) {
    init();
  } else {
    console.warn(GM_info.script.name, "Need at least wfes-Base version ", baseMinVersion, " Please upgrade.");
  }

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();