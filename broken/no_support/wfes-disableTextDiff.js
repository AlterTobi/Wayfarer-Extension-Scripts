// @name         Disable Text Diff
// @version      1.1.98
// @description  disables the Wayfarer text diff display by clicking at the slider
// @author       AlterTobi

(function() {
  "use strict";
  const logger = new window.UserScriptLogger(GM_info.script.name, true);

  const matSlider = "mat-slide-toggle";
  const inputSlider = "input.mat-slide-toggle-input";

  function disableTextDiff() {
    const edit = window.wfes.g.edit();
    if (edit.what.description || edit.what.title) {
      window.wfes.f.waitForElem(matSlider).then( () =>{
        const sliders = document.querySelectorAll(inputSlider);
        sliders.forEach((s) => {
          if ("true" === s.getAttribute("aria-checked")) {
            s.click();
          }
        });
      })
        .catch( () => { logger.error("no slider found"); } );
    }
  }

  window.addEventListener("WFESReviewPageEditLoaded", disableTextDiff);

  /* we are done :-) */
  // console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
  logger.error("need fix and update");
})();