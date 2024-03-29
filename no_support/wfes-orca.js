// @name         ORCa
// @version      1.0.2
// @description  ORCa
// @author       AlterTobi
// @resource     orca https://altertobi.github.io/Wayfarer-Extension-Scripts/images/orca.png
// @grant        GM_getResourceURL

(function() {
  "use strict";

  const myCssId = "wfesORCaCSS";
  const myStyle = `.wfesORC {
      color: #333;
      margin-left: 2em;
      text-align: center;
      display: block;
    }
    `;

  const sessvarMiss = "warnBase";
  const acceptBtnList = ["#appropriate-card", "#safe-card", "#accurate-and-high-quality-card", "#permanent-location-card"];
  const rejectBtnList = ["#socialize-card", "#exercise-card", "#explore-card"];
  const categoriesSel = "#categorization-card > div.wf-review-card__body > div > mat-button-toggle-group > mat-button-toggle:nth-child(2) > button";
  const buttonID = "orcaButton";

  function removeButton() {
    const button = document.getElementById(buttonID);
    if (button !== null) {
      button.remove();
    }
  }

  function orcaClick() {
    // die ersten 4 Daumen hoch
    acceptBtnList.forEach(sel => {
      const fulSel = sel + "> div > div.action-buttons-row > button:nth-child(1)";
      wfes.f.waitForElem(fulSel).then((elem) => {elem.click();})
        .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    });
    // die nächsten 3 Daumen runter
    rejectBtnList.forEach(sel => {
      const fulSel = sel + "> div > div.action-buttons-row > button:nth-child(2)";
      wfes.f.waitForElem(fulSel).then((elem) => {elem.click();})
        .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    });

    // alle Kategorien abwählen
    const noBtnsList = document.querySelectorAll(categoriesSel);
    noBtnsList.forEach(elem => {elem.click();});
  }


  function createButton() {
    removeButton(); // remove before creating new
    wfes.f.waitForElem("wf-logo").then(elem=>{
      const image = GM_getResourceURL("orca");
      const div = document.createElement("div");
      div.className = "wfesORC";
      div.id = buttonID;
      const link = document.createElement("a");
      link.title = "ORC";
      link.addEventListener("click", orcaClick);
      const img = document.createElement("img");
      img.setAttribute("style", "height: 60px;");
      img.src = image;
      link.appendChild(img);
      div.appendChild(link);
      const container = elem.parentNode.parentNode;
      container.appendChild(div);
    })
      .catch(e => {
        console.warn(GM_info.script.name, ": ", e);
      });
  }

  function ORCa() {
    wfes.f.addCSS(myCssId, myStyle);
    createButton();
  }

  function init() {
    window.addEventListener("WFESReviewPageNewLoaded", ORCa);
    window.addEventListener("WFESReviewDecisionSent", removeButton);
  }

  if("undefined" === typeof(wfes)) {
    if (undefined === sessionStorage[sessvarMiss]) {
      sessionStorage[sessvarMiss] = 1;
      alert("Missing WFES Base. Please install from https://altertobi.github.io/Wayfarer-Extension-Scripts/");
      console.error("Missing WFES Base. Please install from https://altertobi.github.io/Wayfarer-Extension-Scripts/");
    }
  } else {
    init();
  }

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();