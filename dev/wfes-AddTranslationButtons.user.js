// ==UserScript==
// @name           WFES - Add Translation Buttons
// @version        2.1.5
// @description    Adds a button to translate the text associated with a wayspot
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/assets/icon_32.png
// @icon64         https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/assets/icon_64.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/wfes-AddTranslationButtons.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/wfes-AddTranslationButtons.meta.js
// @match          https://wayfarer.nianticlabs.com/*
// @grant          none
// ==/UserScript==

/* Copyright 2024 AlterTobi

   This file is part of the Wayfarer Extension Scripts collection.

   Wayfarer Extension Scripts are free software: you can redistribute and/or modify
   them under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.

   Wayfarer Extension Scripts are distributed in the hope that they will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
   GNU General Public License for more details.

   You can find a copy of the GNU General Public License at the
   web space where you got this script from
   https://altertobi.github.io/Wayfarer-Extension-Scripts/dev/LICENSE.txt
   If not, see <http://www.gnu.org/licenses/>.
*/

(function() {
  "use strict";

  const myCSSId = "wfesTranslateCSS";
  const myStyle = `.wfesTranslate {
      color: #333;
      margin-left: 2em;
      padding-top: 0.3em;
      text-align: center;
      display: block;
    }
    .dark .wfesTranslate {
      color: #ddd;
    }
    .wfesTranslate select {
        margin-bottom: 0.2em; /* Abstand zwischen Dropdown und Button */
    }
    .wfesTranslateButton {
        display: block; /* Button wird unterhalb des Selects angezeigt */
        text-decoration: none;
        color: #20B8E3;
    }
    .dark .wfesTranslate select,
    .dark .wfesTranslate option {
        background: #000;
    }`;

  const engines ={
    Google: {name: "Google", title: "Google translate", url: "https://translate.google.com/?sl=auto&q=", target: "wfesTranslateGoogle"},
    Deepl:  {name: "Deepl", title: "DeepL translate", url: "https://www.deepl.com/translator#auto/"+navigator.language+"/", target: "wfesTranslateDeepl"}
  };

  const buttonID = "wfesTranslateButton";
  const storageName = "wfes_translateEngine";
  let currentEngine;


  function removeButton() {
    const button = document.getElementById(buttonID);
    if (button !== null) {
      button.remove();
    }
  }

  function init() {
    window.wfes.f.addCSS(myCSSId, myStyle);
    window.wfes.f.localGet(storageName, "Deepl").then(e => {
      currentEngine = e;
    });
  }

  function createButton(text) {
    window.wfes.f.waitForElem("wf-logo").then(elem=>{
      const buttonEl = document.getElementById(buttonID);
      if (null === buttonEl) {
        const div = document.createElement("div");
        div.className = "wfesTranslate";
        div.id = buttonID;
        const link = document.createElement("a");
        link.title = "Translate nomination";
        link.className = "wfesTranslateButton";
        link.innerHTML = '<span class="material-icons">translate</span>';

        const select = document.createElement("select");
        select.title = "Select translation engine";

        for (const engineName of Object.keys(engines)) {
          const engine = engines[engineName];
          const option = document.createElement("option");
          option.value = engine.name;

          if (engine.name === currentEngine) {
            option.setAttribute("selected", "true");
            link.target = engine.target;
            link.href = engine.url + encodeURIComponent(text);
          }
          option.innerText = engine.title;
          select.appendChild(option);
        }

        select.addEventListener("change", function() {
          currentEngine = select.value;
          window.wfes.f.localSave(storageName, currentEngine);
          link.href = engines[currentEngine].url + encodeURIComponent(text);
          link.target = engines[currentEngine].target;
        });
        div.appendChild(select);
        div.appendChild(link);
        const container = elem.parentNode.parentNode;
        container.appendChild(div);
      } else {
        const a = buttonEl.querySelector("a");
        a.href = engines[currentEngine].url + encodeURIComponent(text);
        a.target = engines[currentEngine].url;

      }
    })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
  }

  function addTranslationButtonsNew() {
    const candidate = window.wfes.g.reviewPageData();

    let allText = candidate.title + "\n\n";
    allText += candidate.description + "\n\n";

    if (candidate.supportingImageUrl) {
      allText += candidate.statement;
    }
    createButton(allText);
  }

  function addTranslationButtonsEdit( ) {
    const candidate = window.wfes.g.reviewPageData();
    const edit = window.wfes.g.edit();
    let allText = "";

    // has title
    if (candidate.title) {
      allText += candidate.title + "\n\n";
    }

    // has description
    if (candidate.description) {
      allText += candidate.description + "\n\n";
    }

    // is title-edit
    if (edit.what.title) {
      for (let i = 0; i < candidate.titleEdits.length; i++) {
        allText += candidate.titleEdits[i].value + "\n\n";
      }
    }

    // is description-edit
    if (edit.what.description) {
      for (let i = 0; i < candidate.descriptionEdits.length; i++) {
        const value = candidate.descriptionEdits[i].value;
        if (value) {
          allText += value + "\n\n";
        }
      }
    }
    createButton(allText);
  }

  function addTranslationButtonsPhoto() {
    const candidate = window.wfes.g.reviewPageData();
    let allText = "";
    if(candidate.title) {
      allText += candidate.title + "\n\n";
    }

    if(candidate.description) {
      allText += candidate.description;
    }
    createButton(allText);
  }

  init();
  window.addEventListener("WFESReviewPageNewLoaded", addTranslationButtonsNew);
  window.addEventListener("WFESReviewPageEditLoaded", addTranslationButtonsEdit);
  window.addEventListener("WFESReviewPagePhotoLoaded", addTranslationButtonsPhoto);
  window.addEventListener("WFESReviewDecisionSent", removeButton);

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();