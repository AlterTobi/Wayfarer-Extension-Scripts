// @name Review Improve CSS
// @version 1.0.11
// @description CSS modifcations for Wayfarer 5.7
// @author AlterTobi

(function() {
  "use strict";

  const myCssId = "rICSS";
  const myStyle = `
    .wf-review-card__header { padding: 0.5rem; }
    .wf-review-card__body { margin-bottom: 0.2rem; }
    .wf-review-card__footer { padding-bottom: 0.2rem; }
    .py-2 { padding-top: 0 !important;  padding-bottom: 0 !important;  margin-bottom: 0.3rem; }
    .px-4 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
    .wfes-minContent { height:  min-content !important; }
    .wfes-mh100p { min-height: 100px; }
    .wfes-h490 { min-height: 490px; }
    .wfes-h790 { min-height: 790px; }
    .wfes-none { display: none; }
    .wfes-text-4xl { font-size: 1.9rem !important; line-height: 1.8rem !important; }
    .wfes-text-lg { line-height: 1.5rem !important; font-size: 1.1rem !important; }
    .wfes-h4 { font-size:1.5rem; line-height:1.2rem; padding-bottom:0.5rem; }
    .wfes-card__header { margin-top:-0.5rem; margin-bottom: -1.0rem; } 
    .wfes-stars-cards { height: min-content !important; margin-top: 1rem }
    .wfes-fit-content { max-width: fit-content; }
    .wfes-pad05 { padding: 0.5rem !important; }
    .wfes-linebreak { line-break: auto !important; }
    .wfes-smallgap { gap: 1rem 0; }
    .wfes-btnrigth { justify-content: end !important; gap: 0 0.5rem; }
    .o1 { order: 1;}
    .o2 { order: 2; background-color: #f7c3c3;}
    .o3 { order: 3; background-color: #b1ffb1;}
    div.question-title.mb-1 { font-size: 1.25rem !important; line-height: 1.2rem;}
    `;

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
  // const starsCardsSelectors = ["#historical-cultural-card", "#visually-unique-card", "#safe-access-card"];
  // const historicalCard = "#historical-cultural-card";
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

  /*
  const findStyle = selector => new Promise((resolve, reject) => {
    // Holen Sie alle Stylesheets im Dokument
    const stylesheets = document.styleSheets;
    // Durchsuchen Sie alle Stylesheets nach der Regel mit dem gegebenen Selektor
    for (let i = 0; i < stylesheets.length; i++) {
      // kein href (=style tag) oder href beginnt mit origin (sonst CORS-Fehler)
      if (!stylesheets[i].href || (stylesheets[i].href && stylesheets[i].href.startsWith(location.origin))) {
        const cssRules = stylesheets[i].cssRules || stylesheets[i].rules;
        for (let j = 0; j < cssRules.length; j++) {
          if (cssRules[j].selectorText === selector) {
          // Wenn die Regel gefunden wurde, geben Sie sie über das Promise zurück
            resolve(cssRules[j].style);
            return;
          }
        }
      }
    }
    // Wenn die Regel nicht gefunden wurde, geben Sie ein Reject-Promise zurück
    reject(new Error("CSS rule not found for selector: " + selector));
  });
*/
  function reviewImproveCSS() {
    window.wfes.f.addCSS(myCssId, myStyle);
    window.wfes.f.addCSS(alCssID, alStyle);

    cardSelectors.forEach(selector => {
      window.wfes.f.waitForElem(selector).then((elem)=>{elem.classList.add("wfes-mh100p");});
      // remove description texts
      const seltext = selector + " > div.wf-review-card__header > div:nth-child(1) > div";
      window.wfes.f.waitForElem(seltext).then((elem)=>{elem.classList.add("wfes-none");});
    });
    window.wfes.f.waitForElem(dupeSelector).then((elem)=>{elem.classList.add("wfes-h790");});

    // smaller font site for title and description
    window.wfes.f.waitForElem(titleSelector).then((elem)=>{elem.classList.add("wfes-text-4xl");});
    window.wfes.f.waitForElem(descriptionSelector).then((elem)=>{elem.classList.add("wfes-text-lg");});

    // remove card headers and descriptions
    displayNoneSelectors.forEach(selector => {
      window.wfes.f.waitForElem(selector).then((elem)=>{elem.classList.add("wfes-none");});
    });

    // "komische" Zelenumbrüche im Supporttext entfernen
    window.wfes.f.waitForElem(supportTextSel)
      .then((elem)=>{ elem.classList.add("wfes-linebreak");}
      );

    // remove empty space in "stars-only" cards
    // starsCardsSelectors.forEach(selector => {
    // window.wfes.f.waitForElem(selector).then((elem)=>{elem.classList.add("wfes-stars-cards");});
    // });

    // remove spaces between cards - grid class
    // window.wfes.f.waitForElem(historicalCard).then((elem)=>{elem.parentElement.parentElement.classList.remove("grid");});

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
      let buttonList = document.querySelectorAll("app-question-card > div > div > div.action-buttons-row > button:nth-child(1)");
      buttonList.forEach(elem => {elem.classList.add("o3");});
      buttonList = document.querySelectorAll("app-question-card > div > div > div.action-buttons-row > button:nth-child(2)");
      buttonList.forEach(elem => {elem.classList.add("o2");});
      buttonList = document.querySelectorAll("app-question-card > div > div > div.action-buttons-row > div");
      buttonList.forEach(elem => {elem.classList.add("o1");});
      buttonList = document.querySelectorAll("app-question-card > div > div > div.action-buttons-row");
      buttonList.forEach(elem => {elem.classList.add("wfes-btnrigth");});
    });

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

    window.wfes.f.waitForElem(mapSelector).then((elem)=>{
      elem.classList.add("wfes-h490");
    });

  }

  function init() {
    window.addEventListener("WFESReviewPageNewLoaded", reviewImproveCSS);
    window.addEventListener("WFESReviewPageEditLoaded", editImproveCSS);
  }

  init();

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
