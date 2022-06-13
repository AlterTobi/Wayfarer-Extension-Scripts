// ==UserScript==
// @name           WFES - Nomination Notify
// @version        1.3.0
// @description    show nomination status updates
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-NominationNotify.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-NominationNotify.meta.js
// @match          https://wayfarer.nianticlabs.com/*
// @grant          none
// ==/UserScript==

(function() {
  "use strict";

  const lStoreList = "wfesNomList";
  const lStoreVersion = "wfesNomListVersion";
  const lCanAppeal = "wfes_CurrentAppealState";
  const states = ["ACCEPTED", "REJECTED", "VOTING", "DUPLICATE", "WITHDRAWN", "NOMINATED", "APPEALED", "NIANTIC_REVIEW", "HELD"];

  const myCssId = "nominationNotifyCSS";
  const myStyle = `
    #wfesNotify{
    position: absolute;
    bottom: 1em;
    right: 1em;
    width: 30em;
    z-index: 100;
    }
    .wfesNotification{
    border-radius: 0.5em;
    padding: 1em;
    margin-top: 1.5em;
    color: white;
    }
    .wfesBgGreen{
    background-color: #3e8e41CC;
    }
    .wfesBgRed{
    background-color: #CC0000B0;
    }
    .wfesBgOrange{
    background-color: #FC9000D0;
    }
    .wfesBgBlue{
    background-color: #0010DFD0;
    }
    .wfesNotifyCloseButton{
    float: right;
    }
    `;

  function createNotificationArea() {
    const myID = "wfesNotify";
    if ( null === document.getElementById(myID)) {
      const container = document.createElement("div");
      container.id = myID;
      document.getElementsByTagName("body")[0].appendChild(container);
    }
  }

  function createNotification(message, color = "green") {
    const notification = document.createElement("div");
    switch (color) {
    case "red":
      notification.setAttribute("class", "wfesNotification wfesBgRed");
      break;
    case "orange":
      notification.setAttribute("class", "wfesNotification wfesBgOrange");
      break;
    case "blue":
      notification.setAttribute("class", "wfesNotification wfesBgBlue");
      break;
    default:
      notification.setAttribute("class", "wfesNotification wfesBgGreen");
      break;
    }
    notification.onclick = function() {
      notification.remove();
    };

    const content = document.createElement("p");
    content.innerText = message;

    // Purely aesthetic (The whole div closes the notification)
    const closeButton = document.createElement("div");
    closeButton.innerText = "X";
    closeButton.setAttribute("class", "wfesNotifyCloseButton");
    closeButton.setAttribute("style", "cursor: pointer;");

    notification.appendChild(closeButton);
    notification.appendChild(content);

    document.getElementById("wfesNotify").appendChild(notification);
  }

  function getCurrentDateStr() {
    return new Date().toISOString()
      .substr(0, 10);
  }

  function checkAppeal() {
    const canAppeal = window.wfes.g.canAppeal();
    window.wfes.f.localGet(lCanAppeal, false).then((savedState)=>{
      if (!savedState) {
        if(canAppeal) {
          createNotification("new Appeal available", "red");
          window.wfes.f.localSave(lCanAppeal, true);
        }
      } else if(!canAppeal) {
        window.wfes.f.localSave(lCanAppeal, false);
      }
    });
  }

  function checkNomListVersion() {
    window.wfes.f.localGet(lStoreVersion, 0).then((version) => {
      if (version < 1) {
        console.warn("NomListVersion less then 1, converting");
        // convert Dates
        window.wfes.f.localGet(lStoreList, []).then((historyDict) => {
          let myDates;
          // only if we have any saved data
          for (const histID in historyDict) {
            myDates = [];
            for (const dat in historyDict[histID].Dates) {
              myDates.push([historyDict[histID].Dates[dat], dat]);
            }
            historyDict[histID].wfesDates = myDates;
            delete historyDict[histID].Dates;
          }
          window.wfes.f.localSave(lStoreList, historyDict);
          window.wfes.f.localSave(lStoreVersion, 1);
        });
      }
    });
  }

  const detectMissing = () => new Promise((resolve, reject) => {
    // check if saved nomination is not in current list
    // might be in review by Niantic staff
    const nomDict = window.wfes.f.makeIDbasedDictionary(window.wfes.g.nominationsList());
    window.wfes.f.localGet(lStoreList, []).then((historyDict)=>{
      const today = getCurrentDateStr();
      const missingDict = {};
      let miss = {};

      for (const histID in historyDict) {
        if (undefined === nomDict[histID]) {
          // missing
          miss = historyDict[histID];
          if ((miss.status !== "MISSING")) {
            miss.wfesDates.push([today, "MISSING"]);
            miss.status = "MISSING";
            createNotification(`${miss.title} is missing`, "red");
          }
          missingDict[histID] = miss;
        }
      }
      resolve(missingDict);
    })
      .catch(()=>{reject();});
  });

  function detectChange() {
    const nomList = window.wfes.g.nominationsList();
    window.wfes.f.localGet(lStoreList, []).then((historyDict)=>{
      if ( 0 === historyDict.length) {
        // first run, save
        window.wfes.f.localSave(lStoreList, window.wfes.f.makeIDbasedDictionary(nomList));
      }else{
        // Only makes sense to look for change if we have data
        // of the previous state!
        const today = getCurrentDateStr();
        let myDates, historicalData, nom;

        for (let i = 0; i < nomList.length; i++) {
          nom = nomList[i];
          historicalData = historyDict[nom.id];
          myDates = [];

          // detect unknown states
          if (!states.includes(nom.status)) {
            createNotification(`${nom.title} has unknown state: ${nom.status}`, "blue");
          }

          if (undefined === historicalData) {
            myDates.push([today, nom.status]); // save current date and
            // status
            nom.wfesDates = myDates;
            continue; // Skip to next as this is a brand new
            // entry so we don't know it's previous
            // status
          } else if (undefined !== historicalData.wfesDates) {
            // get saved dates - if they exist
            myDates = historicalData.wfesDates;
          }

          // upgrade?
          if (false === historicalData.upgraded && true === nom.upgraded) {
            myDates.push([today, "UPGRADE"]);
            createNotification(`${nom.title} was upgraded!`);
          }

          // Niantic Review?
          if (false === historicalData.isNianticControlled && true === nom.isNianticControlled) {
            createNotification(`${nom.title} went into Niantic review!`, "red");
          }

          // was missing?
          if (("MISSING" === historicalData.status)) {
            createNotification(`${nom.title} returned`, "orange");
          }
          // In queue -> In voting
          if ((historicalData.status !== "VOTING") && ("VOTING" === nom.status)) {
            createNotification(`${nom.title} went into voting!`);
          }else if (historicalData.status !== "ACCEPTED" && historicalData.status !== "REJECTED" && historicalData.status !== "DUPLICATE") {
            if ("ACCEPTED" === nom.status) {
              createNotification(`${nom.title} was accepted!`);
            }else if("REJECTED" === nom.status) {
              createNotification(`${nom.title} was rejected!`);
            }else if("DUPLICATE" === nom.status) {
              createNotification(`${nom.title} was marked as a duplicate!`);
            }
          } else if ((historicalData.status !== "APPEALED") && ("APPEALED" === nom.status)) {
            createNotification(`${nom.title} was appealed!`);
          }

          // save Date if state changes
          if (historicalData.status !== nom.status) {
            myDates.push([today, nom.status]);
          }

          nom.wfesDates = myDates;
          nomList[i] = nom;
        }

        // Store the new state
        const nomDict = window.wfes.f.makeIDbasedDictionary(nomList);
        detectMissing().then((missingDict)=>{
          const fullDict = Object.assign(nomDict, missingDict);
          window.wfes.f.localSave(lStoreList, fullDict);
        });
      }
    });
  }

  function NominationPageLoaded() {
    window.wfes.f.addCSS(myCssId, myStyle);
    createNotificationArea();
    checkNomListVersion();
    detectChange();
    checkAppeal();
  }

  function NominationSelected() {
    window.wfes.f.addCSS(myCssId, myStyle);
    const nomDetail = window.wfes.g.nominationDetail();
    const myID = nomDetail.id;
    window.wfes.f.localGet(lStoreList, []).then((historyDict)=>{
      const myDates = historyDict[myID].wfesDates || [];
      const elem = window.document.querySelector("div.card.details-pane > div.flex.flex-row > span");
      // Inhalt entfernen
      while (elem.childNodes.length > 0) {
        elem.removeChild(elem.firstChild);
      }
      elem.innerText = "";
      let p = document.createElement("p");
      p.innerText = nomDetail.day + " - NOMINATED";
      elem.appendChild(p);
      for ( let i = 0; i < myDates.length; i++) {
        if ((0 === i ) && ("NOMINATED" === myDates[i][1])) {
          continue;
        }
        p = document.createElement("p");
        p.innerText = myDates[i][0] + " - " + myDates[i][1];
        elem.appendChild(p);
      }
    });
  }

  let loadNomTimerId = null;
  window.addEventListener("WFESNominationListLoaded",
    () => { clearTimeout(loadNomTimerId); loadNomTimerId = setTimeout(NominationPageLoaded, 250);});
  window.addEventListener("WFESNominationDetailLoaded", () => {setTimeout(NominationSelected, 10);});

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
