// @name         Appeal Data
// @version      1.2.2
// @description  save and show appeal your statements
// @author       AlterTobi

(function() {
  "use strict";

  const lStoreList = "wfes_AppealData";
  const myID = "nominationAppealData";
  let nomImage, appealDiv;
  let haveDiv = false;

  function storeAppealData() {
    const appeal = window.wfes.g.reviewAppeal();
    window.wfes.f.localGet(lStoreList, {}).then((appealHistory)=>{
      appealHistory[appeal.id] = appeal.statement;
      window.wfes.f.localSave(lStoreList, appealHistory);
    });
  }

  function NominationSelected() {
    const nomID = window.wfes.g.nominationDetail().id;
    window.wfes.f.localGet(lStoreList, {}).then((appealHistory)=>{
      if (nomID in appealHistory) {
        nomImage = document.querySelector("app-details-pane > div > div > div > img.wf-image-modal.details-pane__image");
        if (haveDiv) {
          // remove all child nodes
          while (haveDiv.children[1].lastChild) {
            haveDiv.children[1].removeChild(haveDiv.children[1].lastChild);
          }
          appealDiv.appendChild(document.createTextNode(appealHistory[nomID]));
        } else {
          appealDiv = document.createElement("div");
          appealDiv.setAttribute("class", "ng-star-inserted");
          appealDiv.setAttribute("id", myID);
          appealDiv.innerHTML="<h5>Appeal Statement</h5><div></div>";
          appealDiv.children[1].appendChild(document.createTextNode(appealHistory[nomID]));
          nomImage.insertAdjacentElement("beforeBegin", appealDiv);
          haveDiv = true;
        }
      } else if (document.getElementById(myID)) {
        nomImage.parentNode.removeChild(appealDiv);
        haveDiv = false;
      }
    });
  }

  window.addEventListener("WFESReviewAppealSent", storeAppealData);
  window.addEventListener("WFESNominationDetailLoaded", () => {setTimeout(NominationSelected, 10);});

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
