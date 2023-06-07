// @name         Add Translation Button
// @version      2.0.0
// @description  Adds a button to translate the text associated with a wayspot
// @author       AlterTobi

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
    .wfesTranslate svg {
       width: 24px;
       height: 24px;
       filter: none;
       fill: currentColor;
       margin: 0 auto;
    }
    .dark .wayfarertranslate select,
    .dark .wayfarertranslate option {
        background: #000;
    }`;

  const engines ={
    Google: {name: "Google", title: "Google translate", url: "https://translate.google.com/?sl=auto&q=", target: "wfesTranslateGoogle"},
    Deepl:  {name: "Deepl", title: "Deepl translate", url: "https://www.deepl.com/translator#auto/"+navigator.language+"/", target: "wfesTranslateDeepl"}
  };

  const myID = "wfesTranslateButton";
  const storageName = "wfes_translateEngine";
  let currentEngine, translateButton;

  function init() {
    window.wfes.f.addCSS(myCSSId, myStyle);
    window.wfes.f.localGet(storageName, "Deepl").then(e => {
      currentEngine = e;
    });
  }

  function createButton(text) {
    window.wfes.f.waitForElem("wf-logo").then(elem=>{
      const buttonEl = document.getElementById(myID);
      if (null === buttonEl) {
        const div = document.createElement("div");
        div.className = "wfesTranslate";
        const link = document.createElement("a");
        link.title = "Translate nomination";
        link.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04M18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12m-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>';

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
        translateButton = div;
        const container = elem.parentNode.parentNode;
        container.appendChild(div);
      } else {
        const a = buttonEl.querySelector("a");
        a.href = engines[currentEngine].url + encodeURIComponent(text);
        a.target = engines[currentEngine].url;
      }
    })
      .catch(e => {
        console.warn(e);
      });
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

  function removeButton() {
    translateButton.remove();
  }

  init();
  window.addEventListener("WFESReviewPageNewLoaded", addTranslationButtonsNew);
  window.addEventListener("WFESReviewPageEditLoaded", addTranslationButtonsEdit);
  window.addEventListener("WFESReviewPagePhotoLoaded", addTranslationButtonsPhoto);
  window.addEventListener("WFESReviewDecisionSent", removeButton);
  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();