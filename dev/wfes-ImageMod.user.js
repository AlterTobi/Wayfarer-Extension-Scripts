// ==UserScript==
// @name           WFES - image Mods
// @version        1.2.0
// @description    open fullsize images in "named" tabs
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/assets/icon_32.png
// @icon64         https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/assets/icon_64.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/wfes-ImageMod.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/wfes-ImageMod.meta.js
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

  function addFullImageButton(elem, url, target, position = "afterEnd", styleclass = "lupe", elemID=false, spanclass = "") {
    const a = document.createElement("a");
    const span = document.createElement("span");

    span.className = "material-icons material-icons-fontsize " + spanclass;
    span.appendChild(document.createTextNode("search"));
    a.appendChild(span);
    a.target = target;
    a.href = url;
    if (elemID) {
      a.id = elemID;
    }
    a.className = styleclass;
    switch (position) {
      case "afterEnd":
      case "beforeBegin":
        elem.parentNode.style.position = "relative";
        break;
      case "beforeEnd":
      case "afterBegin":
        elem.style.position = "relative";
        break;
    }
    elem.insertAdjacentElement(position, a);
  }

  // setImage URL on existing element
  function setImageURL(buttonID, imageUrl) {
    const elem = document.getElementById(buttonID);
    elem.href = imageUrl;
  }

  function addFullSizeImageLinksReview() {
    const myCssId = "imageModsCSSReview";
    const myStyle = `.material-icons-fontsize {
        font-size: 48px;
      }
      .lupe {
        position: absolute;
        left: 0px;
      }
      .bottom {
        bottom: 0px;
      }
    `;

    let elem, imageUrl;
    const myData = window.wfes.g.reviewPageData();

    window.wfes.f.addCSS(myCssId, myStyle);
    switch (myData.type) {
      case "NEW":
        elem = document.getElementsByClassName("wf-image-modal flex-grow bg-contain bg-center bg-no-repeat");
        imageUrl = myData.imageUrl + "=s0";
        addFullImageButton(elem[0], imageUrl, "mainImage");

        // Supporting Image
        if (myData.supportingImageUrl) {
          imageUrl = myData.supportingImageUrl + "=s0";
          addFullImageButton(elem[1], imageUrl, "supportingImage");
        }
        break;
      case "EDIT":
        elem = document.getElementsByClassName("wf-image-modal");
        imageUrl = myData.imageUrl + "=s0";
        addFullImageButton(elem[0], imageUrl, "mainImage", "beforeBegin");
        break;
      case "PHOTO":
        elem = document.getElementsByClassName("photo-card__photo");
        for (let i=0; i < elem.length; i++) {
          imageUrl = myData.newPhotos[i].value + "=s0";
          addFullImageButton(elem[i].parentNode.parentNode.parentNode, imageUrl, "additionalImage", "beforeEnd", "lupe bottom");
        }
        break;
    }
  }

  function addFullSizeImageLinksNomDetail() {
    const myCssId = "imageModsCSSNomDetail";
    const myStyle = `.material-icons-fontsize {
        font-size: 48px;
      }
      .lupesup {
        position: absolute;
        left: 0px;
        top: 20px;
      }
      .luperel {
        position: relative;
        left: 0px;
      }
      .absolute {
        position: absolute;
      }
    `;

    const buttonIDmain = "imageModsBtnMain";
    const buttonIDsup = "imageModsBtnSup";

    let imageUrl;
    const myData = window.wfes.g.nominationDetail();
    // only nominations, for edits use Wayfarer Contribution Management Layout
    if ("NOMINATION" === myData.type) {
      window.wfes.f.addCSS(myCssId, myStyle);

      const elem = document.getElementsByClassName("wf-image-modal details-pane__image");
      imageUrl = myData.imageUrl + "=s0";

      // main Image
      if ( null === document.getElementById(buttonIDmain)) {
        addFullImageButton(elem[0], imageUrl, "mainImage", "beforeBegin", "luperel", buttonIDmain, "absolute");
      } else {
        setImageURL(buttonIDmain, imageUrl);
      }

      // Supporting Image
      if (myData.supportingImageUrl) {
        imageUrl = myData.supportingImageUrl + "=s0";
        if ( null === document.getElementById(buttonIDsup)) {
          addFullImageButton(elem[1].parentNode, imageUrl, "supportingImage", "beforeEnd", "lupesup", buttonIDsup);
        } else {
          setImageURL(buttonIDsup, imageUrl);
        }
      }
    } else {
      // remove magnifier
      [buttonIDmain, buttonIDsup].forEach(buttonID => {
        const element = document.getElementById(buttonID);
        if (element) {element.remove();}
      });
    }
  }

  window.addEventListener("WFESNominationDetailLoaded", () => {setTimeout(addFullSizeImageLinksNomDetail, 100);});
  window.addEventListener("WFESReviewPageLoaded", () => {setTimeout(addFullSizeImageLinksReview, 100);});

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
