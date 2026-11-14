// @name         Anti Social
// @version      1.1.98
// @description  hides group size selection from socialize card (greetings to @Tntnnbltn)
// @author       AlterTobi

(function() {
  "use strict";
  const logger = new window.UserScriptLogger(GM_info.script.name, true);

  const myCssId = "antiSocialCSS";
  const myStyle = `div#socialize-card > div:nth-child(2) {
    display: none;
    }
    `;

  function antiSocial() {
    window.wfes.f.addCSS(myCssId, myStyle);
  }

  window.addEventListener("WFESReviewPageNewLoaded", antiSocial);

  logger.error("need fix and update");
})();