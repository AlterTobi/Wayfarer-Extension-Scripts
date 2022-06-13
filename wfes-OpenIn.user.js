// ==UserScript==
// @name           WFES - maps open in
// @version        1.1.4
// @description    add "Open In" for maps
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-OpenIn.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-OpenIn.meta.js
// @match          https://wayfarer.nianticlabs.com/*
// @grant          none
// ==/UserScript==

(function() {
  "use strict";

  // map URLs, %lat%, %lng% will be replaced by nominations coordinates
  const customMaps = [
    { title: "Google", url: "https://maps.google.com/maps?q=%lat%,%lng%"},
    { title: "Intel", url: "https://intel.ingress.com/intel?ll=%lat%,%lng%&z=18"},
    { title: "OSM", url: "https://www.openstreetmap.org/?mlat=%lat%&mlon=%lng%#map=18/%lat%/%lng%"}
  ];

  let tryCounter = 0;
  const buttonID = "openInButton";

  const myCssId = "openInCSS";
  const myStyle = `.mapsDropdown {
      background-color: white;
      border-radius: 5px;
      box-shadow: grey 2px 2px 10px;
      margin-bottom: .5em;
      font-size: 1.1em;
      color: black;
      padding: .25em;
      width: 7em;
      text-align: center;
    }
    .dropdown-content {
      display: none;
      position: absolute;
      /* left: -.25em; */
      transform: translateY(-100%);
      border-radius: 5px;
      background-color: #f9f9f9;
      min-width: 160px;
      box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
      z-index: 9001;
    }
    .dropdown-content a {
      color: black;
      padding: 12px 16px;
      text-decoration: none;
      display: block;
    }
    .dropdown-content a:hover {
      background-color: #f1f1f1
      border-radius: 5px;
    }
    .mapsDropdown:hover .dropdown-content {
      display: block;
    }
    .mapsDropdown:hover .dropbtn {
      background-color: #3e8e41;
    }
    `;

  // NON-SECURE (But good enough for uniqueID on URLs)
  function getStringHash(str) {
    let hash = 0;
    if (0 === str.length) {
      return hash;
    }
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash<<5)-hash)+char;
      hash = hash & hash;
    }
    return hash;
  }

  function getMapDropdown(lat, lng) {
    // Create main dropdown menu ("button")
    const mainButton = document.createElement("div");
    mainButton.setAttribute("class", "mapsDropdown");
    mainButton.id = buttonID;

    const buttonText = document.createElement("span");
    buttonText.innerText = "Open in ...";

    const dropdownContainer = document.createElement("div");
    dropdownContainer.setAttribute("class", "dropdown-content");
    dropdownContainer.innerHTML = null;

    mainButton.appendChild(dropdownContainer);
    mainButton.appendChild(buttonText);

    if (0 === customMaps.length) {
      const emptySpan = document.createElement("span");
      emptySpan.innerText = "No custom maps set!";
      dropdownContainer.appendChild(emptySpan);
    } else {
      for (let i=0; i < customMaps.length; i++) {
        const title = customMaps[i].title;
        let link = customMaps[i].url;

        // Link editing:
        link = link.replace(/%lat%/g, lat).replace(/%lng%/g, lng);

        const button = document.createElement("a");
        button.href = link;
        button.setAttribute("target", getStringHash(customMaps[i].url));
        // On URL with placeholders as those are the same between
        // different wayspots but not between different maps!
        button.innerText = title;
        dropdownContainer.appendChild(button);
      }
    }
    return mainButton;
  }

  function addDropdownReview() {
    let elem, elemlist;

    window.wfes.f.addCSS(myCssId, myStyle);

    const pageData = window.wfes.g.reviewPageData();
    const mainButton = getMapDropdown(pageData.lat, pageData.lng);

    switch (pageData.type) {
    case "NEW":
      elem = document.getElementById("location-accuracy-card");
      if (null === elem) {
        if (tryCounter++ > 10) {
          console.warn("WFES - Open In - no DOM - abort");
        } else {
          setTimeout(addDropdownReview, 100);
        }
        return;
      }
      tryCounter = 0;
      elem.children[2].insertAdjacentElement("afterbegin", mainButton);
      break;
    case "EDIT":
      elemlist = document.getElementsByClassName("review-edit-info card p-4 ng-star-inserted");
      elem = elemlist[elemlist.length-1];
      elem.insertAdjacentElement("afterEnd", mainButton);
      break;
    case "PHOTO":
      elem = document.querySelector(".review-photo__info > div.flex.flex-col");
      elem.insertAdjacentElement("beforeend", mainButton);
      break;
    }
  }

  function NominationPageLoaded() {
    window.wfes.f.addCSS(myCssId, myStyle);
  }

  function addDropdownNomination() {
    // remove existing first
    const button = document.getElementById(buttonID);
    if (button !== null) {
      button.remove();
    }
    const nomDetail = window.wfes.g.nominationDetail();

    const mainButton = getMapDropdown(nomDetail.lat, nomDetail.lng);
    const elem = document.getElementsByClassName("details-pane__map")[0];
    elem.parentNode.appendChild(mainButton);
  }

  function addButtonShowCase(btn) {
    window.wfes.f.addCSS(myCssId, myStyle);
    // remove if exists
    const button = document.getElementById(buttonID);
    if (button !== null) {
      button.remove();
    }
    const elem = document.querySelector("div.showcase-item__info");
    elem.insertAdjacentElement("beforeend", btn);
  }

  function showCaseLoaded() {
    const showcase = window.wfes.g.showcase();
    const mainButton = getMapDropdown(showcase.list[0].lat, showcase.list[0].lng);
    addButtonShowCase(mainButton);
  }

  function showCaseClick() {
    const showcase = window.wfes.g.showcase();
    const mainButton = getMapDropdown(showcase.current.lat, showcase.current.lng);
    addButtonShowCase(mainButton);
  }

  let selNomTimerId = null;
  let loadNomTimerId = null;

  window.addEventListener("WFESReviewPageLoaded", () => {setTimeout(addDropdownReview, 100);});
  window.addEventListener("WFESNominationDetailLoaded", () => { clearTimeout(selNomTimerId); selNomTimerId = setTimeout(addDropdownNomination, 250);});
  window.addEventListener("WFESNominationListLoaded", () => { clearTimeout(loadNomTimerId); loadNomTimerId = setTimeout(NominationPageLoaded, 250);});
  window.addEventListener("WFESHomePageLoaded", () => {setTimeout(showCaseLoaded, 250);});
  window.addEventListener("WFESShowCaseClick", showCaseClick);

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
