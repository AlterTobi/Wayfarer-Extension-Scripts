// @name         Anti Social
// @version      1.1.99
// @description  hides group size selection from socialize card (greetings to @Tntnnbltn)
// @author       AlterTobi

(function() {
  "use strict";
  const logger = new window.UserScriptLogger(GM_info.script.name, true);

  const sessvarMiss = "warnBase";
  const baseMinVersion = "3.0.0";

  const myCssId = "antiSocialCSS";
  const myStyle = `#socialize-card > fieldset {
    display: none;
    }
    `;

  function antiSocial() {
    window.wfes.f.addCSS(myCssId, myStyle);
  }

  const init = () => {
    window.addEventListener("WFESReviewPageNewLoaded", antiSocial);
  };


  // === no changes needed below this line ======================
  if("undefined" === typeof(wfes)) {
    if (undefined === sessionStorage[sessvarMiss]) {
      sessionStorage[sessvarMiss] = 1;
      alert("Missing WFES Base. Please install from https://altertobi.github.io/Wayfarer-Extension-Scripts/");
      logger.error("Missing WFES Base. Please install from https://altertobi.github.io/Wayfarer-Extension-Scripts/");
    }
  } else if (window.wfes.f.hasMinVersion(baseMinVersion)) {
    init();
  } else {
    const msg = GM_info.script.name + ": Need at least wfes-Base version " + baseMinVersion+ " Please upgrade.";
    logger.warn(msg);
    window.wfes.f.createNotification( msg, "red", {autoclose: 60});
  }

  /* we are done :-) */
  logger.info("Script loaded: version:" + GM_info.script.version);
})();