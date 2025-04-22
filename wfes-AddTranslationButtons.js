// @name         Add Translation Buttons
// @version      2.1.7
// @description  Adds a button to translate the text associated with a wayspot
// @author       AlterTobi
// @match        https://wayfarer.nianticlabs.com/*
// @match        https://www.deepl.com/*
// @match        https://translate.google.com/

(function() {
  "use strict";

  const ORIGIN_WAYFARER = "https://wayfarer.nianticlabs.com";
  const ORIGIN_DEEPL = "https://www.deepl.com";
  const ORIGIN_GOOGLE = "https://translate.google.com";

  // ----- BEGIN - the Wayfarer part ------
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
        margin: 0 auto;
    }
    .dark .wfesTranslate select,
    .dark .wfesTranslate option {
        background: #000;
    }`;

  const engines ={
    Google: {name: "Google", title: "Google translate", url: "https://translate.google.com/?sl=auto&q=", target: "wfesTranslateGoogle", twindow: null, origin: ORIGIN_GOOGLE},
    Deepl:  {name: "Deepl", title: "DeepL translate", url: "https://www.deepl.com/translator#auto/"+navigator.language+"/", target: "wfesTranslateDeepl", twindow: null, origin: ORIGIN_DEEPL}
  };

  let fensterG = null; // merke dir das Google fenster
  let fensterD = null; //

  const buttonID = "wfesTranslateButton";
  const storageName = "wfes_translateEngine";
  let currentEngine;

  function removeButton() {
    const button = document.getElementById(buttonID);
    if (button !== null) {
      button.remove();
    }
  }

  // debug
  function watchWindow(win, onClose, interval = 1000) {
    if (!win || win.closed) {
      onClose();
      return;
    }

    const checker = setInterval(() => {
      if (!win || win.closed) {
        clearInterval(checker);
        onClose();
      }
    }, interval);
  }

  function sendTextToTranslateWindow(fenster, text, origin) {
    try {
      fenster.postMessage({
        type: "translate",
        payload: text
      }, origin); // "*" = alle Ursprünge erlauben (für Google Translate nötig)
    } catch (e) {
      console.warn("Nachricht konnte nicht gesendet werden:", e.message);
    }
  }

  function onTranslateButtonClick(text) {
    const engine = engines[currentEngine];
    let url;
    const target = engine.target;

    // Google und Deepl (vorerst) unterscheiden)
    switch(currentEngine) {
      case "Google":
        url = engine.url + encodeURIComponent(text);
        // fenster per Link öffnen
        if (fensterG && !fensterG.closed) {
          fensterG.location.href = url;
        } else {
          fensterG = window.open(url, target); // Beispiel: öffnet die Übersetzung in neuem Tab/Fenster

          // Beobachtung starten, wenn noch nicht aktiv
          watchWindow(fensterG, () => {
            console.log("Google Übersetzungsfenster wurde geschlossen.");
            fensterG = null;
          });
        }
        break;
      case "Deepl":
        url = engine.url;
        // fenster öffnen und nachricht senden
        // fenster per Link öffnen - DEBUG
        if (fensterD && !fensterD.closed) {
          fensterD.focus();
          sendTextToTranslateWindow(fensterD, text, ORIGIN_DEEPL);
        } else {
          fensterD = window.open(url, target); // Beispiel: öffnet die Übersetzung in neuem Tab/Fenster
          window.addEventListener("message", (event) => {
            if ("deepl-ready" === event.data?.type && fensterD && !fensterD.closed) {
              sendTextToTranslateWindow(fensterD, text, ORIGIN_DEEPL);
            }
          });
          // Beobachtung starten, wenn noch nicht aktiv
          watchWindow(fensterD, () => {
            console.log("Deepl Übersetzungsfenster wurde geschlossen.");
            fensterD = null;
          });
        }
        break;
      default:
        console.warn("unbekannte Engine:", currentEngine, "not handeled");
    }
  }

  function createButton(text) {
    window.wfes.f.waitForElem("wf-logo").then(elem => {
      // remove if exist
      removeButton();
      const div = document.createElement("div");
      div.className = "wfesTranslate";
      div.id = buttonID;

      const select = document.createElement("select");
      select.title = "Select translation engine";

      for (const engineName of Object.keys(engines)) {
        const engine = engines[engineName];
        const option = document.createElement("option");
        option.value = engine.name;

        if (engine.name === currentEngine) {
          option.setAttribute("selected", "true");
        }

        option.innerText = engine.title;
        select.appendChild(option);
      }

      select.addEventListener("change", function() {
        currentEngine = select.value;
        window.wfes.f.localSave(storageName, currentEngine);
      });

      const button = document.createElement("button");
      button.title = "Translate nomination";
      button.className = "wfesTranslateButton";
      button.innerHTML = '<span class="material-icons">translate</span>';
      button.addEventListener("click", function() {
        onTranslateButtonClick(text);
      });

      div.appendChild(select);
      div.appendChild(button);

      const container = elem.parentNode.parentNode;
      container.appendChild(div);
    })
      .catch((e) => {
        console.warn(GM_info.script.name, ": ", e);
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

    // is title-edit
    if (edit.what.title) {
      for (let i = 0; i < candidate.titleEdits.length; i++) {
        allText += candidate.titleEdits[i].value + "\n\n";
      }
    }

    // has description
    if (candidate.description) {
      allText += candidate.description + "\n\n";
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

  function initWF() {
    window.addEventListener("WFESReviewPageNewLoaded", addTranslationButtonsNew);
    window.addEventListener("WFESReviewPageEditLoaded", addTranslationButtonsEdit);
    window.addEventListener("WFESReviewPagePhotoLoaded", addTranslationButtonsPhoto);
    window.addEventListener("WFESReviewDecisionSent", removeButton);

    window.wfes.f.addCSS(myCSSId, myStyle);
    window.wfes.f.localGet(storageName, "Deepl").then(e => {
      currentEngine = e;
    });
  }
  // ----- END - the Wayfarer part ------

  // common functions (can't use wfes functions in translation windows)
  function waitForElem(selector, maxWaitTime = 5000) {
    const startTime = Date.now();
    return new Promise((resolve, reject) => {
      const checkForElement = () => {
        const elem = document.querySelector(selector);
        if (elem) {
          resolve(elem);
        } else if (Date.now() - startTime >= maxWaitTime) {
          reject(new Error(`Timeout waiting for element with selector ${selector} after ${maxWaitTime/1000} seconds`));
        } else {
          setTimeout(checkForElement, 200);
        }
      };
      checkForElement();
    });
  }

  // ----- BEGIN - the Deepl part ------
  const deeplInputArea = 'd-textarea[name="source"] div[contenteditable="true"]';

  function initD() {
    waitForElem(deeplInputArea)
      .then( () => {
        console.log("readyCheck -> post");
        window.opener?.postMessage({ type: "deepl-ready" }, ORIGIN_WAYFARER);
      }
      )
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});

    function setDeepLText(text) {
      waitForElem(deeplInputArea)
        .then( elem => {
          elem.innerHTML = `<p>${text.replace(/\n/g, "<br>")}</p>`;
          // DeepL über Änderungen informieren
          elem.dispatchEvent(new InputEvent("input", { bubbles: true }));
        })
        .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    }

    window.addEventListener("message", (event) => {
      const msg = event.data;

      if ("translate" === msg?.type && "string" === typeof msg.payload) {
        console.log("DeepL: Text erhalten:", msg.payload);
        setDeepLText(msg.payload);
      }
    });
  }
  // ----- END - the Deepl part ------

  // ----- BEGIN - the Googl part ------
  function initG() {
    // alert("UserScript läuft auf dieser Seite!");
    // window.addEventListener("message", e => alert("Nachricht empfangen: " + e.data));
  }
  // ----- END - the Google part ------

  // ----- BEGIN - general instructions ------

  switch(window.origin) {
    case ORIGIN_WAYFARER:
      console.log("Init Script loading:", GM_info.script.name, " - Wayfarer");
      initWF();
      break;
    case ORIGIN_DEEPL:
      console.log("Init Script loading:", GM_info.script.name, " - Deepl");
      break;
    case ORIGIN_GOOGLE:
      console.log("Init Script loading:", GM_info.script.name, " - Google");
      initG();
      break;
    default:
      console.warn("unknown origin".window.origin, "not handled");
  }

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();