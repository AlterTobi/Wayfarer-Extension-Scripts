// ==UserScript==
// @name           WFES - image Mods
// @version        1.4.0
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

  let _currentSupImage = 0; // zähler des aktuellen Zusatzbildes
  let _supImageCount = 1; // wieviel Zusatzbilder gibt es?
  let _supImages; // speichern die imageUrls

  const reviewSupBtnPrevSelector = "app-supporting-info-b > wf-review-card-b wf-image-carousel button.nav-button.prev-button";
  const reviewSupBtnNextSelector = "app-supporting-info-b > wf-review-card-b wf-image-carousel button.nav-button.next-button";
  const contribSupBtnPrevSelector = "app-details-pane wf-image-carousel button.nav-button.prev-button";
  const contribSupBtnNextSelector = "app-details-pane wf-image-carousel button.nav-button.next-button";

  const supLensId= "lupesup";

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
      default:
        break;
    }
    elem.insertAdjacentElement(position, a);
  }

  // setImage URL on existing element
  function setImageURL(buttonID, imageUrl) {
    const elem = document.getElementById(buttonID);
    elem.href = imageUrl;
  }

  // Review Handler
  function handleButtonClick(value) {
    // Modulo rechnen - _supImageCount addieren um negative Werte zu vermeiden
    _currentSupImage = (_currentSupImage + value + _supImageCount) % _supImageCount;
    setImageURL(supLensId, _supImages[_currentSupImage]);
  }

  // Click-Handler for supporting images (left/right)
  function reviewAddClickHandlerSupImg() {
    window.wfes.f.waitForElem(reviewSupBtnPrevSelector).then(elem=> {
      if (!elem.dataset.contribClickBound) {
        elem.addEventListener("click", () => handleButtonClick(-1));
        elem.dataset.contribClickBound = "1";
      }
    });
    window.wfes.f.waitForElem(reviewSupBtnNextSelector).then(elem=> {
      if (!elem.dataset.contribClickBound) {
        elem.addEventListener("click", () => handleButtonClick( 1));
        elem.dataset.contribClickBound = "1";
      }
    });
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
      #lupesup {
        position: absolute;
        left: 0px;
        top: 0px;
        z-index: 300;
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
        if (myData.supportingImageUrls) {
          elem = document.getElementsByClassName("supporting-info-img-container");
          if (1 === myData.supportingImageUrls.length) {
            imageUrl = myData.supportingImageUrls[0] + "=s0";
            addFullImageButton(elem[0], imageUrl, "supportingImage", "afterEnd", "", supLensId);
          } else if (myData.supportingImageUrls.length > 1) {
            _supImages = []; // leeren, falls die vom vorhergehenden noch gefüllt sind))
            _currentSupImage = 0;
            _supImageCount = myData.supportingImageUrls.length;
            for (let i = 0; i < _supImageCount; i++) {
              const imageUrl = myData.supportingImageUrls[i] + "=s0";
              _supImages.push(imageUrl);
            }
            addFullImageButton(elem[0], _supImages[0], "supportingImage", "afterEnd", "", supLensId);
            reviewAddClickHandlerSupImg();
          }
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

  // Contribution List Handler
  const buttonIDmain = "imageModsBtnMain";
  const buttonIDsup = "imageModsBtnSup";

  function contribHandleButtonClick(value) {
    // Modulo rechnen - _supImageCount addieren um negative Werte zu vermeiden
    _currentSupImage = (_currentSupImage + value + _supImageCount) % _supImageCount;
    setImageURL(buttonIDsup, _supImages[_currentSupImage]);
  }


  // Click-Handler for supporting images (left/right)
  function contribAddClickHandlerSupImg() {
    window.wfes.f.waitForElem(contribSupBtnPrevSelector).then(elem=> {
      if (!elem.dataset.contribClickBound) {
        elem.addEventListener("click", () => contribHandleButtonClick(-1));
        elem.dataset.contribClickBound = "1";
      }
    });
    window.wfes.f.waitForElem(contribSupBtnNextSelector).then(elem=> {
      if (!elem.dataset.contribClickBound) {
        elem.addEventListener("click", () => contribHandleButtonClick( 1));
        elem.dataset.contribClickBound = "1";
      }
    });
  }


  function addFullSizeImageLinksNomDetail() {
    const myCssId = "imageModsCSSNomDetail";
    const myStyle = `.material-icons-fontsize {
        font-size: 48px;
      }
      .lupesup {
        position: absolute;
        left: 0px;
        top: 0px;
        z-index: 300;
      }
      .luperel {
        position: relative;
        left: 0px;
      }
      .absolute {
        position: absolute;
      }
    `;

    let elem, imageUrl;
    const myData = window.wfes.g.nominationDetail();
    // only nominations, for edits use Wayfarer Contribution Management Layout
    if ("NOMINATION" === myData.type) {
      window.wfes.f.addCSS(myCssId, myStyle);

      elem = document.getElementsByClassName("wf-image-modal details-pane__image");
      imageUrl = myData.imageUrl + "=s0";

      // main Image
      if ( null === document.getElementById(buttonIDmain)) {
        addFullImageButton(elem[0], imageUrl, "mainImage", "beforeBegin", "luperel", buttonIDmain, "absolute");
      } else {
        setImageURL(buttonIDmain, imageUrl);
      }

      // Supporting Image
      if (myData.supportingImageUrls) {
        elem = document.getElementsByClassName("supporting-images-container");

        if (1 === myData.supportingImageUrls.length) {
          imageUrl = myData.supportingImageUrls[0] + "=s0";
          if ( null === document.getElementById(buttonIDsup)) {
            // addFullImageButton(elem[0], imageUrl, "supportingImage", "afterEnd", "", supLensId);
            addFullImageButton(elem[0], imageUrl, "supportingImage", "beforeEnd", "lupesup", buttonIDsup);
          } else {
            setImageURL(buttonIDsup, imageUrl);
          }

        } else if (myData.supportingImageUrls.length > 1) {
          _supImages = []; // leeren, falls die vom vorhergehenden noch gefüllt sind))
          _currentSupImage = 0;
          _supImageCount = myData.supportingImageUrls.length;
          for (let i = 0; i < _supImageCount; i++) {
            const imageUrl = myData.supportingImageUrls[i] + "=s0";
            _supImages.push(imageUrl);
          }

          if ( null === document.getElementById(buttonIDsup)) {
            // addFullImageButton(elem[0], imageUrl, "supportingImage", "afterEnd", "", supLensId);
            addFullImageButton(elem[0], _supImages[0], "supportingImage", "beforeEnd", "lupesup", buttonIDsup);
          } else {
            setImageURL(buttonIDsup, _supImages[0]);
          }
          contribAddClickHandlerSupImg();
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
