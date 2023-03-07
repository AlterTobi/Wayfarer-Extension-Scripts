// @name Review Enlarge Cards
// @version 1.0.0
// @description fix for small heightin Wayfarer 5.2
// @author AlterTobi

(function() {
  "use strict";

  const myCssId = "enlargeCardsCSS";
  const myStyle = ".wfes-h490 { min-height: 490px; }";
  const cardSelectors = ["app-should-be-wayspot > wf-review-card", "app-title-and-description > wf-review-card", "app-supporting-info > wf-review-card"];

  function enlargeCards() {
    window.wfes.f.addCSS(myCssId, myStyle);
    cardSelectors.forEach(selector => {
      window.wfes.f.waitForElem(selector).then((elem)=>{elem.classList.add("wfes-h490");});
    });
  }

  window.addEventListener("WFESReviewPageLoaded", enlargeCards);

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
