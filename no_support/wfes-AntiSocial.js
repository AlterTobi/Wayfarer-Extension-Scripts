// @name         Anti Social
// @version      1.1.99
// @description  hides group size selection from socialize card (greetings to @Tntnnbltn)
// @author       AlterTobi

(function() {
  "use strict";

  const BASE_MIN_VERSION = "3.0.0";
  const SESSION_VAR_MISS = "warnBase";
  const SCRIPT_NAME = GM_info?.script?.name ?? "WFES - Anti Social";
  const SCRIPT_VERSION = GM_info?.script?.version ?? "unknown";

  // === Basis-Prüfung & Logger =================================
  if (typeof window.wfes === "undefined") {
    if (sessionStorage.getItem(SESSION_VAR_MISS) === null) {
      sessionStorage.setItem(SESSION_VAR_MISS, "1");
      const msg = `${SCRIPT_NAME}: Missing WFES Base. Please install from https://altertobi.github.io/Wayfarer-Extension-Scripts/`;
      alert(msg);
      console.error(msg);
    }
    return;
  }

  const logger = new window.UserScriptLogger(SCRIPT_NAME, true);

  if (!window.wfes.f.hasMinVersion(BASE_MIN_VERSION)) {
    const msg = `${SCRIPT_NAME}: Need at least wfes-Base version ${BASE_MIN_VERSION}. Please upgrade.`;
    logger.warn(msg);
    window.wfes.f.createNotification(msg, "red", { autoclose: 60 });
    return;
  }

  // === Skript-spezifische Konfiguration & Logik ===============
  const CSS_ID = "antiSocialCSS";
  const CSS_STYLE = `
    #socialize-card > fieldset {
      display: none;
    }
  `;

  const addAntiSocialCSS = () => {
    window.wfes.f.addCSS(CSS_ID, CSS_STYLE);
  };

  const init = () => {
    window.addEventListener("WFESReviewPageNewLoaded", addAntiSocialCSS);
  };

  // === Start ==================================================
  init();
  logger.info(`Script loaded: version: ${SCRIPT_VERSION}`);
})();
