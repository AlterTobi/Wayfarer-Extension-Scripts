// @name         Template
// @version      1.0.1
// @description  Template
// @author       AlterTobi

(function() {
  "use strict";

  const myCssId = "templateCSS";
  const myStyle = `body {
        display: none;
    }
    `;

  function myTemplate() {
    window.wfes.f.addCSS(myCssId, myStyle);
    // YOUR CODE HERE
    // .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
  }

  window.addEventListener("WFESHomePageLoaded", myTemplate);

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();