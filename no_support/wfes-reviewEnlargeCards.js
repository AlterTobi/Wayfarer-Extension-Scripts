// @name Review Enlarge Cards
// @version 1.0.2
// @description fix for small heightin Wayfarer 5.2
// @author AlterTobi
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/wfes-reviewImproveCSS.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/wfes-reviewImproveCSS.meta.js

(function() {
  "use strict";

  const myCssId = "enlargeCardsCSS";
  const myStyle = ".wfes-h490 { min-height: 490px; } .wfes-h790 { min-height: 790px; }";
  const cardSelectors = ["app-should-be-wayspot > wf-review-card", "app-title-and-description > wf-review-card", "app-supporting-info > wf-review-card"];
  const dupeSelector = "#check-duplicates-card";

  function enlargeCards() {
    window.wfes.f.addCSS(myCssId, myStyle);
    cardSelectors.forEach(selector => {
      window.wfes.f.waitForElem(selector).then((elem)=>{elem.classList.add("wfes-h490");});
    });
    window.wfes.f.waitForElem(dupeSelector).then((elem)=>{elem.classList.add("wfes-h790");});
  }

  window.addEventListener("WFESReviewPageLoaded", enlargeCards);

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();