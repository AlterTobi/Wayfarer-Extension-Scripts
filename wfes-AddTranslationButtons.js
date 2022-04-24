// @name         Add Translation Buttons
// @version      1.0.4
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
      background-color: white;
      display: block;
      height: 17pt;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      margin-bottom: 5pt;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z'/%3E%3C/svg%3E");
          box-shadow: 0 0 2px grey;
      }
      .translateButton > *{
      display:inline;
  }`;

  function getTranslateAllButton(allText) {
    const translateButton = document.createElement("a");
    translateButton.setAttribute("target", "wfesTranslate");
    translateButton.setAttribute("class", "translateButton");
    translateButton.setAttribute("style", "display: inline; color: black; background-image: none; width: fit-content;");
    translateButton.href = "https://translate.google.com/?sl=auto&q=" + encodeURIComponent(allText);

    const translateText = document.createElement("span");
    translateText.innerText = "Translate all";

    const translateImage = document.createElement("img");
    translateImage.setAttribute("style", "height: 1.3em;");
    translateImage.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z'/%3E%3C/svg%3E";
    translateButton.appendChild(translateImage);
    translateButton.appendChild(translateText);

    return translateButton;
  }

  function _descriptionEdit(candidate) {
    let allText = "";
    for (let i = 0; i < candidate.titleEdits.length; i++) {
      allText += candidate.titleEdits[i].value;
      allText += "\n";
    }
    const translateButton = getTranslateAllButton(allText);
    const editCard = document.querySelector("app-select-title-edit > wf-review-card > div.wf-review-card__header > div");
    editCard.appendChild(translateButton);
  }

  function addEditTranslationButtons() {
    window.wfes.f.addCSS(myCssId, myStyle);
    const candidate = window.wfes.g.reviewPageData();
    const edit = window.wfes.g.edit();
    if (edit.what.title) {
      _descriptionEdit(candidate);
    }
  }

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
      translateButton.href = "https://translate.google.com/?sl=auto&q=" + encodeURIComponent(elems[i].innerText);

      allText += elems[i].innerText + "\n\n";

      elems[i].appendChild(translateButton);
    }

    // translate all
    const translateButton = getTranslateAllButton(allText);

    const titleDiv = document.querySelector("app-review-photo > div > div.review-photo__info > div.flex.flex-col");
    titleDiv.insertAdjacentElement("afterbegin", translateButton);
  }

  function addTranslationButtons() {
    window.wfes.f.addCSS(myCssId, myStyle);
    const elems = document.getElementById("title-description-card").children[1].children[0].children;

    let allText = "";

    for (let i = 0; i < elems.length; i++) {
      const translateButton = document.createElement("a");
      translateButton.setAttribute("target", "wfesTranslate");
      translateButton.setAttribute("class", "translateButton");
      translateButton.href = "https://translate.google.com/?sl=auto&q=" + encodeURIComponent(elems[i].innerText);

      allText += elems[i].innerText + "\n\n";

      elems[i].appendChild(translateButton);
    }

    const pageData = window.wfes.g.reviewPageData();

    if ("" !== pageData.supportingImageUrl) {
      const elem = document.getElementsByClassName("supporting-info-review-card flex-full xl:flex-1 ng-star-inserted")[0];

      const translateButton = document.createElement("a");
      translateButton.setAttribute("target", "wfesTranslate");
      translateButton.setAttribute("class", "translateButton");
      translateButton.href = "https://translate.google.com/?sl=auto&q=" + (encodeURIComponent(elem.getElementsByClassName("wf-review-card__body")[0].innerText));
      const translateDiv = document.createElement("div");
      translateDiv.setAttribute("class", "bg-gray-200 px-4");
      translateDiv.appendChild(translateButton);

      allText += elem.getElementsByClassName("wf-review-card__body")[0].innerText + "\n\n";

      document.getElementsByClassName("supporting-info-review-card flex-full xl:flex-1 ng-star-inserted")[0].getElementsByClassName("wf-review-card__body")[0].children[0].children[1].insertAdjacentElement("afterend", translateDiv);

    }

    const translateButton = getTranslateAllButton(allText);
    const titleDiv = document.getElementById("title-description-card").children[0].children[0];
    titleDiv.appendChild(translateButton);
  }

  window.addEventListener("WFESReviewPageNewLoaded", () => { setTimeout(addTranslationButtons, 10);});
  window.addEventListener("WFESReviewPageEditLoaded", () => { setTimeout(addEditTranslationButtons, 10);});
  window.addEventListener("WFESReviewPagePhotoLoaded", () => { setTimeout(addPhotoTranslationButtons, 10);});

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
