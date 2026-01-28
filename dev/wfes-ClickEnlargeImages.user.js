// ==UserScript==
// @name           WFES - Click Enlarge Images
// @version        1.0.0
// @description    auto-click the enlarge images symbols (requires image mod script)
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/assets/icon_32.png
// @icon64         https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/assets/icon_64.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/wfes-ClickEnlargeImages.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/wfes-ClickEnlargeImages.meta.js
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
   https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/LICENSE.txt
   If not, see <http://www.gnu.org/licenses/>.
*/

(function() {
  "use strict";

  const l1Sel = "app-photo-b > wf-review-card-b > div.wf-review-card__body > div > a.lupe";
  const l2Sel = "app-supporting-info-b > wf-review-card-b > div.wf-review-card__body > div > a.lupe";

  function click() {
    window.wfes.f.waitForElem(l2Sel).then((elem)=>{ elem.click(); })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    window.wfes.f.waitForElem(l1Sel)
      .then((elem)=>{ elem.click(); })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
  }

  window.addEventListener("WFESReviewPageNewLoaded", click);

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();