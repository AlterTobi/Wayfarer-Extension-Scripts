// ==UserScript==
// @name         WFES - Add Translation Buttons
// @namespace    https://github.com/AlterTobi/WFES/
// @version      0.9.0
// @description  Adds buttons to translate parts or all of the text associated with a wayspot
// @author       MrJPGames / AlterTobi
// @match        https://wayfarer.nianticlabs.com/*
// @downloadURL  https://github.com/AlterTobi/WFES/raw/release/v0.9/wfes-AddTranslationButtons.user.js
// @icon         https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @supportURL   https://github.com/AlterTobi/WFES/issues
// @grant        none
// ==/UserScript==

// Dirt port from WF+

(function() {
    'use strict';

    function addCSS(){
        let myID = 'translButtonsCSS';
        if ( null === document.getElementById(myID)) {
            let headElem = document.getElementsByTagName("HEAD")[0];
            let customStyleElem = document.createElement("style");
            customStyleElem.setAttribute('id',myID);
            customStyleElem.innerText = `
                .translateButton{
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
                    background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z'/%3E%3C/svg%3E\");
                        box-shadow: 0 0 2px grey;
                    }
                    .translateButton > *{
                    display:inline;
                }`;
            headElem.appendChild(customStyleElem);
        }
    }

    function getTranslateAllButton(allText){
        let translateButton = document.createElement("a");
        translateButton.setAttribute("target", "wfesTranslate");
        translateButton.setAttribute("class", "translateButton");
        translateButton.setAttribute("style", "display: inline; color: black; background-image: none; width: fit-content;");
        translateButton.href = "https://translate.google.com/?sl=auto&q=" + encodeURIComponent(allText);

        let translateText = document.createElement("span");
        translateText.innerText = "Translate all";

        let translateImage = document.createElement("img");
        translateImage.setAttribute("style", "height: 1.3em;");
        translateImage.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z'/%3E%3C/svg%3E";
        translateButton.appendChild(translateImage);
        translateButton.appendChild(translateText);

        return translateButton;
    }

    function addEditTranslationButtons(){
        addCSS();
        let elems = document.getElementsByClassName("poi-edit-text");

        let style = "margin-botton: 0 !important; margin-left: 5pt; display: inline-block;";

        for (let i = 0; i < elems.length; i++){
            let translateButton = document.createElement("a");
            translateButton.setAttribute("target", "wfesTranslate");
            translateButton.setAttribute("class", "translateButton");
            translateButton.setAttribute("style", style);
            translateButton.href = "https://translate.google.com/?sl=auto&q=" + encodeURIComponent(elems[i].innerText);

            elems[i].appendChild(translateButton);
        }
    }

    function addPhotoTranslationButtons(){
        addCSS();
        let elems = [];
        let allText = "";

        elems.push(document.getElementsByClassName("text-lg")[0]);
        elems.push(document.getElementsByClassName("mt-2")[0]);
        for (let i = 0; i < elems.length; i++){
            let translateButton = document.createElement("a");
            translateButton.setAttribute("target", "wfesTranslate");
            translateButton.setAttribute("class", "translateButton");
            translateButton.href = "https://translate.google.com/?sl=auto&q=" + encodeURIComponent(elems[i].innerText);

            allText += elems[i].innerText + "\n\n";

            elems[i].appendChild(translateButton);
        }

        // translate all
        let translateButton = getTranslateAllButton(allText);

        let titleDiv = document.querySelector("app-review-photo > div > div.review-photo__info > div.flex.flex-col")
        titleDiv.insertAdjacentElement('afterbegin', translateButton);
    }

    function addTranslationButtons(){
        addCSS();
        let elems = document.getElementById("title-description-card").children[1].children[0].children;

        let allText = "";

        for (let i = 0; i < elems.length; i++){
            let translateButton = document.createElement("a");
                translateButton.setAttribute("target", "wfesTranslate");
            translateButton.setAttribute("class", "translateButton");
            translateButton.href = "https://translate.google.com/?sl=auto&q=" + encodeURIComponent(elems[i].innerText);

            allText += elems[i].innerText + "\n\n";

            elems[i].appendChild(translateButton);
        }

        if (window.wfes.review.pageData.supportingImageUrl != ""){
            let elem = document.getElementsByClassName("supporting-info-review-card flex-full xl:flex-1 ng-star-inserted")[0];

            let translateButton = document.createElement("a");
            translateButton.setAttribute("target", "wfesTranslate");
            translateButton.setAttribute("class", "translateButton");
            translateButton.href = "https://translate.google.com/?sl=auto&q=" + (encodeURIComponent(elem.getElementsByClassName("wf-review-card__body")[0].innerText));
            let translateDiv = document.createElement("div");
            translateDiv.setAttribute("class", "bg-gray-200 px-4");
            translateDiv.appendChild(translateButton);

            allText += elem.getElementsByClassName("wf-review-card__body")[0].innerText + "\n\n";

            document.getElementsByClassName("supporting-info-review-card flex-full xl:flex-1 ng-star-inserted")[0].getElementsByClassName("wf-review-card__body")[0].children[0].children[1].insertAdjacentElement('afterend', translateDiv);

        }

        let translateButton = getTranslateAllButton(allText);
        let titleDiv = document.getElementById("title-description-card").children[0].children[0];
        titleDiv.appendChild(translateButton);
    }

    window.addEventListener("WFESReviewPageNewLoaded", () => { setTimeout(addTranslationButtons, 10)});
    window.addEventListener("WFESReviewPageEditLoaded", () => { setTimeout(addEditTranslationButtons, 10)});
    window.addEventListener("WFESReviewPagePhotoLoaded", () => { setTimeout(addPhotoTranslationButtons, 10)});
    console.log( "WFES Script loaded: add translation buttons");
})();
