// @name review Add Street Address
// @version 1.1.0
// @description fix for missing Street Address in Wayfarer 5.2
// @author AlterTobi

(function() {
  "use strict";

  function addStreetAddress() {
    window.wfes.f.waitForElem("#check-duplicates-card > div.wf-review-card__body > div")
      .then((elem) => {
        const data = window.wfes.g.reviewPageData();
        const atext = document.createElement("div");
        atext.appendChild(document.createTextNode(data.streetAddress));
        const _props = window.wfes.g.properties();
        if ("DISABLED" === _props.darkMode) {
          atext.style.backgroundColor = "yellow";
        } else {
          atext.style.color = "yellow";
        }
        elem.insertAdjacentElement("afterBegin", atext);
      });
  }

  function init() {
    window.addEventListener("WFESReviewPageNewLoaded", addStreetAddress);
  }

  init();

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
