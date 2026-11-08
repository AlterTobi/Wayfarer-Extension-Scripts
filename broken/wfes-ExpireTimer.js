// @name        Expire Timer
// @version     1.2.99
// @description Adds a simple timer to the top of the screen showing how much time you have left on the current review.
// @author      MrJPGames / AlterTobi

(function() {
  "use strict";

  const logger = new window.UserScriptLogger(GM_info.script.name, true);

  const sessvarMiss = "warnBase";
  const baseMinVersion = "3.0.0";

  const myCSSId = "wfesExpireCSS";
  const myStyle = `.wfesExpire {
      color: #333;
      margin-left: 2em;
      align-self: center;
      text-align: center;
      display: flex;
      align-items: center;
    }
    .dark .wfesExpire {
      color: #ddd;
    }
`;

  const buttonID = "expireButton";
  let timeElem;

  // Helper functions
  function pad(num, size) {
    let s = num + "";
    while (s.length < size) {s = "0" + s;}
    return s;
  }

  function updateTimer() {
    const now = Date.now();
    const tDiff = window.wfes.g.reviewPageData().expires - now;

    if (tDiff > 0) {
      const tDiffMin = Math.floor(tDiff / 1000 / 60);
      const tDiffSec = Math.ceil((tDiff / 1000) - (60 * tDiffMin));
      timeElem.innerText = pad(tDiffMin, 2) + ":" + pad(tDiffSec, 2);
      // Retrigger function in 1 second
      setTimeout(updateTimer, 1000);
    } else {
      timeElem.innerText = "EXPIRED!";
      timeElem.setAttribute("style", "color: red;");
    }
  }

  function createTimer(message) {
    window.wfes.f.addCSS(myCSSId, myStyle);

    const div = document.createElement("div");
    div.className = "wfesExpire";
    div.id = buttonID;
    const expireTimer = document.createElement("span");
    expireTimer.appendChild(document.createTextNode(message));
    div.appendChild(expireTimer);
    timeElem = document.createElement("div");
    timeElem.appendChild(document.createTextNode("??:??"));
    timeElem.style.display = "inline-block";
    div.appendChild(timeElem);

    window.wfes.f.createHeaderButton(div, buttonID);
    updateTimer();

  }

  const init = () => {
    window.addEventListener("WFESReviewPageLoaded", () => createTimer("Time remaining: "));
    window.addEventListener("WFESReviewDecisionSent", () => window.wfes.f.removeButton(buttonID));
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
