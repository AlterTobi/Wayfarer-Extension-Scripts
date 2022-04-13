// @name         Expire Timer
// @version      1.0.0
// @description  Adds a simple timer to the top of the screen showing how much time you have left on the current review.
// @author       MrJPGames / AlterTobi

(function() {
    'use strict';
    let timeElem;
    let headerTimer;

    function createTimer(message) {
        let header = document.getElementsByTagName("wf-header")[0].children[0].children[0];
        let headerTimerWrapper = document.createElement("div");
        headerTimer = document.createElement("span");
        headerTimer.innerText = message;
        headerTimerWrapper.appendChild(headerTimer);
        headerTimerWrapper.setAttribute("style", "display: inline-block; margin-left: 5em;");
        headerTimerWrapper.setAttribute("class", "revExprTimer");
        timeElem = document.createElement("div");
        timeElem.innerText = "??:??";
        timeElem.style.display = "inline-block";
        headerTimerWrapper.appendChild(timeElem);
        header.insertAdjacentElement('afterend', headerTimerWrapper);
        updateTimer();
    }

    function updateTimer() {
        const now = Date.now();
        const tDiff = window.wfes.g.reviewPageData().expires - now;

        if (tDiff > 0) {
            var tDiffMin = Math.floor(tDiff / 1000 / 60);
            var tDiffSec = Math.ceil(tDiff / 1000 - 60 * tDiffMin);
            timeElem.innerText = pad(tDiffMin, 2) + ":" + pad(tDiffSec, 2);
            headerTimer.innerText = "Time remaining: ";
            // Retrigger function in 1 second
            setTimeout(updateTimer, 1000);
        } else {
            timeElem.innerText = "EXPIRED!";
            timeElem.setAttribute("style", "color: red;");
        }
    }

    // Helper functions
    function pad(num, size) {
        var s = num + "";
        while (s.length < size){s = "0" + s;}
        return s;
    }

    window.addEventListener("WFESReviewPageLoaded", () => createTimer("Time remaining: "));
    console.log("Script loaded:", GM_info.script.name, 'v' + GM_info.script.version);
})();