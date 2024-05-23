// @name         Appeal Data
// @version      1.3.0
// @description  save and show appeal your statements
// @author       AlterTobi

(function() {
  "use strict";

  const lStoreList = "wfes_AppealData";
  const myID = "nominationAppealData";
  const nominationSelector = "app-details-pane > div > div > div > div.flex.flex-row.justify-between";

  function storeAppealData() {
    const appeal = window.wfes.g.reviewAppeal();
    // console.log(GM_info.script.name, ": storeAppealData()");
    // console.dir(appeal);
    window.wfes.f.localGet(lStoreList, {}).then((appealHistory)=>{
      appealHistory[appeal.id] = appeal.statement;
      window.wfes.f.localSave(lStoreList, appealHistory)
        // .then(() => { console.log(GM_info.script.name, ": ", "appeal data saved for:", appeal.id);})
        .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
  }


  function NominationSelected() {
    const myElem = document.getElementById(myID);
    // remove if there
    if (myElem) { myElem.remove();}

    const nom = window.wfes.g.nominationDetail();
    window.wfes.f.localGet(lStoreList, {}).then((appealHistory)=>{
      if (nom.id in appealHistory) {
        wfes.f.waitForElem(nominationSelector)
          .then(elem => {
            const h5 = document.createElement("h5");
            h5.appendChild(document.createTextNode("Appeal Statement"));
            h5.setAttribute("class", "wfesBold");
            h5.style.fontWeight = "bold";

            const textDiv = document.createElement("div");
            // Ersetze Zeilenumbrüche durch <br>, sanitize text
            const safeText = appealHistory[nom.id].split("\n").map(line => {
              const div = document.createElement("div");
              div.textContent = line;
              return div.innerHTML;
            })
              .join("<br>");

            textDiv.innerHTML = safeText;

            const appealDiv = document.createElement("div");
            appealDiv.setAttribute("class", "ng-star-inserted");
            appealDiv.setAttribute("id", myID);
            appealDiv.style.marginBottom = "1em";
            appealDiv.appendChild(h5);
            appealDiv.appendChild(textDiv);

            elem.insertAdjacentElement("beforeBegin", appealDiv);
          })
          .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
      }
    }
    )
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});

  }

  window.addEventListener("WFESReviewAppealSent", storeAppealData);
  window.addEventListener("WFESNominationDetailLoaded", NominationSelected);

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
