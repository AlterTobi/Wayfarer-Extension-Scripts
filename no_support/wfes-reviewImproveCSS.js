// @name Review Improve CSS
// @version 1.0.5
// @description fix for small heightin Wayfarer 5.2
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
    .wfes-h490 { min-height: 490px; }
    .wfes-h790 { min-height: 790px; }
    .wfes-none { display: none; }
    .wfes-text-4xl { font-size: 1.9rem !important; line-height: 1.8rem !important; }
    .wfes-text-lg { line-height: 1.5rem !important; font-size: 1.1rem !important; }
    .wfes-h4 { font-size:1.5rem; line-height:1.2rem; padding-bottom:0.5rem; }
    .wfes-card__header { margin-top:-0.5rem; margin-bottom: -1.0rem; } 
    .wfes-stars-cards { height: min-content !important; margin-top: 1rem }
    `;

  const cardSelectors = ["app-should-be-wayspot > wf-review-card", "app-title-and-description > wf-review-card", "app-supporting-info > wf-review-card"];
  const dupeSelector = "#check-duplicates-card";
  const titleSelector = "#title-description-card > div.wf-review-card__body > div > a > div";
  const descriptionSelector = "#title-description-card > div.wf-review-card__body > div > div";
  const starsCardsSelectors = ["#historical-cultural-card", "#visually-unique-card", "#safe-access-card"];
  const historicalCard = "#historical-cultural-card";
  const commentH4Selector = "app-review-comments > wf-review-card > div.wf-review-card__header > div:nth-child(1) > h4";

  function improveCSS() {
    window.wfes.f.addCSS(myCssId, myStyle);
    cardSelectors.forEach(selector => {
      window.wfes.f.waitForElem(selector).then((elem)=>{elem.classList.add("wfes-h490");});
      // remove description texts
      const seltext = selector + " > div.wf-review-card__header > div:nth-child(1) > div";
      window.wfes.f.waitForElem(seltext).then((elem)=>{elem.classList.add("wfes-none");});
    });
    window.wfes.f.waitForElem(dupeSelector).then((elem)=>{elem.classList.add("wfes-h790");});

    // smaller font site for title and description
    window.wfes.f.waitForElem(titleSelector).then((elem)=>{elem.classList.add("wfes-text-4xl");});
    window.wfes.f.waitForElem(descriptionSelector).then((elem)=>{elem.classList.add("wfes-text-lg");});

    // remove empty space in "stars-only" cards
    starsCardsSelectors.forEach(selector => {
      window.wfes.f.waitForElem(selector).then((elem)=>{elem.classList.add("wfes-stars-cards");});
    });

    // remove spaces between cards - grid class
    window.wfes.f.waitForElem(historicalCard).then((elem)=>{elem.parentElement.parentElement.classList.remove("grid");});

    // make all H4 smaller, margins in card headers too
    window.wfes.f.waitForElem(commentH4Selector).then((elem)=>{
      elem.classList.add(".wfes-h4");
      const headerlist =document.querySelectorAll(".wf-review-card__header");
      headerlist.forEach(elem =>{elem.classList.add("wfes-card__header");});
    });
  }

  window.addEventListener("WFESReviewPageNewLoaded", improveCSS);

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();

// window.wfes.f.waitForElem().then((elem)=>{elem.classList.add("");});
/*
WFESReviewPageLoaded
WFESReviewPagePhotoLoaded
WFESReviewPageEditLoaded
WFESReviewPageNewLoaded
*/
