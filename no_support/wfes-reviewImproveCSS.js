// @name Review Improve CSS
// @version 1.1.0
// @description CSS modifcations for Wayfarer 5.7
// @author AlterTobi (CSS parts by AlfonsoML)

(function() {
  "use strict";

  const reorder_thumbs = true;

  const myCssId = "rICSS";
  const myStyle = `
    .wf-review-card__header { padding: 0.5rem; }
    .wf-review-card__body { margin-bottom: 0.5rem !important; }
    .wf-review-card__footer { padding-bottom: 0.25rem !important; }
    .py-2 { padding-top: 0 !important;  padding-bottom: 0 !important;  margin-bottom: 0.3rem; }
    .px-4 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
    .wfes-mh100p { min-height: 100%; }
    .wfes-h490 { min-height: 490px; }
    .wfes-h725 { min-height: 725px; }
    .wfes-none { display: none; }
    .wfes-text-4xl { font-size: 1.9rem !important; line-height: 1.8rem !important; }
    .wfes-text-lg { line-height: 1.5rem !important; font-size: 1.1rem !important; }
    .wfes-h4 { font-size:1.5rem; line-height:1.2rem; padding-bottom:0.5rem; }
    .wfes-card__header { margin-top:-0.5rem; margin-bottom: -1.0rem; } 
    .wfes-fit-content { max-width: fit-content; }
    .wfes-pad05 { padding: 0.5rem !important; }
    .wfes-linebreak { line-break: auto !important; }
    .wfes-smallgap { gap: 1rem 0 !important; }
    .wfes-photo { max-height: 350px !important; width: auto !important; }
    .wfes-btnrigth { justify-content: end !important; gap: 0 0.5rem; }
    .o1 { order: 1;}
    .o2 { order: 2;}
    .o3 { order: 3;}
    .bg_red { background-color: #f7c3c3;}
    .bg_green { background-color: #b1ffb1;}
    div.question-title.mb-1 { font-size: 1.25rem !important; line-height: 1.2rem;}
    `;

  // CSS by Alfonso-ML, posted on WDD
  const alCssID = "wfes-alfonso";
  const alStyle = `
    .review-new > div:nth-child(1)  > * {
      flex-basis: 32%;
    }
    .review-new > div:nth-child(1) {
      flex-direction: row !important;
      grid-column: span 4;
      display: flex;
      flex-wrap: wrap;
      gap: 0 0.2rem;
      justify-content: space-between;
    }
    `;

  const cardSelectors = ["app-photo-b > wf-review-card-b", "app-title-and-description-b > wf-review-card", "app-supporting-info-b > wf-review-card-b"];
  const dupeSelector = "#check-duplicates-card";
  const titleSelector = "#title-description-card > div.wf-review-card__body > div > a > div";
  const descriptionSelector = "#title-description-card > div.wf-review-card__body > div > div";
  const ccategorySelector = "app-review-categorization-b > wf-review-card > div.wf-review-card__header > div:nth-child(1) > h4";
  const displayNoneSelectors = ["app-review-new-b > div > div:nth-child(1) > h4",
    "app-review-new-b > div > div:nth-child(1) > p",
    "app-review-new-b > div > div:nth-child(2) > h4",
    "app-review-new-b > div > div:nth-child(2) > p"];
  const supportTextSel = "app-supporting-info-b > wf-review-card-b div.supporting-info-statement";
  const qCardsSel = "app-question-card > div";
  const qCardsBtnSel = "app-question-card button.dont-know-button";
  const questionSel = "app-review-new-b > div > div.review-questions";
  const mapSel = "app-review-new-b > div > div.review-questions";
  const photoSel = "app-photo-b > wf-review-card-b div.wf-image-modal > img";
  const suppImgSel = "app-supporting-info-b > wf-review-card-b div.wf-image-modal.supporting-info-img-container > img";

  function reviewImproveCSS() {
    window.wfes.f.addCSS(myCssId, myStyle);
    window.wfes.f.addCSS(alCssID, alStyle);

    cardSelectors.forEach(selector => {
      window.wfes.f.waitForElem(selector).then((elem)=>{elem.classList.add("wfes-mh100p");});
      // remove description texts
      const seltext = selector + " > div.wf-review-card__header > div:nth-child(1) > div";
      window.wfes.f.waitForElem(seltext).then((elem)=>{elem.classList.add("wfes-none");});
    });
    window.wfes.f.waitForElem(dupeSelector).then((elem)=>{elem.classList.add("wfes-h725");});

    // smaller font site for title and description
    window.wfes.f.waitForElem(titleSelector).then((elem)=>{elem.classList.add("wfes-text-4xl");});
    window.wfes.f.waitForElem(descriptionSelector).then((elem)=>{elem.classList.add("wfes-text-lg");});

    // remove card headers and descriptions
    displayNoneSelectors.forEach(selector => {
      window.wfes.f.waitForElem(selector).then((elem)=>{elem.classList.add("wfes-none");});
    });

    // "komische" Zelenumbrüche im Supporttext entfernen
    const pagedata = window.wfes.g.reviewPageData();
    if (pagedata.statement.length < 256) {
      // bei langen text gibt es den Unsinn nicht
      window.wfes.f.waitForElem(supportTextSel)
        .then((elem)=>{ elem.classList.add("wfes-linebreak");} )
        .catch((e) => { console.warn(GM_info.script.name, "- support statement ", e); });
    }

    // bilder etwas kleiner und zentriert
    window.wfes.f.waitForElem(photoSel).then((elem) => {
      elem.classList.add("wfes-photo");
      elem.parentElement.setAttribute("style", "justify-content: center; display: flex;");
    });
    window.wfes.f.waitForElem(suppImgSel).then((elem) => {elem.classList.add("wfes-photo");});

    // make all H4 smaller, wait for last box first
    window.wfes.f.waitForElem(ccategorySelector).then(()=>{
      const headerlist = document.querySelectorAll(".wf-review-card__header");
      headerlist.forEach(elem =>{elem.classList.add("wfes-card__header");});
    });

    // question cards mit kleinerem Rand
    window.wfes.f.waitForElem(questionSel).then(()=>{
      const qCardList = document.querySelectorAll(qCardsSel);
      qCardList.forEach(elem =>{
        elem.classList.remove("p-4");
        elem.classList.add("wfes-pad05");
      });
      const qCardBtnList = document.querySelectorAll(qCardsBtnSel);
      qCardBtnList.forEach(elem =>{
        elem.classList.add("wfes-pad05");
      });

      // buttons umsortieren
      let buttonList = document.querySelectorAll("app-question-card > div > div > div.action-buttons-row");
      buttonList.forEach(elem => {elem.classList.add("wfes-btnrigth");});
      if (reorder_thumbs) {
        buttonList = document.querySelectorAll("app-question-card > div > div > div.action-buttons-row > button:nth-child(1)");
        buttonList.forEach(elem => {elem.classList.add("o3"); elem.classList.add("bg_green");});
        buttonList = document.querySelectorAll("app-question-card > div > div > div.action-buttons-row > button:nth-child(2)");
        buttonList.forEach(elem => {elem.classList.add("o2"); elem.classList.add("bg_red");});
        buttonList = document.querySelectorAll("app-question-card > div > div > div.action-buttons-row > div");
        buttonList.forEach(elem => {elem.classList.add("o1");});
      }
    });

    // reorder main cards
    window.wfes.f.waitForElem("app-title-and-description-b")
      .then(elem=>{elem.classList.add("o2");})
      .catch((e) => { console.warn(GM_info.script.name, "- reorder title ", e); });

    window.wfes.f.waitForElem("app-photo-b")
      .then(elem=>{elem.classList.add("o1"); elem.style.setProperty("margin-left", "0", "important");})
      .catch((e) => { console.warn(GM_info.script.name, "- reorder photo ", e); });

    window.wfes.f.waitForElem("app-supporting-info-b")
      .then(elem=>{elem.classList.add("o3"); elem.style.setProperty("margin-left", "0", "important");})
      .catch((e) => { console.warn(GM_info.script.name, "- reorder supporting info ", e); });

    window.wfes.f.waitForElem(mapSel).then(elem => { elem.setAttribute("style", "grid-column: span 4;"); });
    window.wfes.f.waitForElem("app-review-new-b > div").then(elem => { elem.classList.add("wfes-smallgap"); });
  }

  function editImproveCSS() {
    const abuseSelector = "div.report-abuse";
    const mapSelector = "app-select-location-edit > wf-review-card > div.wf-review-card__body";
    window.wfes.f.addCSS(myCssId, myStyle);

    window.wfes.f.waitForElem(abuseSelector).then((elem)=>{
      elem.classList.add("wfes-fit-content");
      elem.classList.add("wf-button");
    });

    const edit = window.wfes.g.edit();
    if (edit.isEdit && edit.what.location) {
      window.wfes.f.waitForElem(mapSelector)
        .then((elem)=>{ elem.classList.add("wfes-h490"); })
        .catch((e) => { console.warn(GM_info.script.name, ": ", e); });
    }

  }

  function init() {
    window.addEventListener("WFESReviewPageNewLoaded", reviewImproveCSS);
    window.addEventListener("WFESReviewPageEditLoaded", editImproveCSS);
  }

  init();

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
