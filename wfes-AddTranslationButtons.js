// @name         Add Translation Buttons
// @version      1.2.0
// @description  Adds buttons to translate parts or all of the text associated with a wayspot
// @author       MrJPGames / AlterTobi

// Dirt port from WF+
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
        display: block;
        height: 17pt;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        margin-bottom: 5pt;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z'/%3E%3C/svg%3E");
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

  function _titleEdit(candidate) {
    let allText = "";
    for (let i = 0; i < candidate.titleEdits.length; i++) {
      allText += candidate.titleEdits[i].value;
      allText += "\n\n";
    }
    const translateButton = getTranslateAllButton(allText, "Translate");
    const editCard = document.querySelector("app-select-title-edit > wf-review-card > div.wf-review-card__header > div");
    editCard.appendChild(translateButton);
  }

  function _locationEdit(candidate) {
    let allText = "";
    allText += candidate.title;
    allText += "\n\n" + candidate.description;
    const translateButton = getTranslateAllButton(allText, "Translate");
    const editBar = document.querySelector("app-review-edit > div > app-review-edit-info> div.review-edit-info.card.p-4.ng-star-inserted > div.mt-4.ng-star-inserted > div");
    editBar.appendChild(translateButton);
  }

  function _descriptionEdit(candidate) {
    let allText = "";
    for (let i = 0; i < candidate.descriptionEdits.length; i++) {
      if ("" !== candidate.descriptionEdits[i].value) {
        allText += candidate.descriptionEdits[i].value + "\n\n";
      }
    }
    const translateButton = getTranslateAllButton(allText, "Translate");
    const editCard = document.querySelector("app-select-description-edit > wf-review-card > div.wf-review-card__header > div");
    editCard.appendChild(translateButton);
  }

  function addEditTranslationButtons() {
    window.wfes.f.addCSS(myCssId, myStyle);
    const candidate = window.wfes.g.reviewPageData();
    const edit = window.wfes.g.edit();
    if (edit.what.title) {
      _titleEdit(candidate);
    }
    if (edit.what.location) {
      _locationEdit(candidate);
    }
    if (edit.what.description) {
      _descriptionEdit(candidate);
    }
  }

  // EDIT PHOTO
  function addPhotoTranslationButtons() {
    window.wfes.f.addCSS(myCssId, myStyle);
    const elems = [];
    let allText = "";

    elems.push(document.getElementsByClassName("text-lg")[0]);
    elems.push(document.getElementsByClassName("mt-2")[0]);
    for (let i = 0; i < elems.length; i++) {
      const translateButton = document.createElement("a");
      translateButton.setAttribute("target", "wfesTranslate");
      translateButton.setAttribute("class", "translateButton");
      translateButton.href = translationURL + encodeURIComponent(elems[i].innerText);

      allText += elems[i].innerText + "\n\n";

      elems[i].appendChild(translateButton);
    }

    // translate all
    const translateButton = getTranslateAllButton(allText);

    const titleDiv = document.querySelector("app-review-photo > div > div.review-photo__info > div.flex.flex-col");
    titleDiv.insertAdjacentElement("afterbegin", translateButton);
  }

  // review NEW
  function addTranslationButtons() {
    window.wfes.f.addCSS(myCssId, myStyle);

    const pageData = window.wfes.g.reviewPageData();
    const elems = document.getElementById("title-description-card").children[1].children[0].children;

    let allText = pageData.title + "\n\n";
    allText += pageData.description + "\n\n";

    for (let i = 0; i < elems.length; i++) {
      const translateButton = document.createElement("a");
      translateButton.setAttribute("target", "wfesTranslate");
      translateButton.setAttribute("class", "translateButton");
      translateButton.href = translationURL + encodeURIComponent(elems[i].innerText);

      elems[i].appendChild(translateButton);
    }

    if ("" !== pageData.supportingImageUrl) {
      const elem = document.getElementsByClassName("supporting-info-review-card flex-full xl:flex-1 ng-star-inserted")[0];

      const translateButton = document.createElement("a");
      translateButton.setAttribute("target", "wfesTranslate");
      translateButton.setAttribute("class", "translateButton");
      translateButton.href = translationURL + (encodeURIComponent(elem.getElementsByClassName("wf-review-card__body")[0].innerText));
      const translateDiv = document.createElement("div");
      translateDiv.setAttribute("class", "bg-gray-200 px-4");
      translateDiv.appendChild(translateButton);

      allText += pageData.statement;

      document.getElementsByClassName("supporting-info-review-card flex-full xl:flex-1 ng-star-inserted")[0].getElementsByClassName("wf-review-card__body")[0].children[0].children[1].insertAdjacentElement("afterend", translateDiv);

    }

    const translateButton = getTranslateAllButton(allText);
    const titleDiv = document.getElementById("title-description-card").children[0].children[0];
    titleDiv.appendChild(translateButton);
  }

  // EDIT - NEU - Trans ALL
  function addAllButons() {
    const candidate = window.wfes.g.reviewPageData();
    const translateButton = document.createElement("a");
    let allText = "";
    let editText = "";
    let elem, translateButtonAll;

    window.wfes.f.addCSS(myCssId, myStyle);
    translateButton.setAttribute("target", "wfesTranslate");
    translateButton.setAttribute("class", "translateButton");

    // has title
    if ("" !== candidate.title) {
      allText += candidate.title + "\n\n";
      elem = document.querySelector("app-review-edit > div > app-review-edit-info > div.review-edit-info.card.p-4.ng-star-inserted > div.mt-4.ng-star-inserted > div.review-edit-info__info.text-xl.break-words");
      translateButton.href = translationURL + encodeURIComponent(candidate.title);
      elem.appendChild(translateButton);
    }

    // has description
    if ("" !== candidate.description) {
      allText += candidate.description + "\n\n";
      // @TODO
      elem = document.querySelector("app-review-edit > div > app-review-edit-info > div");
      translateButton.href = translationURL + encodeURIComponent(candidate.description);
      elem.appendChild(translateButton);
    }

    // is title-edit
    if (edit.what.title) {
      for (let i = 0; i < candidate.titleEdits.length; i++) {
        allText += candidate.titleEdits[i].value + "\n\n";
        editText += candidate.titleEdits[i].value + "\n\n";
      }
      translateButtonAll = getTranslateAllButton(editText, "Translate");
      elem = document.querySelector("app-select-title-edit > wf-review-card > div.wf-review-card__header > div");
      elem.appendChild(translateButton);
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
      elem.appendChild(translateButton);
    }

    // set Translate all button to header
    translateButtonAll = getTranslateAllButton(allText, "Translate All");
    elem = document.querySelector("app-review > wf-page-header > div > div > p");
    elem.appendChild(translateButtonAll);
  }

  window.addEventListener("WFESReviewPageNewLoaded", () => { setTimeout(addTranslationButtons, 10);});
  // window.addEventListener("WFESReviewPageEditLoaded", () => { setTimeout(addEditTranslationButtons, 10);});
  window.addEventListener("WFESReviewPageEditLoaded", () => { setTimeout(addAllButons, 1000);});
  window.addEventListener("WFESReviewPagePhotoLoaded", () => { setTimeout(addPhotoTranslationButtons, 10);});

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
