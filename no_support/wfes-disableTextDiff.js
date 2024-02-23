// @name         Disable Text Diff
// @version      1.0.0
// @description  disables the Niantic text diff display by clicking at the slider
// @author       AlterTobi

(function() {
  "use strict";

  const matSlider = "mat-slide-toggle";
  const inputSlider = "input.mat-slide-toggle-input";

  function disableTextDiff() {
    window.wfes.f.waitForElem(matSlider).then( () =>{
      const sliders = document.querySelectorAll(inputSlider);
      sliders.forEach((s) => {
        if ("true" === s.getAttribute("aria-checked")) {
          s.click();
        }
      });
    })
    .catch();
  }

  window.addEventListener("WFESReviewPageEditLoaded", disableTextDiff);

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();