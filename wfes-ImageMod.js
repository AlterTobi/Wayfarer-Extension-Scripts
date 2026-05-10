// @name         image Mods
// @version      1.3.0
// @description  open fullsize images in "named" tabs
// @author       AlterTobi

(function() {
  "use strict";

  let _currentSupImage = 0; // zähler des aktuellen Zusatzbildes
  let _supImageCount = 1; // wieviel Zusatzbilder gibt es?
  let _supImages; // speichern die imageUrls
  const supBtnPrevSelector = "app-supporting-info-b > wf-review-card-b wf-image-carousel button.nav-button.prev-button";
  const supBtnNextSelector = "app-supporting-info-b > wf-review-card-b wf-image-carousel button.nav-button.nex-button";
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

  function handleButtonClick(value) {
    // Modulo rechnen - _supImageCount addieren um negative Werte zu vermeiden
    _currentSupImage = (_currentSupImage + value + _supImageCount) % _supImageCount;
    setImageURL(supLensId, _supImages[_currentSupImage]);
  }

  // Click-Handler for supporting images (left/right)
  function addClickHandlerSupImg() {
    window.wfes.f.waitForElem(supBtnPrevSelector).then(elem=> {
      elem.addEventListener("click", () => handleButtonClick(-1));
    });
    window.wfes.f.waitForElem(supBtnNextSelector).then(elem=> {
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
            for (const imageUrl in myData.supportingImageUrls) {
              const fullImageUrl = imageUrl + "=s0";
              _supImages.push(fullImageUrl);
            }
            addFullImageButton(elem[0], _supImages[0], "supportingImage", "afterEnd", "", supLensId);
            addClickHandlerSupImg();
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
