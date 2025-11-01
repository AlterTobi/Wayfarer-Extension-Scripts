// ==UserScript==
// @name           WFES - URLify
// @version        1.3.5
// @description    detect links in supporting information
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/assets/icon_32.png
// @icon64         https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/assets/icon_64.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/wfes-URLify.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/wfes-URLify.meta.js
// @match          https://wayfarer.nianticlabs.com/*
// @grant          none
// ==/UserScript==

/* Copyright 2025 AlterTobi

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

  const myCssId = "wfes-urlifyCSS";
  const myStyle = `.wfes-extLnkBtn{
        border: 2pt solid white;
        border-radius: 2pt;
        width: 17pt;
        height: 17pt;
        font-size: 14px;
        background-color: white;
        color: black;
        display: inline-block;
        box-shadow: 0 0 2px grey;
      }
  `;

  const myReg = /((https?:\/\/)[-\w@:%_+.~#?,&/=!]+)/g;
  const supStmtSel = "app-supporting-info-b > wf-review-card-b > div.wf-review-card__body > div > div.mt-2.bg-gray-200.px-4.py-2.ng-star-inserted";

  // Button setzen
  function setSmallButton(url, elem) {
    const wfesExtLnkBtn = document.createElement("a");
    wfesExtLnkBtn.setAttribute("target", "_blank");
    wfesExtLnkBtn.setAttribute("class", "wfes-extLnkBtn");
    wfesExtLnkBtn.setAttribute("title", encodeURI(url));
    wfesExtLnkBtn.href = encodeURI(url);
    wfesExtLnkBtn.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'><path fill-rule='evenodd' d='M10.604 1h4.146a.25.25 0 01.25.25v4.146a.25.25 0 01-.427.177L13.03 4.03 9.28 7.78a.75.75 0 01-1.06-1.06l3.75-3.75-1.543-1.543A.25.25 0 0110.604 1zM3.75 2A1.75 1.75 0 002 3.75v8.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 12.25v-3.5a.75.75 0 00-1.5 0v3.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-8.5a.25.25 0 01.25-.25h3.5a.75.75 0 000-1.5h-3.5z'/></svg>";
    elem.appendChild(wfesExtLnkBtn);
  }

  function detectURL() {
    const candidate = window.wfes.g.reviewPageData();
    window.wfes.f.addCSS(myCssId, myStyle);

    if (undefined !== candidate.statement) {
      const urls = candidate.statement.match(myReg);
      if (null !== urls) {
        window.wfes.f.waitForElem(supStmtSel)
          .then(elem => {
            urls.forEach(function(url) {
              setSmallButton(url, elem);
            });
          })
          .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
      }
    }
  }

  function init() {
    window.addEventListener("WFESReviewPageNewLoaded", detectURL);
  }

  init();

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();