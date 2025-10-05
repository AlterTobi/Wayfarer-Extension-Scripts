// @name         Showcase
// @version      1.4.2
// @description  Improve Wayfarer Showcase - obsolete
// @author       AlterTobi

(function() {
  "use strict";

  const warnText = ": This script is no longer supported, please uninstall.";

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
  console.error(GM_info.script.name, warnText);
  window.wfes.f.createNotification(`${GM_info.script.name} ${warnText}`, "red" );
  //  window.alert(GM_info.script.name + "\n" + warnText);
  // 2025-10-05
})();
