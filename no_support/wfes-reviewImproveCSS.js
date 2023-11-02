// @name Review Improve CSS
// @version 1.0.10
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
    .wfes-h490 { min-height: 300px; }
    .wfes-h790 { min-height: 790px; }
    .wfes-none { display: none; }
    .wfes-text-4xl { font-size: 1.9rem !important; line-height: 1.8rem !important; }
    .wfes-text-lg { line-height: 1.5rem !important; font-size: 1.1rem !important; }
    .wfes-h4 { font-size:1.5rem; line-height:1.2rem; padding-bottom:0.5rem; }
    .wfes-card__header { margin-top:-0.5rem; margin-bottom: -1.0rem; } 
    .wfes-stars-cards { height: min-content !important; margin-top: 1rem }
    .wfes-fit-content { max-width: fit-content; }
    `;

  const cardSelectors = ["app-photo-b > wf-review-card-b", "app-title-and-description-b > wf-review-card", "app-supporting-info-b > wf-review-card-b"];
  const dupeSelector = "#check-duplicates-card";
  const titleSelector = "#title-description-card > div.wf-review-card__body > div > a > div";
  const descriptionSelector = "#title-description-card > div.wf-review-card__body > div > div";
  // const starsCardsSelectors = ["#historical-cultural-card", "#visually-unique-card", "#safe-access-card"];
  // const historicalCard = "#historical-cultural-card";
  const ccategorySelector = "app-review-categorization-b > wf-review-card > div.wf-review-card__header > div:nth-child(1) > h4";

  function reviewImproveCSS() {
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
  }

  function editImproveCSS() {
    const abuseSelector = "div.report-abuse";
    window.wfes.f.addCSS(myCssId, myStyle);

    window.wfes.f.waitForElem(abuseSelector).then((elem)=>{
      elem.classList.add("wfes-fit-content");
      elem.classList.add("wf-button");
    });
  }

  function init() {
    window.addEventListener("WFESReviewPageNewLoaded", reviewImproveCSS);
    window.addEventListener("WFESReviewPageEditLoaded", editImproveCSS);
  }

  init();

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
