// @name         image Mods
// @version      1.4.0
// @description  open fullsize images in "named" tabs
// @author       AlterTobi

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

  // Review Handler

  // setImage URL on existing element
  function setImageURL(buttonID, imageUrl) {
    const elem = document.getElementById(buttonID);
    elem.href = imageUrl;
  }

  function handleButtonClick(value) {
    // Modulo rechnen - _supImageCount addieren um negative Werte zu vermeiden
    _currentSupImage = (_currentSupImage + value + _supImageCount) % _supImageCount;
    setImageURL(supLensId, _supImages[_currentSupImage]);
  }

  // Click-Handler for supporting images (left/right)
  function reviewAddClickHandlerSupImg() {
    window.wfes.f.waitForElem(reviewSupBtnPrevSelector).then(elem=> {
      elem.addEventListener("click", () => handleButtonClick(-1));
    });
    window.wfes.f.waitForElem(reviewSupBtnNextSelector).then(elem=> {
      elem.addEventListener("click", () => handleButtonClick( 1));
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
      elem.addEventListener("click", () => contribHandleButtonClick(-1));
    });
    window.wfes.f.waitForElem(contribSupBtnNextSelector).then(elem=> {
      elem.addEventListener("click", () => contribHandleButtonClick( 1));
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
