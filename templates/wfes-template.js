// @name         Template
// @version      1.2.0
// @description  Template
// @author       AlterTobi

(function() {
  "use strict";

  const sessvarMiss = "warnBase";
  const baseMinVersion = "2.3.0";
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

  const init = () => {
    window.addEventListener("WFESHomePageLoaded", myTemplate);

  };

  // === no changes needed below this line ======================
  if("undefined" === typeof(wfes)) {
    if (undefined === sessionStorage[sessvarMiss]) {
      sessionStorage[sessvarMiss] = 1;
      alert("Missing WFES Base. Please install from https://altertobi.github.io/Wayfarer-Extension-Scripts/");
      console.error("Missing WFES Base. Please install from https://altertobi.github.io/Wayfarer-Extension-Scripts/");
    }
  } else if (window.wfes.f.hasMinVersion(baseMinVersion)) {
    init();
  } else {
    console.warn(GM_info.script.name, "Need at least wfes-Base version ", baseMinVersion, " Please upgrade.");
  }

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();