// @name         Click Enlarge Images
// @version      1.0.0
// @description  auto-click the enlarge images symbols (requires image mod script)
// @author       AlterTobi

(function() {
  "use strict";

  const l1Sel = "app-photo-b > wf-review-card-b > div.wf-review-card__body > div > a.lupe";
  const l2Sel = "app-supporting-info-b > wf-review-card-b > div.wf-review-card__body > div > a.lupe";

  function click() {
    window.wfes.f.waitForElem(l2Sel).then((elem)=>{ elem.click(); })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    window.wfes.f.waitForElem(l1Sel)
      .then((elem)=>{ elem.click(); })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
  }

  window.addEventListener("WFESReviewPageNewLoaded", click);

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();