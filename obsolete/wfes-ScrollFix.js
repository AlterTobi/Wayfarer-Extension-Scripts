// @name         ScrollFix
// @version      0.3.0
// @description  Fix Scroll Down Bug - obsolete / disabled
// @author       AlterTobi

(function() {
  "use strict";

  function scrollUp() {
    const _dom = document.querySelector("mat-sidenav-content");
    const _evfunc= () => {
      console.log("event gescrollt");
      const elem = document.querySelector(".wf-page-header__title > div:nth-child(1)");
      if (null !== elem) {
        elem.scrollIntoView();
      }
      _dom.removeEventListener("scroll", _evfunc);
    };
    _dom.addEventListener("scroll", _evfunc);
  }

  const init = function() {
  // window.addEventListener("WFESReviewPageNewLoaded", scrollUp);
    window.addEventListener("WFESNominationDetailLoaded", scrollUp);
  };

  // init
  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
  console.error(GM_info.script.name, ": This script is no longer supported, please remove.");
  window.alert(GM_info.script.name + "\nThis script is no longer supported, please remove.");

})();