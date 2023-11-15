// @name         Click Nodupes Button
// @version      1.0.1
// @description  auto-click the "no dupes"-Button
// @author       AlterTobi

(function() {
  "use strict";

  const btnSel = "#check-duplicates-card button.noDuplicatesButton";

  function click() {
    window.wfes.f.waitForElem(btnSel).then((elem)=>{ elem.click(); })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
  }

  window.addEventListener("WFESReviewPageNewLoaded", click);

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();