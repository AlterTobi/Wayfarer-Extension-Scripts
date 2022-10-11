// @name         ScrollFix
// @version      0.2.0
// @description  Fix Scroll Down Bug
// @author       AlterTobi

(function() {
  "use strict";

  function scrollUp() {
    const _dom = document.querySelector("mat-sidenav-content");
    const _evfunc= () => {
      console.log("event gescrollt");
      document.querySelector(".wf-page-header__title > div:nth-child(1)").scrollIntoView();
      _dom.removeEventListener("scroll", _evfunc);
    };
    _dom.addEventListener("scroll", _evfunc);
  }

  window.addEventListener("WFESReviewPageNewLoaded", scrollUp);
  window.addEventListener("WFESNominationDetailLoaded", scrollUp);

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();