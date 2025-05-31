// @name         Add Translation Buttons
// @version      2.3.2
// @description  Adds a button to translate the text associated with a wayspot
// @author       AlterTobi
// @match        https://wayfarer.nianticlabs.com/*
// @match        https://www.deepl.com/*
// @match        https://translate.kagi.com/*

(function() {
  "use strict";

  const ORIGIN_WAYFARER = "https://wayfarer.nianticlabs.com";
  const ORIGIN_DEEPL = "https://www.deepl.com";
  const ORIGIN_KAGI = "https://translate.kagi.com";

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
        background-color: inherit; /* firefox macht sonst grau */
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
    Google: {
      name: "Google",
      title: "Google translate",
      url: "https://translate.google.com/?sl=auto&q=",
      target: "wfesTranslateGoogle",
      twindow: null
    },
    Deepl: {
      name: "Deepl",
      title: "DeepL translate",
      url: "https://www.deepl.com/translator#auto/"+navigator.language+"/",
      target: "wfesTranslateDeepl",
      twindow: null,
      origin: ORIGIN_DEEPL,
      ready: false,
      pendingText: null
    },
    Kagi: {name: "Kagi",
      title: "Kagi translate",
      url: "https://translate.kagi.com/?from=auto&to="+navigator.language+"&text=",
      target: "wfesTranslateKagi",
      twindow: null,
      origin: ORIGIN_KAGI,
      ready: false,
      pendingText: null
    }
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

  // prüfen, ob Fenster noch offen ist und bei Schließen Callback aufrufen
  function watchWindow(win, onClose) {
    const interval = setInterval(() => {
      if (!win || win.closed) {
        clearInterval(interval);
        onClose();
      }
    }, 1000); // alle 1 Sekunde prüfen
  }

  function sendTextToTranslateWindow(fenster, text, origin) {
    try {
      fenster.postMessage({
        type: "translate",
        payload: text
      }, origin);
    } catch (e) {
      console.warn("Nachricht konnte nicht gesendet werden:", e.message);
    }
  }

  function onTranslateButtonClick(text) {
    const engine = engines[currentEngine];
    const target = engine.target;

    // Google und Deepl unterscheiden
    switch(currentEngine) {
      case "Google": {
        const url = engine.url + encodeURIComponent(text);
        // fenster per Link öffnen
        if (engine.twindow && !engine.twindow.closed) {
          engine.twindow.location.href = url;
        } else {
          engine.twindow = window.open(url, target); // neues Tab/Fenster
        }
        break;
      }
      case "Deepl":
      case "Kagi":
        // fenster öffnen und nachricht senden
        if (engine.twindow && !engine.twindow.closed) {
          engine.twindow.focus();
          if (engine.ready) {
            sendTextToTranslateWindow(engine.twindow, text, engine.origin);
          } else {
            engine.pendingText = text;
          }
        } else {
          engine.ready = false;
          engine.pendingText = text;
          engine.twindow = window.open(engine.url, target);

          watchWindow(engine.twindow, () => {
            console.log(engine.name, "Übersetzungsfenster wurde geschlossen.");
            engine.twindow = null;
            engine.ready = false;
            engine.pendingText = null;
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

  // add translation to Showcase (debug translations without loading a nomination)
  function addTranslationButtonsShowcase() {
    const candidate = window.wfes.g.showcase().list[0];
    let allText = "";
    if(candidate.title) {
      allText += candidate.title + "\n\n";
    }

    if(candidate.description) {
      allText += candidate.description;
    }
    createButton(allText);
  }
  // handle Swipe or Click through Showcase candidates
  function showCaseClick() {
    const candidate = window.wfes.g.showcase().current;
    let allText = "";
    if(candidate.title) {
      allText += candidate.title + "\n\n";
    }

    if(candidate.description) {
      allText += candidate.description;
    }
    createButton(allText);
  }

  function pageLoad() {
    const PAGES = window.wfes.g.wfPages(); // load constants
    if (!window.wfes.f.isPage(PAGES.HOME, PAGES.REVIEW)) {
      removeButton();
    }
  }

  function initWF() {
    window.addEventListener("WFESReviewPageNewLoaded", addTranslationButtonsNew);
    window.addEventListener("WFESReviewPageEditLoaded", addTranslationButtonsEdit);
    window.addEventListener("WFESReviewPagePhotoLoaded", addTranslationButtonsPhoto);
    window.addEventListener("WFESReviewDecisionSent", removeButton);
    window.addEventListener("WFESHomePageLoaded", addTranslationButtonsShowcase);
    window.addEventListener("WFESShowCaseClick", showCaseClick);
    window.addEventListener("WFESPageLoaded", pageLoad);
    window.addEventListener("WFESNominationListLoaded", removeButton);

    window.wfes.f.addCSS(myCSSId, myStyle);
    window.wfes.f.localGet(storageName, "Deepl").then(e => {
      currentEngine = e;
    });

    // ready-Handler, Rückmeldung beim erstmaligen Öffnen eines Übersetzungsfensters
    window.addEventListener("message", (event) => {
      for (const key in engines) {
        const engine = engines[key];
        const expectedType = engine.name + "-ready";
        if (event.data?.type === expectedType) {
          engine.ready = true;
          if (engine.twindow && !engine.twindow.closed && engine.pendingText) {
            sendTextToTranslateWindow(engine.twindow, engine.pendingText, engine.origin);
            engine.pendingText = null;
          }
        }
      }
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
        window.opener?.postMessage({ type: "Deepl-ready" }, ORIGIN_WAYFARER);
      })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});

    function escapeHTML(str) {
      return str.replace(/[&<>"']/g, (char) => {
        const escapeMap = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
        return escapeMap[char];
      });
    }

    function setDeepLText(text) {
      waitForElem(deeplInputArea)
        .then( elem => {
          const sanitizedText = escapeHTML(text).replace(/\n/g, "<br>");
          elem.innerHTML = `<p>${sanitizedText}</p>`;
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

  // ----- BEGIN - the Kagi part ------
  const kagiInputArea = "textarea";

  function initK() {
    waitForElem(kagiInputArea)
      .then( () => {
        console.log("readyCheck -> post");
        window.opener?.postMessage({ type: "Kagi-ready" }, ORIGIN_WAYFARER);
      })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});

    function setKagiText(text) {
      waitForElem(kagiInputArea)
        .then( elem => {
          elem.value = text;
          elem.dispatchEvent(new InputEvent("input", { bubbles: true }));
        })
        .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    }

    window.addEventListener("message", (event) => {
      const msg = event.data;
      if ("translate" === msg?.type && "string" === typeof msg.payload) {
        console.log("Kagi: Text erhalten:", msg.payload);
        setKagiText(msg.payload);
      }
    });
  }
  // ----- END - the Kagi part ------

  // ----- BEGIN - general instructions ------
  switch(window.origin) {
    case ORIGIN_WAYFARER:
      console.log("Init Script loading:", GM_info.script.name, " - Wayfarer");
      initWF();
      break;
    case ORIGIN_DEEPL:
      console.log("Init Script loading:", GM_info.script.name, " - Deepl");
      initD();
      break;
    case ORIGIN_KAGI:
      console.log("Init Script loading:", GM_info.script.name, " - Kagi");
      initK();
      break;
    default:
      console.warn("unknown origin", window.origin, "not handled");
  }

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
