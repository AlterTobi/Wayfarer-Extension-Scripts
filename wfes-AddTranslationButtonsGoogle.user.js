// ==UserScript==
// @name           WFES - Add Translation Buttons Google
// @version        1.4.1
// @description    Adds buttons to translate parts or all of the text associated with a wayspot
// @author         AlterTobi
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://altertobi.github.io/Wayfarer-Extension-Scripts/assets/icon_32.png
// @icon64         https://altertobi.github.io/Wayfarer-Extension-Scripts/assets/icon_64.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-AddTranslationButtonsGoogle.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-AddTranslationButtonsGoogle.meta.js
// @match          https://wayfarer.nianticlabs.com/*
// @grant          none
// ==/UserScript==

/* Copyright 2026 AlterTobi

   This file is part of the Wayfarer Extension Scripts collection. Further scripts
   can be found on the @homepage, see above.

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
   https://altertobi.github.io/Wayfarer-Extension-Scripts/LICENSE.txt
   If not, see <http://www.gnu.org/licenses/>.
*/

(function() {
  "use strict";

  const myCssId = "translButtonsCSS";
  const myStyle = `.translateButton{
        border: 2pt solid white;
        border-radius: 2pt;
        width: 17pt;
        font-size: 14px;
        background-color: white;
        color: black;
        display: inline-block;
        height: 17pt;
        margin-left: 3pt;
        box-shadow: 0 0 2px grey;
      }
      .translBtnAll {
        background-color: white;
        background-image: none;
        border: 2pt solid white;
        border-radius: 2pt;
        box-shadow: 0 0 2px grey;
        color: black;
        display: inline;
        font-size: 14px;
        height: 17pt;
        margin-bottom: 5pt;
        width: fit-content;
      }
      .translBtnAll > *{
        display:inline;
      }
      .translBtnDiv {
        display: inline-block;
        margin-right: 5px;
      }
  `;

  const translationURL = "https://translate.google.com/?sl=auto&q=";

  function getTranslateAllButton(allText, btnText="Translate all") {
    const translateDiv = document.createElement("div");
    translateDiv.setAttribute("class", "translBtnDiv");
    const translateButton = document.createElement("a");
    translateButton.setAttribute("target", "wfesTranslateGoogle");
    translateButton.href = translationURL + encodeURIComponent(allText);
    translateButton.setAttribute("class", "translBtnAll");

    const translateText = document.createElement("span");
    translateText.appendChild(document.createTextNode(btnText));

    const translateImage = document.createElement("img");
    translateImage.setAttribute("style", "height: 1.3em;");
    translateImage.src = "data:image/svg+xml;charset=UTF-8,%3Csvg width='24' height='24' version='1.1' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m0 0h24v24h-24z' fill='%23fff'/%3E%3Cpath d='m12.87 15.07-2.54-2.51 0.03-0.03c1.74-1.94 2.98-4.17 3.71-6.53h2.93v-2h-7v-2h-2v2h-7v1.99h11.17c-0.67 1.93-1.73 3.76-3.17 5.36-0.93-1.03-1.7-2.16-2.31-3.35h-2c0.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02 1.42 1.42 5-5 3.11 3.11z' fill='%2300f'/%3E%3Cpath d='m18.5 10h-2l-4.5 12h2l1.12-3h4.75l1.13 3h2zm-2.62 7 1.62-4.33 1.62 4.33z' fill='%23ff0'/%3E%3C/svg%3E";
    translateButton.appendChild(translateImage);
    translateButton.appendChild(translateText);

    translateDiv.appendChild(translateButton);
    return translateDiv;
  }

  // kleinen Button setzen
  function setSmallButton(text, elem) {
    const translateButton = document.createElement("a");
    translateButton.setAttribute("target", "wfesTranslateGoogle");
    translateButton.setAttribute("class", "translateButton");
    translateButton.setAttribute("title", "translate");
    translateButton.href = translationURL + encodeURIComponent(text);
    translateButton.innerHTML = "<svg width='16' height='16' version='1.1' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='m0 0h24v24h-24z' fill='#fff'/><path d='m12.87 15.07-2.54-2.51 0.03-0.03c1.74-1.94 2.98-4.17 3.71-6.53h2.93v-2h-7v-2h-2v2h-7v1.99h11.17c-0.67 1.93-1.73 3.76-3.17 5.36-0.93-1.03-1.7-2.16-2.31-3.35h-2c0.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02 1.42 1.42 5-5 3.11 3.11z' fill='#00f'/><path d='m18.5 10h-2l-4.5 12h2l1.12-3h4.75l1.13 3h2zm-2.62 7 1.62-4.33 1.62 4.33z' fill='#ff0'/></svg>";
    elem.appendChild(translateButton);
  }

  // review NEW
  function addTranslationButtons() {
    const candidate = window.wfes.g.reviewPageData();
    let elem;

    window.wfes.f.addCSS(myCssId, myStyle);

    let allText = candidate.title + "\n\n";
    allText += candidate.description + "\n\n";

    elem = document.querySelector("#title-description-card > div.wf-review-card__body > div > a");
    setSmallButton(candidate.title, elem);

    elem = document.querySelector("#title-description-card > div.wf-review-card__body > div > div");
    setSmallButton(candidate.description, elem);

    if ("" !== candidate.supportingImageUrl) {
      elem = document.querySelector("app-supporting-info > wf-review-card > div.wf-review-card__body > div > div.mt-2.bg-gray-200.px-4.py-2.ng-star-inserted");
      setSmallButton(candidate.statement, elem);
      allText += candidate.statement;
    }

    const translateButton = getTranslateAllButton(allText);
    // const titleDiv = document.getElementById("title-description-card").children[0].children[0];
    const titleDiv = document.querySelector("#title-description-card > div.wf-review-card__header > div:nth-child(1)");
    titleDiv.appendChild(translateButton);
  }

  // EDIT
  function addAllButons() {
    const candidate = window.wfes.g.reviewPageData();
    const edit = window.wfes.g.edit();
    let allText = "";
    let editText = "";
    let elem, translateButtonAll;

    window.wfes.f.addCSS(myCssId, myStyle);

    // has title
    if ("" !== candidate.title) {
      allText += candidate.title + "\n\n";
      elem = document.querySelector("app-review-edit > div > app-review-edit-info > div.review-edit-info.card.p-4.ng-star-inserted > div.mt-4.ng-star-inserted > div.review-edit-info__info.text-xl.break-words");
      setSmallButton(candidate.title, elem);
    }

    // has description
    if ("" !== candidate.description) {
      allText += candidate.description + "\n\n";
      elem = document.querySelector("app-review-edit > div > app-review-edit-info > div.review-edit-info.card.p-4.ng-star-inserted > div.mt-4.ng-star-inserted > div > div:nth-child(3)");
      setSmallButton(candidate.description, elem);
    }

    // is title-edit
    if (edit.what.title) {
      for (let i = 0; i < candidate.titleEdits.length; i++) {
        allText += candidate.titleEdits[i].value + "\n\n";
        editText += candidate.titleEdits[i].value + "\n\n";
      }
      translateButtonAll = getTranslateAllButton(editText, "Translate");
      elem = document.querySelector("app-select-title-edit > wf-review-card > div.wf-review-card__header > div");
      elem.appendChild(translateButtonAll);
    }

    // is description-edit
    if (edit.what.description) {
      editText = "";
      for (let i = 0; i < candidate.descriptionEdits.length; i++) {
        if ("" !== candidate.descriptionEdits[i].value) {
          allText += candidate.descriptionEdits[i].value + "\n\n";
          editText += candidate.descriptionEdits[i].value + "\n\n";
        }
      }
      translateButtonAll = getTranslateAllButton(editText, "Translate");
      elem = document.querySelector("app-select-description-edit > wf-review-card > div.wf-review-card__header > div");
      elem.appendChild(translateButtonAll);
    }

    // set Translate all button to header
    translateButtonAll = getTranslateAllButton(allText, "Translate All");
    elem = document.querySelector("app-review > wf-page-header > div > div > p");
    elem.appendChild(translateButtonAll);
  }

  // PHOTO
  function addPhotoTranslationButtons() {
    const candidate = window.wfes.g.reviewPageData();
    let allText = "";
    let elem;

    window.wfes.f.addCSS(myCssId, myStyle);

    if("" !== candidate.title) {
      elem = document.querySelector("app-review-photo > div div.text-lg");
      setSmallButton(candidate.title, elem);
      allText += candidate.title + "\n\n";
    }

    if("" !== candidate.description) {
      elem = document.querySelector("app-review-photo > div div.flex.flex-col > div.mt-2");
      setSmallButton(candidate.description, elem);
      allText += candidate.description + "\n\n";
    }

    // translate all
    const translateButton = getTranslateAllButton(allText);
    const titleDiv = document.querySelector("app-review-photo > div > div.review-photo__info > div.flex.flex-col");
    titleDiv.insertAdjacentElement("afterbegin", translateButton);
  }

  window.addEventListener("WFESReviewPageNewLoaded", () => { setTimeout(addTranslationButtons, 100);});
  window.addEventListener("WFESReviewPageEditLoaded", () => { setTimeout(addAllButons, 100);});
  window.addEventListener("WFESReviewPagePhotoLoaded", () => { setTimeout(addPhotoTranslationButtons, 100);});

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
  console.warn(GM_info.script.name, ": This script is no longer supported, please remove.");
})();
