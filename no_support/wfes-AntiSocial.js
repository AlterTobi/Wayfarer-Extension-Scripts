// @name         Anti Social
// @version      1.0.1
// @description  hides group size selection from socialize card (greetings to @Tntnnbltn)
// @author       AlterTobi

(function() {
  "use strict";

  const myCssId = "antiSocialCSS";
  const myStyle = `div#socialize-card > div:nth-child(2) {
    display: none;
    }
    `;

  function antiSocial() {
    window.wfes.f.addCSS(myCssId, myStyle);
  }

  window.addEventListener("WFESReviewPageNewLoaded", antiSocial);

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();