// @name Review Enlarge Cards
// @version 1.0.0
// @description fix for small heightin Wayfarer 5.2
// @author AlterTobi

(function() {
  "use strict";

  const myCssId = "enlargeCardsCSS";
  const myStyle = ".wf-review-card { height: 490px !important; }";

  window.addEventListener("WFESReviewPageLoaded", () => {
    window.wfes.f.addCSS(myCssId, myStyle);
  });

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
