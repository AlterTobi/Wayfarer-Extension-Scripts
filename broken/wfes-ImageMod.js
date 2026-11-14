// @name         image Mods
// @version      1.5.99
// @description  open fullsize images in "named" tabs

(function() {
  "use strict";

  const BASE_MIN_VERSION = "3.0.0";
  const SESSION_VAR_MISS = "warnBase";
  const SCRIPT_NAME = GM_info?.script?.name ?? "WFES - Image Mods";
  const SCRIPT_VERSION = GM_info?.script?.version ?? "unknown";

  // === Basis-Prüfung & Logger =================================
  if (typeof window.wfes === "undefined") {
    if (sessionStorage.getItem(SESSION_VAR_MISS) === null) {
      sessionStorage.setItem(SESSION_VAR_MISS, "1");
      const msg = `${SCRIPT_NAME}: Missing WFES Base. Please install from https://altertobi.github.io/Wayfarer-Extension-Scripts/`;
      alert(msg);
      console.error(msg);
    }
    return;
  }

  const logger = new window.UserScriptLogger(SCRIPT_NAME, true);

  if (!window.wfes.f.hasMinVersion(BASE_MIN_VERSION)) {
    const msg = `${SCRIPT_NAME}: Need at least wfes-Base version ${BASE_MIN_VERSION}. Please upgrade.`;
    logger.warn(msg);
    window.wfes.f.createNotification(msg, "red", { autoclose: 60 });
    return;
  }

  // === Konfiguration & Konstanten =============================
  const SELECTORS = {
    reviewSupBtnPrev: "app-supporting-info-b > wf-review-card-b wf-image-carousel button.nav-button.prev-button",
    reviewSupBtnNext: "app-supporting-info-b > wf-review-card-b wf-image-carousel button.nav-button.next-button",
    contribSupBtnPrev: "app-details-pane wf-image-carousel button.nav-button.prev-button",
    contribSupBtnNext: "app-details-pane wf-image-carousel button.nav-button.next-button",
  };

  const IDS = {
    supLensReview: "lupesup",
    btnMainNom: "imageModsBtnMain",
    btnSupNom: "imageModsBtnSup",
    cssReview: "imageModsCSSReview",
    cssNomDetail: "imageModsCSSNomDetail",
  };

  const CSS_REVIEW = `
    .material-icons-fontsize {
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

  const CSS_NOM_DETAIL = `
    .material-icons-fontsize {
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

  // === Status für Karussell-Zusatzbilder ======================
  let currentSupImage = 0;
  let supImages = [];

  // === Hilfsfunktionen ========================================
  const addFullImageButton = (elem, url, target, position = "afterEnd", styleClass = "lupe", elemId = "", spanClass = "") => {
    if (!elem) {
      logger.warn(`Target element for full image button (${elem}) not found.`);
      return;
    }

    const link = document.createElement("a");
    const span = document.createElement("span");

    span.className = `material-icons material-icons-fontsize ${spanClass}`.trim();
    span.textContent = "search";

    link.appendChild(span);
    link.target = target;
    link.href = url;
    link.className = styleClass;
    if (elemId) {
      link.id = elemId;
    }

    if (position === "afterEnd" || position === "beforeBegin") {
      elem.parentNode.style.position = "relative";
    } else if (position === "beforeEnd" || position === "afterBegin") {
      elem.style.position = "relative";
    }

    elem.insertAdjacentElement(position, link);
  };

  const setImageUrl = (buttonId, imageUrl) => {
    const elem = document.getElementById(buttonId);
    if (elem) {
      elem.href = imageUrl;
    }
  };

  const cycleSupImage = (step, targetButtonId) => {
    const count = supImages.length;
    if (count === 0) {
      return;
    }
    currentSupImage = (currentSupImage + step + count) % count;
    setImageUrl(targetButtonId, supImages[currentSupImage]);
  };

  const bindCarouselHandlers = (prevSelector, nextSelector, targetButtonId) => {
    window.wfes.f.waitForElem(prevSelector).then((elem) => {
      if (!elem.dataset.contribClickBound) {
        elem.addEventListener("click", () => cycleSupImage(-1, targetButtonId));
        elem.dataset.contribClickBound = "1";
      }
    });

    window.wfes.f.waitForElem(nextSelector).then((elem) => {
      if (!elem.dataset.contribClickBound) {
        elem.addEventListener("click", () => cycleSupImage(1, targetButtonId));
        elem.dataset.contribClickBound = "1";
      }
    });
  };

  // === Review-Seite ===========================================
  const addFullSizeImageLinksReview = () => {
    const reviewData = window.wfes.g.reviewPageData();
    window.wfes.f.addCSS(IDS.cssReview, CSS_REVIEW);

    switch (reviewData.type) {
      case "NEW": {
        const mainElem = document.getElementsByClassName("wf-image-modal flex-grow bg-contain bg-center bg-no-repeat")[0];
        addFullImageButton(mainElem, `${reviewData.imageUrl}=s0`, "mainImage");

        if (Array.isArray(reviewData.supportingImageUrls) && reviewData.supportingImageUrls.length > 0) {
          const supElem = document.getElementsByClassName("supporting-info-img-container")[0];
          supImages = reviewData.supportingImageUrls.map((url) => `${url}=s0`);
          currentSupImage = 0;

          addFullImageButton(supElem, supImages[0], "supportingImage", "afterEnd", "", IDS.supLensReview);

          if (supImages.length > 1) {
            bindCarouselHandlers(SELECTORS.reviewSupBtnPrev, SELECTORS.reviewSupBtnNext, IDS.supLensReview);
          }
        }
        break;
      }

      case "EDIT": {
        const editElem = document.getElementsByClassName("wf-image-modal")[0];
        addFullImageButton(editElem, `${reviewData.imageUrl}=s0`, "mainImage", "beforeBegin");
        break;
      }

      case "PHOTO": {
        const photoElems = document.getElementsByClassName("photo-card__photo");
        for (let i = 0; i < photoElems.length; i++) {
          const container = photoElems[i].parentNode?.parentNode?.parentNode;
          const photoUrl = `${reviewData.newPhotos[i].value}=s0`;
          addFullImageButton(container, photoUrl, "additionalImage", "beforeEnd", "lupe bottom");
        }
        break;
      }

      default:
        break;
    }
  };

  // === Nomination-Details (Contributions) =====================
  const addFullSizeImageLinksNomDetail = () => {
    const nomData = window.wfes.g.nominationDetail();

    if (nomData.type !== "NOMINATION") {
      [IDS.btnMainNom, IDS.btnSupNom].forEach((buttonId) => {
        document.getElementById(buttonId)?.remove();
      });
      return;
    }

    window.wfes.f.addCSS(IDS.cssNomDetail, CSS_NOM_DETAIL);

    const mainElem = document.getElementsByClassName("wf-image-modal details-pane__image")[0];
    const mainImageUrl = `${nomData.imageUrl}=s0`;

    if (document.getElementById(IDS.btnMainNom) === null) {
      addFullImageButton(mainElem, mainImageUrl, "mainImage", "beforeBegin", "luperel", IDS.btnMainNom, "absolute");
    } else {
      setImageUrl(IDS.btnMainNom, mainImageUrl);
    }

    if (Array.isArray(nomData.supportingImageUrls) && nomData.supportingImageUrls.length > 0) {
      const supElem = document.getElementsByClassName("supporting-images-container")[0];
      supImages = nomData.supportingImageUrls.map((url) => `${url}=s0`);
      currentSupImage = 0;

      if (document.getElementById(IDS.btnSupNom) === null) {
        addFullImageButton(supElem, supImages[0], "supportingImage", "beforeEnd", "lupesup", IDS.btnSupNom);
      } else {
        setImageUrl(IDS.btnSupNom, supImages[0]);
      }

      if (supImages.length > 1) {
        bindCarouselHandlers(SELECTORS.contribSupBtnPrev, SELECTORS.contribSupBtnNext, IDS.btnSupNom);
      }
    }
  };

  // === Initialisierung & Start ================================
  const init = () => {
    window.addEventListener("WFESNominationDetailLoaded", () => {
      setTimeout(addFullSizeImageLinksNomDetail, 100);
    });
    window.addEventListener("WFESReviewPageLoaded", () => {
      setTimeout(addFullSizeImageLinksReview, 100);
    });
  };

  init();
  logger.info(`Script loaded: version: ${SCRIPT_VERSION}`);
})();
