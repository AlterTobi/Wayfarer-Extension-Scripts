// @name Review Improve CSS
// @version 1.0.3
// @description fix for small heightin Wayfarer 5.2
// @author AlterTobi

(function() {
  "use strict";

  const myCssId = "rICSS";
  const myStyle = `
    .wfes-h490 { min-height: 490px; }
    .wfes-h790 { min-height: 790px; }
    .wfes-none { display: none; }
    .wfes-text-4xl { font-size: 1.9rem !important; line-height: 1.8rem !important; }
    .wfes-text-lg { line-height: 1.5rem !important; font-size: 1.1rem !important; }
    `;

  const cardSelectors = ["app-should-be-wayspot > wf-review-card", "app-title-and-description > wf-review-card", "app-supporting-info > wf-review-card"];
  const dupeSelector = "#check-duplicates-card";
  const titleSelector = "#title-description-card > div.wf-review-card__body > div > a > div";
  const descriptionSelector = "#title-description-card > div.wf-review-card__body > div > div";

  function improveCSS() {
    window.wfes.f.addCSS(myCssId, myStyle);
    cardSelectors.forEach(selector => {
      window.wfes.f.waitForElem(selector).then((elem)=>{elem.classList.add("wfes-h490");});
      // remove description texts
      const seltext = selector + " div:nth-child(1) > div";
      window.wfes.f.waitForElem(seltext).then((elem)=>{elem.classList.add("wfes-none");});
    });
    window.wfes.f.waitForElem(dupeSelector).then((elem)=>{elem.classList.add("wfes-h790");});

    // smaller font site for title and description
    window.wfes.f.waitForElem(titleSelector).then((elem)=>{elem.classList.add("wfes-text-4xl");});
    window.wfes.f.waitForElem(descriptionSelector).then((elem)=>{elem.classList.add("wfes-text-lg");});
  }

  window.addEventListener("WFESReviewPageLoaded", improveCSS);

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();

// window.wfes.f.waitForElem().then((elem)=>{elem.classList.add("");});