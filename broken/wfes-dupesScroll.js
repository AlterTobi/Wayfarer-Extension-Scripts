// @name         dupes Scroll
// @version      1.3.99
// @description  make duplicates strip scrollable by mouse wheel
// @author       AlterTobi

(function() {
  "use strict";
  // Logger initialisieren
  const logger = new window.UserScriptLogger(GM_info.script.name, true);

  const sessvarMiss = "warnBase";
  const baseMinVersion = "3.0.0";

  function filmStripScroll() {
    // Make film strip (duplicates) scrollable
    // const filmStripSelector ="#check-duplicates-card div.w-full.flex.overflow-x-auto.overflow-y-hidden.ng-star-inserted";
    const filmStripSelector ="#check-duplicates-card div.flex.w-full.min-w-0.gap-3.overflow-x-auto.overflow-y-hidden";
    const candidate = window.wfes.g.reviewPageData();

    function horizontalScroll(e) {
      this.scrollLeft += e.deltaY;
      e.preventDefault(); // Stop regular scroll
    }

    if (candidate.nearbyPortals.length > 0) {
      window.wfes.f.waitForElem(filmStripSelector).then((elem)=>{
      // Hook function to scroll event in filmstrip
        elem.addEventListener("wheel", horizontalScroll, false);

        // Schleife über alle Bilder
        const bilder = document.querySelectorAll(filmStripSelector + " img");
        for (let i = 0; i < bilder.length; i++) {
          const img = bilder[i];
          const alt = img.getAttribute("alt");

          // Wenn das Bild einen Alt-Text hat, füge einen title-Text hinzu
          if (alt) {
            img.setAttribute("title", alt);
          }
        }
      })
        .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    }
  }

  const init = () => {
    window.addEventListener("WFESReviewPageNewLoaded", filmStripScroll);
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
