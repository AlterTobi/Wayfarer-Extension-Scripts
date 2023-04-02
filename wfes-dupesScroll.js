// @name         dupes Scroll
// @version      1.1.1
// @description  make duplicates strip scrollable by mouse wheel
// @author       AlterTobi

(function() {
  "use strict";
  const baseMinVersion = "1.7.0";

  function filmStripScroll() {
    // Make film strip (duplicates) scrollable
    const filmStripSelector ="#check-duplicates-card div.w-full.flex.overflow-x-auto.overflow-y-hidden.ng-star-inserted";

    function horizontalScroll(e) {
      this.scrollLeft += e.deltaY;
      e.preventDefault(); // Stop regular scroll
    }

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
      .catch((error) => {
        console.error(error);
      });
  }

  if (window.wfes.f.hasMinVersion(baseMinVersion)) {
    window.addEventListener("WFESReviewPageNewLoaded", filmStripScroll);
  } else {
    console.warn(GM_info.script.name, "Need at least wfes-Base version ", baseMinVersion, " Please upgrade.");
  }

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
