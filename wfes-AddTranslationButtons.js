// @name         Add Translation Buttons
// @version      1.2.2
// @description  Adds buttons to translate parts or all of the text associated with a wayspot
// @author       AlterTobi

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
  `;

  const translationURL = "https://translate.google.com/?sl=auto&q=";

  function getTranslateAllButton(allText, btnText="Translate all") {
    const translateDiv = document.createElement("div");
    const translateButton = document.createElement("a");
    translateButton.setAttribute("target", "wfesTranslate");
    translateButton.href = translationURL + encodeURIComponent(allText);
    translateButton.setAttribute("class", "translBtnAll");

    const translateText = document.createElement("span");
    translateText.innerText = btnText;

    const translateImage = document.createElement("img");
    translateImage.setAttribute("style", "height: 1.3em;");
    translateImage.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z'/%3E%3C/svg%3E";
    translateButton.appendChild(translateImage);
    translateButton.appendChild(translateText);

    translateDiv.appendChild(translateButton);
    return translateDiv;
  }

  // kleinen Button setzen
  function setSmallButton(text, elem) {
    const translateButton = document.createElement("a");
    translateButton.setAttribute("target", "wfesTranslate");
    translateButton.setAttribute("class", "translateButton");
    translateButton.href = translationURL + encodeURIComponent(text);
    translateButton.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24'><path d='M0 0h24v24H0z' fill='none'/><path d='M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z'/></svg>";
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
      elem = document.querySelector("app-review-edit > div > app-review-edit-info > div.review-edit-info.card.p-4.ng-star-inserted > div.mt-4.ng-star-inserted > div > div:nth-child(3)");      elem = document.querySelector("app-review-edit > div > app-review-edit-info > div.review-edit-info.card.p-4.ng-star-inserted > div.mt-4.ng-star-inserted div:nth-child(3)");
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
})();
