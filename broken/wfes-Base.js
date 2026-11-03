// @name         Base
// @version      3.0.0
// @description  basic functionality for WFES
// @author       AlterTobi
// @run-at       document-start

/* eslint no-unused-vars: ["error", { "args": "none" }] */

(function() {
  "use strict";

  // wegen der *monkey Sandboxen
  // const globalWindow = "undefined" === typeof unsafeWindow ? window : unsafeWindow;
  const globalWindow = window;

  const logger = new globalWindow.UserScriptLogger(GM_info.script.name, true);

  /* WFES data structures */
  const PREFIX = "/api/v1/vault/";
  const loginPath = "/login";
  // session storage
  const sStoreReview = "wfes_Reviews";
  const sStoreNominationsDetails = "wfes_nominationDetails";
  // indexedDB
  const idbName = "wfes-data";
  const idbLocalStorageCompat = "localStorage";

  const myCssId = "notifyAreaCSS";
  const myStyle = `
    /* Container */
        #wfesNotify {
          position: absolute;
          bottom: 1em;
          right: 1em;
          width: 40em;
          z-index: 100;
        }

    /* Einzelne Notifications */
        .wfesNotification {
          border-radius: 0.5em;
          padding: 1em;
          margin-top: 1.5em;
          color: white;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 0.5em;
        }

    /* Inhalt mit Text und Buttons */
        .wfesNotificationContent {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

    /* Text */
        .wfesTextGroup {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .wfesNotificationContent p {
          flex: 1; /* Flexibles Wachstum des Textes */
          margin: 0;
          padding-right: 10px; /* Platz zwischen Text und Buttons */
          word-wrap: break-word; /* Zeilenumbruch für lange Texte */
          overflow-wrap: break-word;
        }

    /* Buttons-Gruppe */
        .wfesButtonGroup {
          display: flex;
          align-items: center;
        }

    /* notification Buttons */
        .wfesNotiButton {
          font-size: 32px;
          cursor: pointer;
        }

    .wfesBgGreen{
    background-color: #3e8e41CC;
    }
    .wfesBgRed{
    background-color: #CC0000B0;
    }
    .wfesBgOrange{
    background-color: #FC9000D0;
    }
    .wfesBgBlue{
    background-color: #0010DFD0;
    }
    .wfesBgFuchsia{
    background-color: fuchsia;
    }
    `;

  const wfes = {};
  wfes.showcase = {};
  wfes.review = {};
  wfes.review.decision = {};
  wfes.review.appeal = {};
  wfes.profile = {};
  wfes.nominations = {};
  wfes.edit = {};
  wfes.properties = {};
  wfes.settings = {};
  wfes.messages = {};
  wfes.version = "0.0.0";
  wfes.userId = false;
  wfes.currentPage = null;
  wfes.mapData = {};
  wfes.livePois = {};
  wfes.poiDetails = {};
  wfes.poiImages = {};
  wfes.submitAvailable = {};
  wfes.loginConfig = {};
  wfes.drafts = {};

  wfes.WF_PAGES = {
    STARTPAGE: 0,
    HOME: 1,
    REVIEW: 2,
    PROFILE: 3,
    MANAGE: 4,
    MANAGE_DETAIL: 5,
    PROPERTIES: 6,
    SETTINGS: 7,
    HELP: 8,
    MAP: 9,
    SUBMIT: 10
  };

  const tmpUserId = "temporaryUserId";
  let propsLoaded = false;
  let _isMobile = false;
  let _isLoggedIn = true; // be optimistic

  globalWindow.wfes = {};
  globalWindow.wfes.f = globalWindow.wfes.g = globalWindow.wfes.s = {}; // functions, getter, setter

  // test for mobile platform, for browser compatibility see
  // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userAgentData
  if ((undefined !== globalWindow.navigator.userAgentData ) && globalWindow.navigator.userAgentData.mobile ) {
    _isMobile = true;
  }

  /* =========== helper ============================= */
  function _waitForElem(selector, maxWaitTime = 5000) {
    const startTime = Date.now();
    return new Promise((resolve, reject) => {
      const checkForElement = () => {
        const elem = document.querySelector(selector);
        if (elem) {
          resolve(elem);
        } else if (Date.now() - startTime >= maxWaitTime) {
          reject(new Error(`Timeout waiting for element with selector ${selector} after ${maxWaitTime/1000} seconds`));
        } else {
          setTimeout(checkForElement, 100);
        }
      };
      checkForElement();
    });
  }

  function checkWfVersion(v) {
    if (wfes.version !== v) {
      // console.log("WF version changed from", wfes.version, "to", v);
      wfes.version = v;
      globalWindow.dispatchEvent(new Event("WFESVersionChanged"));
    }
  }

  // make a copy of data
  function jCopy(data) {
    return (JSON.parse(JSON.stringify(data)));
  }

  // Hash funktion
  const TSH = s => {let h=9; for(let i=0; i<s.length;) {h=Math.imul(h^s.charCodeAt(i++), 9**9);}return h^(h>>>9);};

  // set UserID when properties available
  function setUserId() {
    try {
      wfes.userId = TSH(wfes.properties.socialProfile.email).toString(16);
      console.warn("setuserid");
    } catch(e) {
      console.error(GM_info.script.name, ": userprofile does not contain email ", e);
    }
  }
  globalWindow.addEventListener("WFESPropertiesLoaded", setUserId);

  // sometimes (i.e. when pressing F5) properties are not (re-)loaded by WF
  function _getPropsOnce() {
    if (_isLoggedIn && (false === propsLoaded)) {
      if ( null !== globalWindow.document.querySelector("body > app-root > app-wayfarer")) {
        // make sure, application is loaded, login is: globalWindow.document.querySelector('body > app-root > app-login')
        const theUrl = "/api/v1/vault/properties";
        const request = new XMLHttpRequest();
        request.open("GET", theUrl, true);
        request.addEventListener("load", function(event) {
          if (!(request.status >= 200 && request.status < 300)) {
            console.warn(request.statusText, request.responseText);
          }
        });
        request.send();
        propsLoaded = true;
      }
    }
  }

  // wait for UserId
  const getUserId = () => new Promise((resolve, reject) => {
    const checkUID = tries => {
      if (tries > 20) {
        // resolve(tmpUserId);
        _getPropsOnce();
        reject();
      } else if (wfes.userId) {
        resolve(wfes.userId);
      } else {
        setTimeout(() => checkUID(tries + 1), 200);
      }
    };
    checkUID(1);
  });

  /* =========== IndexedDB ============================= */
  const getIDBInstance = version => new Promise((resolve, reject) => {

    if (!globalWindow.indexedDB) {
      reject("This browser doesn't support IndexedDB!");
      return;
    }

    const openRequest = globalWindow.indexedDB.open(idbName, version);
    openRequest.onsuccess = event => {
      const db = event.target.result;
      resolve(db);
    };
    openRequest.onerror = (event) => {
      console.error("Error using IndexedDB", event.target.errorCode);
      reject(event.target.errorCode);
    };
    openRequest.onupgradeneeded = event => {
      console.log(GM_info.script.name, "Upgrading database...");
      const db = event.target.result;
      // const ver = db.version;
      if (!db.objectStoreNames.contains(idbLocalStorageCompat)) {
        db.createObjectStore(idbLocalStorageCompat, { keyPath: "index" });
      }
    };
  });
  /* =========== /IndexedDB ============================ */


  /* handle data */
  function handleReviewData(result) {
    // save review data in ...pagedata and sessionstore
    globalWindow.wfes.f.sessionGet(sStoreReview, [] ).then((reviewSessionHist)=>{
      wfes.review.sessionHist = globalWindow.wfes.f.makeIDbasedDictionary(reviewSessionHist);
      if (undefined === wfes.review.sessionHist[result.id]) {
        reviewSessionHist.push(result);
        globalWindow.wfes.f.sessionSave(sStoreReview, reviewSessionHist);
        wfes.review.sessionHist[result.id] = result;
      }
    });
    wfes.edit.isEdit = false;

    wfes.review.pageData = result;
    switch (wfes.review.pageData.type) {
      case "NEW":
        globalWindow.dispatchEvent(new Event("WFESReviewPageNewLoaded"));
        break;
      case "EDIT":
        wfes.edit.isEdit = true;
        wfes.edit.what = {};
        wfes.edit.what.location = result.locationEdits.length > 1;
        wfes.edit.what.description = result.descriptionEdits.length > 0;
        wfes.edit.what.title = result.titleEdits.length > 0;
        globalWindow.dispatchEvent(new Event("WFESReviewPageEditLoaded"));
        break;
      case "PHOTO":
        globalWindow.dispatchEvent(new Event("WFESReviewPagePhotoLoaded"));
        break;
    }
    globalWindow.dispatchEvent(new Event("WFESReviewPageLoaded"));
    globalWindow.dispatchEvent(new Event("WFESPageLoaded"));
  }


  /* ================ handle fetch data ================ */


  function handleFetchData(url, response) {
    logger.debug("handleFetchData");
    try {
      logger.custom()
        .blue()
        .bgYellow()
        .text(response)
        .print();

      const json = JSON.parse(response);

      // ignore captcha
      if (json.captcha) {
        return;
      }

      if ("OK" !== json.code) {
        console.warn("WFES: got no OK from server", response);
        return;
      }
      if (json.result) {
        checkWfVersion(json.version);
      } else {
        logger.warn("WFES: got no result from server");
        return;
      }

      let lang;
      switch (url) {
        case PREFIX + "home":
          wfes.currentPage = wfes.WF_PAGES.HOME;
          wfes.showcase.list = json.result.showcase;
          globalWindow.dispatchEvent(new Event("WFESHomePageLoaded"));
          globalWindow.dispatchEvent(new Event("WFESPageLoaded"));
          break;
        case PREFIX + "review":
          wfes.currentPage = wfes.WF_PAGES.REVIEW;
          if ("GET" === this._method) {
            handleReviewData(json.result);
          }
          break;
        case PREFIX + "loginconfig":
          wfes.currentPage = wfes.WF_PAGES.STARTPAGE;
          _isLoggedIn = false;
          wfes.loginConfig = json.result;
          globalWindow.dispatchEvent(new Event("WFESStartpageLoaded"));
          break;
        case PREFIX + "profile":
          wfes.currentPage = wfes.WF_PAGES.PROFILE;
          wfes.profile = json.result;
          globalWindow.dispatchEvent(new Event("WFESProfileLoaded"));
          globalWindow.dispatchEvent(new Event("WFESPageLoaded"));
          break;
        case PREFIX + "manage":
          wfes.currentPage = wfes.WF_PAGES.MANAGE;
          // nomination list
          wfes.nominations.list = json.result.submissions; // .filter(obj => "NOMINATION" === obj.type).slice();
          wfes.nominations.canAppeal = json.result.canAppeal;
          globalWindow.dispatchEvent(new Event("WFESNominationListLoaded"));
          globalWindow.dispatchEvent(new Event("WFESPageLoaded"));
          break;
        case PREFIX + "manage/detail":
          wfes.currentPage = wfes.WF_PAGES.MANAGE_DETAIL;
          // nomination detail
          wfes.nominations.detail = json.result;
          // save nomination Details in Sessionstorage
          globalWindow.wfes.f.sessionGet(sStoreNominationsDetails, {}).then((nominationDict)=>{
            nominationDict[wfes.nominations.detail.id] = wfes.nominations.detail;
            globalWindow.wfes.f.sessionSave(sStoreNominationsDetails, nominationDict).then(()=>{
              globalWindow.dispatchEvent(new Event("WFESNominationDetailLoaded"));
              globalWindow.dispatchEvent(new Event("WFESNominationDetailLoaded"+json.result.type));
            });
          });
          break;
        case PREFIX + "properties":
          wfes.currentPage = wfes.WF_PAGES.PROPERTIES;
          wfes.properties = json.result;
          globalWindow.dispatchEvent(new Event("WFESPropertiesLoaded"));
          break;
        case PREFIX + "settings":
          wfes.currentPage = wfes.WF_PAGES.SETTINGS;
          wfes.settings = json.result;
          globalWindow.dispatchEvent(new Event("WFESSettingsLoaded"));
          globalWindow.dispatchEvent(new Event("WFESPageLoaded"));
          break;
        case PREFIX + "help":
          wfes.currentPage = wfes.WF_PAGES.HELP;
          globalWindow.dispatchEvent(new Event("WFESHelpPageLoaded"));
          globalWindow.dispatchEvent(new Event("WFESPageLoaded"));
          break;
        case PREFIX + "mapview/track/access":
          // has no result - do nothing
          break;
        case PREFIX + "mapview/track/zoom-range-entered":
          // has no result - do nothing
          break;
        case PREFIX + "static-map-url":
          // map tile - do nothing
          break;
        case PREFIX + "submit/available":
          wfes.currentPage = wfes.WF_PAGES.SUBMIT;
          wfes.submitAvailable = json.result;
          globalWindow.dispatchEvent(new Event("WFESSubmitAvailable"));
          globalWindow.dispatchEvent(new Event("WFESPageLoaded"));
          break;
        default:
        // messages?language=de
          if (PREFIX + "messages?language=" === url.substr(0, 18 + PREFIX.length)) {
            lang = url.substr(18 + PREFIX.length);
            wfes.messages[lang] = json.result;
          } else if (url.startsWith(PREFIX + "mapview")) {
            wfes.currentPage = wfes.WF_PAGES.MAP;
            if (url.startsWith(PREFIX + "mapview/lowzoom/gcs?")) {
              wfes.mapData = json.result;
              globalWindow.dispatchEvent(new Event("WFESMapLowzoomLoaded"));
              globalWindow.dispatchEvent(new Event("WFESMapLoaded"));
            } else if (url.startsWith(PREFIX + "mapview/gcs?")) {
              wfes.mapData = json.result;
              globalWindow.dispatchEvent(new Event("WFESMapFullLoaded"));
              globalWindow.dispatchEvent(new Event("WFESMapLoaded"));
            } else if (url.startsWith(PREFIX + "mapview/poi-images?")) {
              wfes.poiImages = json.result;
              globalWindow.dispatchEvent(new Event("WFESMapPoiImagesLoaded"));
            } else if (url.startsWith(PREFIX + "mapview/poi-details?")) {
              wfes.poiDetails = json.result;
              globalWindow.dispatchEvent(new Event("WFESMapPoiDetailsLoaded"));
            } else {
              console.log("WFES Base - unhandled map ", url);
            }
          } else if (url.startsWith(PREFIX + "live-pois-in-radius")) {
            wfes.livePois = json.result;
            globalWindow.dispatchEvent(new Event("WFESMapLivePoisInRadius"));
          } else if(url.startsWith(PREFIX + "manage/detail")) {
            wfes.currentPage = wfes.WF_PAGES.MANAGE_DETAIL;
            // nomination detail
            wfes.nominations.detail = json.result;
            // save nomination Details in Sessionstorage
            globalWindow.wfes.f.sessionGet(sStoreNominationsDetails, {}).then((nominationDict)=>{
              nominationDict[wfes.nominations.detail.id] = wfes.nominations.detail;
              globalWindow.wfes.f.sessionSave(sStoreNominationsDetails, nominationDict).then(()=>{
                globalWindow.dispatchEvent(new Event("WFESNominationDetailLoaded"));
                globalWindow.dispatchEvent(new Event("WFESNominationDetailLoaded"+json.result.type));
              });
            });
          } else if (url.startsWith(PREFIX + "submit/get/drafts")) {
            wfes.drafts = json.result;
            globalWindow.dispatchEvent(new Event("WFESGetDrafts"));
          } else {
            logger.debug("WFES Base - unhandled URL: ", url);
          }
          break;
      }

    } catch (e) {
      logger.warn( "WFES: failed to parse response from server", e);
    }
  }
  /* ================ / handle fetch data ================ */


  /* ================ overwrite fetch ================ */
  // AI notice: Gemini
  const fetchOrig = window.fetch;

  window.fetch = async function(input, init) {
    // Ermittle die URL (fetch akzeptiert Request-Objekte oder Strings)
    const url = "string" === typeof input ? input : input.url;

    // Prüfen, ob die URL mit dem PREFIX übereinstimmt
    if (url && url.startsWith(PREFIX)) {
      // Führe den originalen fetch-Aufruf aus
      const response = await fetchOrig.apply(this, arguments);

      // Wichtig: Response klonen, da der Body sonst für die Webseite blockiert ist
      const responseClone = response.clone();

      // Hier wird die asynchrone Verarbeitung gestartet, ohne auf das Ende zu warten
      (async() => {
        try {
          const json = await responseClone.json();
          handleFetchData(url, json); // Dein bestehender Code bleibt unverändert
        } catch (err) {
          console.error("Fehler beim Parsen des JSON:", err);
        }
      })();

      return response;
    }

    // Alle anderen URLs normal durchwinken
    return fetchOrig.apply(this, arguments);
  };
  /* ================ /overwrite fetch =============== */

  /* ================ overwrite XHR ================ */
  const openOrig = globalWindow.XMLHttpRequest.prototype.open, sendOrig = globalWindow.XMLHttpRequest.prototype.send;


  function handleLoadEvent(e) {
    try {

      logger.debug(handleLoadEvent);

      const response = this.response;

      logger.custom()
        .blue()
        .bgYellow()
        .text("response")
        .print();

      const json = JSON.parse(response);
      // ignore captcha
      if (json.captcha) {
        return;
      }
      if ("OK" !== json.code) {
        console.warn("WFES: got no OK from server", response);
        return;
      }
      if (json.result) {
        checkWfVersion(json.version);
      } else {
        console.warn("WFES: got no result from server");
        return;
      }

      let lang;
      switch (this._url) {
        case PREFIX + "home":
          wfes.currentPage = wfes.WF_PAGES.HOME;
          wfes.showcase.list = json.result.showcase;
          globalWindow.dispatchEvent(new Event("WFESHomePageLoaded"));
          globalWindow.dispatchEvent(new Event("WFESPageLoaded"));
          break;
        case PREFIX + "review":
          wfes.currentPage = wfes.WF_PAGES.REVIEW;
          if ("GET" === this._method) {
            handleReviewData(json.result);
          }
          break;
        case PREFIX + "loginconfig":
          wfes.currentPage = wfes.WF_PAGES.STARTPAGE;
          _isLoggedIn = false;
          wfes.loginConfig = json.result;
          globalWindow.dispatchEvent(new Event("WFESStartpageLoaded"));
          break;
        case PREFIX + "profile":
          wfes.currentPage = wfes.WF_PAGES.PROFILE;
          wfes.profile = json.result;
          globalWindow.dispatchEvent(new Event("WFESProfileLoaded"));
          globalWindow.dispatchEvent(new Event("WFESPageLoaded"));
          break;
        case PREFIX + "manage":
          wfes.currentPage = wfes.WF_PAGES.MANAGE;
          // nomination list
          wfes.nominations.list = json.result.submissions; // .filter(obj => "NOMINATION" === obj.type).slice();
          wfes.nominations.canAppeal = json.result.canAppeal;
          globalWindow.dispatchEvent(new Event("WFESNominationListLoaded"));
          globalWindow.dispatchEvent(new Event("WFESPageLoaded"));
          break;
        case PREFIX + "manage/detail":
          wfes.currentPage = wfes.WF_PAGES.MANAGE_DETAIL;
          // nomination detail
          wfes.nominations.detail = json.result;
          // save nomination Details in Sessionstorage
          globalWindow.wfes.f.sessionGet(sStoreNominationsDetails, {}).then((nominationDict)=>{
            nominationDict[wfes.nominations.detail.id] = wfes.nominations.detail;
            globalWindow.wfes.f.sessionSave(sStoreNominationsDetails, nominationDict).then(()=>{
              globalWindow.dispatchEvent(new Event("WFESNominationDetailLoaded"));
              globalWindow.dispatchEvent(new Event("WFESNominationDetailLoaded"+json.result.type));
            });
          });
          break;
        case PREFIX + "properties":
          wfes.currentPage = wfes.WF_PAGES.PROPERTIES;
          wfes.properties = json.result;
          globalWindow.dispatchEvent(new Event("WFESPropertiesLoaded"));
          break;
        case PREFIX + "settings":
          wfes.currentPage = wfes.WF_PAGES.SETTINGS;
          wfes.settings = json.result;
          globalWindow.dispatchEvent(new Event("WFESSettingsLoaded"));
          globalWindow.dispatchEvent(new Event("WFESPageLoaded"));
          break;
        case PREFIX + "help":
          wfes.currentPage = wfes.WF_PAGES.HELP;
          globalWindow.dispatchEvent(new Event("WFESHelpPageLoaded"));
          globalWindow.dispatchEvent(new Event("WFESPageLoaded"));
          break;
        case PREFIX + "mapview/track/access":
          // has no result - do nothing
          break;
        case PREFIX + "mapview/track/zoom-range-entered":
          // has no result - do nothing
          break;
        case PREFIX + "static-map-url":
          // map tile - do nothing
          break;
        case PREFIX + "submit/available":
          wfes.currentPage = wfes.WF_PAGES.SUBMIT;
          wfes.submitAvailable = json.result;
          globalWindow.dispatchEvent(new Event("WFESSubmitAvailable"));
          globalWindow.dispatchEvent(new Event("WFESPageLoaded"));
          break;
        default:
        // messages?language=de
          if (PREFIX + "messages?language=" === this._url.substr(0, 18 + PREFIX.length)) {
            lang = this._url.substr(18 + PREFIX.length);
            wfes.messages[lang] = json.result;
          } else if (this._url.startsWith(PREFIX + "mapview")) {
            wfes.currentPage = wfes.WF_PAGES.MAP;
            if (this._url.startsWith(PREFIX + "mapview/lowzoom/gcs?")) {
              wfes.mapData = json.result;
              globalWindow.dispatchEvent(new Event("WFESMapLowzoomLoaded"));
              globalWindow.dispatchEvent(new Event("WFESMapLoaded"));
            } else if (this._url.startsWith(PREFIX + "mapview/gcs?")) {
              wfes.mapData = json.result;
              globalWindow.dispatchEvent(new Event("WFESMapFullLoaded"));
              globalWindow.dispatchEvent(new Event("WFESMapLoaded"));
            } else if (this._url.startsWith(PREFIX + "mapview/poi-images?")) {
              wfes.poiImages = json.result;
              globalWindow.dispatchEvent(new Event("WFESMapPoiImagesLoaded"));
            } else if (this._url.startsWith(PREFIX + "mapview/poi-details?")) {
              wfes.poiDetails = json.result;
              globalWindow.dispatchEvent(new Event("WFESMapPoiDetailsLoaded"));
            } else {
              console.log("WFES Base - unhandled map ", this._url);
            }
          } else if (this._url.startsWith(PREFIX + "live-pois-in-radius")) {
            wfes.livePois = json.result;
            globalWindow.dispatchEvent(new Event("WFESMapLivePoisInRadius"));
          } else if(this._url.startsWith(PREFIX + "manage/detail")) {
            wfes.currentPage = wfes.WF_PAGES.MANAGE_DETAIL;
            // nomination detail
            wfes.nominations.detail = json.result;
            // save nomination Details in Sessionstorage
            globalWindow.wfes.f.sessionGet(sStoreNominationsDetails, {}).then((nominationDict)=>{
              nominationDict[wfes.nominations.detail.id] = wfes.nominations.detail;
              globalWindow.wfes.f.sessionSave(sStoreNominationsDetails, nominationDict).then(()=>{
                globalWindow.dispatchEvent(new Event("WFESNominationDetailLoaded"));
                globalWindow.dispatchEvent(new Event("WFESNominationDetailLoaded"+json.result.type));
              });
            });
          } else if (this._url.startsWith(PREFIX + "submit/get/drafts")) {
            wfes.drafts = json.result;
            globalWindow.dispatchEvent(new Event("WFESGetDrafts"));
          } else {
            console.log("WFES Base - unhandled URL: ", this._url);
          }
          break;
      }
    } catch (e) {
      console.warn("WFES: failed to parse response from server");
      console.log(e);
    }
  }

  function openReplacement(method, url, async, user, password) {
    this._url = url;
    this._method = method;
    logger.debug( "WFES OPEN: ", method, url );
    if (PREFIX === this._url.substr(0, PREFIX.length)) {
      // handle only Wayfarer URLs
      this.addEventListener("load", handleLoadEvent);
    }
    return openOrig.apply(this, arguments);
  }

  function sendReplacement(daten) {
    let candidate, json;
    // handle only POST requests
    if ("POST" === this._method) {
      switch (this._url) {
        case PREFIX + "review":
          json = JSON.parse(daten);
          candidate = wfes.review.sessionHist[json.id];
          wfes.review.decision.candidate = candidate;
          wfes.review.decision.decision = json;
          globalWindow.dispatchEvent(new Event("WFESReviewDecisionSent"));
          break;
        case PREFIX + "review/skip":
          json = JSON.parse(daten);
          candidate = wfes.review.sessionHist[json.id];
          wfes.review.decision.candidate = candidate;
          json.skipped = true;
          wfes.review.decision.decision = json;
          globalWindow.dispatchEvent(new Event("WFESReviewDecisionSent"));
          break;
        case PREFIX + "manage/appeal":
          json = JSON.parse(daten);
          wfes.review.appeal = json;
          globalWindow.dispatchEvent(new Event("WFESReviewAppealSent"));
          break;
        default:
          break;
      }
    }
    return sendOrig.apply(this, arguments);
  }

  globalWindow.XMLHttpRequest.prototype.open = openReplacement;
  globalWindow.XMLHttpRequest.prototype.send = sendReplacement;
  /* ================ /overwrite XHR ================ */

  /* ================ showcase ====================== */
  function showCaseSwipe() {
    const myDetail = globalWindow.document.getElementsByTagName("app-showcase-item")[0].__ngContext__[29];
    wfes.showcase.current = myDetail;
    globalWindow.dispatchEvent(new Event("WFESShowCaseClick"));
  }

  function showCaseLoaded() {
    let touchstartX = 0;
    //      let touchstartY = 0;
    let touchendX = 0;
    //      let touchendY = 0;
    function handleGesture() {
      if (touchendX !== touchstartX) {
        // swipe horizontally
        setTimeout(showCaseSwipe(), 100);
      }
    }

    wfes.showcase.current = wfes.showcase.list[0];
    const buttons = globalWindow.document.getElementsByClassName("wf-button showcase-gallery__button wf-button--icon ng-star-inserted");
    for (let i=0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", () => setTimeout(()=>{
        const myDetail = globalWindow.document.getElementsByTagName("app-showcase-item")[0].__ngContext__[29];
        wfes.showcase.current = myDetail;
        globalWindow.dispatchEvent(new Event("WFESShowCaseClick"));
      }, 100));
    }
    if (_isMobile) {
      _waitForElem("app-showcase-gallery").then((elem) => {
        elem.addEventListener("touchstart", function(event) {
          touchstartX = event.changedTouches[0].screenX;
          //          touchstartY = event.changedTouches[0].screenY;
        }, false);
        elem.addEventListener("touchend", function(event) {
          touchendX = event.changedTouches[0].screenX;
          //          touchendY = event.changedTouches[0].screenY;
          handleGesture();
        }, false);
      })
        .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
    }
  }

  globalWindow.addEventListener("WFESHomePageLoaded", () => {setTimeout(showCaseLoaded, 250);});
  /* ================ /showcase ===================== */

  /* ================ nomination page =============== */
  function loadCachedNomination(nomItem) {
    if (undefined === wfes.nominations.detail) {
      globalWindow.setTimeout(loadCachedNomination, 250, nomItem);
      return;
    }
    const myID = nomItem.__ngContext__[22].id;
    if (myID === wfes.nominations.detail.id) {
      // already loaded, do nothing
      return;
    }
    globalWindow.wfes.f.sessionGet(sStoreNominationsDetails, {}).then((nominationDict)=>{
      const nomDetail = nominationDict[myID];
      if (undefined === nomDetail) {
        // nothing there, ignore
        return;
      }
      // set cached values
      wfes.nominations.detail = nomDetail;
      globalWindow.dispatchEvent(new Event("WFESNominationDetailLoaded"));
    });
  }
  function nominationsClickHander(elem) {
    const nomItem = elem.target.closest("app-submissions-list-item");
    if (nomItem) {
      globalWindow.setTimeout(loadCachedNomination, 250, nomItem);
    } else {
      console.warn(GM_info.script.name, ": app-submissions-list-item missing");
    }
  }
  function addNominationsClickHandler() {
    const nomList = document.getElementsByTagName("app-submissions-list")[0];
    if (nomList) {
      nomList.addEventListener("click", nominationsClickHander);
    } else {
      console.warn(GM_info.script.name, ": app-submissions-list missing");
    }
  }
  globalWindow.addEventListener("WFESNominationListLoaded", addNominationsClickHandler);
  /* ================ /nomination page ============== */

  /* ================ basic functions =============== */
  // save data in "localstorage"
  globalWindow.wfes.f.localSave = (name, content) => new Promise((resolve, reject) => {
    getUserId().then((userId) => {
      // console.log(GM_info.script.name, "localSave:", userId, name, content);
      const index = name+"_"+userId;
      const data = {index: index, data:content};
      getIDBInstance().then(db => {
        const tx = db.transaction([idbLocalStorageCompat], "readwrite");
        tx.oncomplete = event => { db.close(); resolve(); };
        tx.onerror = reject;
        const objectStore = tx.objectStore(idbLocalStorageCompat);
        objectStore.put(data);
        tx.commit();
      })
        .catch(reject);
    })
      .catch(()=>{
        console.warn(GM_info.script.name, "no userID - save rejected");
        reject();
      }
      );
  });

  // get data from "localstorage"
  globalWindow.wfes.f.iDBGetLScompat = (name, content = "") => new Promise((resolve, reject) => {
    getUserId().then((userId) => {
      // console.log(GM_info.script.name, "iDBGetLScompat:", userId, name);
      const index = name+"_"+userId;
      getIDBInstance().then(db => {
        const tx = db.transaction([idbLocalStorageCompat], "readonly");
        tx.oncomplete = ( event ) => {db.close();};
        tx.onerror = ( event ) => {console.log("transaction error:", event);};
        const objectStore = tx.objectStore(idbLocalStorageCompat);
        const request = objectStore.get(index);
        request.onsuccess = () => {
          if (request.result) {
            resolve(request.result.data);
          } else {
            resolve(content);
          }
        };
        request.onerror = (event) => {
          console.log("error retrieving data:", event);
          resolve(undefined);
        };
      });
    });
  });

  // save data in localstorage
  globalWindow.wfes.f.localStorageSave = (name, content) => new Promise((resolve, reject) => {
    getUserId().then((userId) => {
      const json = JSON.stringify(content);
      localStorage.setItem(name+"_"+userId, json);
      resolve();
    });
  });

  // get data from localstorage
  globalWindow.wfes.f.localStorageGet = (name, content = "") => new Promise((resolve, reject) => {
    getUserId().then((userId) => {
      const data = JSON.parse(localStorage.getItem(name+"_"+userId)) || JSON.parse(localStorage.getItem(name)) || content;
      resolve(data);
    });
  });

  // remove data from localstorage
  globalWindow.wfes.f.localStorageRemove = (name) => new Promise((resolve, reject) => {
    getUserId().then((userId) => {
      localStorage.removeItem(name+"_"+userId);
      resolve();
    });
  });

  // get data from IDB or localstorage
  globalWindow.wfes.f.localGet = (name, content = "") => new Promise((resolve, reject) => {
    globalWindow.wfes.f.iDBGetLScompat(name, content)
      .then(data => {
        if ((data !== content)&&(undefined !== data)) { // got something
          resolve(data);
        } else {
          globalWindow.wfes.f.localStorageGet(name, content)
            .then((data) => {
              // jetzt in IDB speichern
              globalWindow.wfes.f.localSave(name, data)
                .then(()=>{
                  getUserId().then((userId) => {
                    if (tmpUserId !== userId) {
                      // wenn in IDB gespeichert und eine gültige userID da ist: löschen
                      globalWindow.wfes.f.localStorageRemove(name);
                    }
                  });
                });
              resolve(data);
            });
        }
      });
  });

  // save data in sessionstorage
  globalWindow.wfes.f.sessionSave = (name, content) => new Promise((resolve, reject) => {
    getUserId().then((userId) => {
      const json = JSON.stringify(content);
      sessionStorage.setItem(name+"_"+userId, json);
      resolve();
    });
  });

  // gete data from sessionstorage
  globalWindow.wfes.f.sessionGet = (name, content = "") => new Promise((resolve, reject) => {
    getUserId().then((userId) => {
      const data = JSON.parse(sessionStorage.getItem(name+"_"+userId)) || content;
      resolve(data);
    });
  });

  // add CSS to the head, if not there
  globalWindow.wfes.f.addCSS = function(myID, styles) {
    if ("string"===typeof(myID) && myID.length>0) {
      // already there?
      if (null === document.getElementById(myID)) {
        _waitForElem("head").then( headElem => {
          const customStyleElem = document.createElement("style");
          customStyleElem.setAttribute("id", myID);
          customStyleElem.appendChild(document.createTextNode(styles));
          headElem.appendChild(customStyleElem);
        }
        );
      }
    } else {
      console.error(GM_info.script.name, " addCSS() error: need ID to be defined");
    }
  };

  // Useful to make comparing easier. Essentially this function iterates over
  // all items and uses it's unique ID as key and stores relevant values under
  // that key. This way on checking we can simply find the ID when looking at
  // a current item
  globalWindow.wfes.f.makeIDbasedDictionary = function(itemList) {
    const dict = {};
    let item;
    for (let i = 0; i < itemList.length; i++) {
      item = itemList[i];
      dict[item.id] = item;
    }
    return dict;
  };

  globalWindow.wfes.f.hasUserId = function() {
    return wfes.userId;
  };

  globalWindow.wfes.f.hasMinVersion = function(version = "1.0.0") {
    return version <= GM_info.script.version;
  };

  globalWindow.wfes.f.createNotificationArea = function() {
    const myID = "wfesNotify";
    if ( null === document.getElementById(myID)) {
      const container = document.createElement("div");
      container.id = myID;
      _waitForElem("body").then(body => {
        body.appendChild(container);
      });
    }
  };

  globalWindow.wfes.f.createNotification = function(message = "no message", color = "green", callbackConfig = null) {
    const notification = document.createElement("div");
    switch (color) {
      case "red":
        notification.setAttribute("class", "wfesNotification wfesBgRed");
        break;
      case "orange":
        notification.setAttribute("class", "wfesNotification wfesBgOrange");
        break;
      case "blue":
        notification.setAttribute("class", "wfesNotification wfesBgBlue");
        break;
      case "fuchsia":
        notification.setAttribute("class", "wfesNotification wfesBgFuchsia");
        break;
      default:
        notification.setAttribute("class", "wfesNotification wfesBgGreen");
        break;
    }

    const notificationContent = document.createElement("div");
    notificationContent.setAttribute("class", "wfesNotificationContent");

    if ("string" === typeof message) {
      const content = document.createElement("p");
      content.textContent = message;
      notificationContent.appendChild(content);
    } else if (Array.isArray(message)) {
      const textGroup = document.createElement("div");
      textGroup.setAttribute("class", "wfesTextGroup");
      message.forEach(item => {
        if ("string" === typeof item) {
          const content = document.createElement("p");
          content.textContent = item;
          textGroup.appendChild(content);
        } else {
          console.warn("Ungültiges Element in der Nachrichtenliste: ", item);
        }
      });
      notificationContent.appendChild(textGroup);
    } else {
      console.error("Ungültiger Nachrichtentyp: Muss ein String oder ein Array von Strings sein.");
      return;
    }


    const buttonGroup = document.createElement("div");
    buttonGroup.setAttribute("class", "wfesButtonGroup");

    // Schließen-Button
    const closeButton = document.createElement("button");
    closeButton.setAttribute("class", "wfesNotiButton material-icons");
    closeButton.innerText = "close";
    closeButton.onclick = function() {
      notification.remove();
    };

    // Handle Callbacks - Buttons, autoclose...
    if (callbackConfig) {
      // do we have a callback function?
      if ("function" === typeof callbackConfig.callback) {
        const actionButton = document.createElement("button");
        actionButton.setAttribute("class", "wfesNotiButton material-icons");

        let actionIcon;
        switch (callbackConfig.icon) {
          case "play":
            actionIcon = "play_circle_outline";
            break;
          case "search":
            actionIcon = "search";
            break;
          case "renew":
            actionIcon="autorenew";
            break;
          default:
            actionIcon = "play_circle";
        }

        actionButton.innerText = actionIcon;

        actionButton.onclick = function(event) {
          event.stopPropagation(); // Verhindert, dass der Klick das notification-Element erreicht
          callbackConfig.callback(...(callbackConfig.params || [])); // Ruft die Callback-Funktion mit den übergebenen Parametern auf
        };
        buttonGroup.appendChild(actionButton);
      }
      // autoclose this notification?
      if (callbackConfig.autoclose && (callbackConfig.autoclose > 0)) {
        // setTimeout is MilliSeconds
        setTimeout(()=>{notification.remove();}, 1000*callbackConfig.autoclose);
      }
    }

    buttonGroup.appendChild(closeButton);

    notificationContent.appendChild(buttonGroup);

    notification.appendChild(notificationContent);

    notification.onclick = function() {
      notification.remove();
    };

    if (!document.getElementById("wfesNotify")) {
      globalWindow.wfes.f.createNotificationArea();
    }
    document.getElementById("wfesNotify").appendChild(notification);
  };

  globalWindow.wfes.f.exportIDB = async function(userId) {
    const db = await getIDBInstance();

    return new Promise((resolve, reject) => {
      const result = [];
      const tx = db.transaction([idbLocalStorageCompat], "readonly");
      const store = tx.objectStore(idbLocalStorageCompat);

      const request = store.openCursor();
      request.onerror = reject;
      request.onsuccess = (event) => {
        const cursor = event.target.result;

        if (!cursor) {
          db.close();
          resolve(result);
          return;
        }

        if (cursor.key.endsWith("_" + userId)) {
          result.push(cursor.value);
        }

        cursor.continue();
      };
    });

  };

  globalWindow.wfes.f.importIDB = async function(records) {
    const db = await getIDBInstance();

    return new Promise((resolve, reject) => {
      const tx = db.transaction([idbLocalStorageCompat], "readwrite");
      const store = tx.objectStore(idbLocalStorageCompat);

      for (const record of records) {
        store.put(record);
      }

      tx.oncomplete = () => {
        db.close();
        resolve();
        globalWindow.wfes.f.createNotification("import done");
      };

      tx.onerror = reject;
    });
  };

  globalWindow.wfes.f.isPage = function(...pages) {
    return pages.includes(wfes.currentPage);
  };

  globalWindow.wfes.f.waitForElem = _waitForElem;
  /* ================ /basic functions=============== */

  /* ================ getter ======================== */
  globalWindow.wfes.g.baseVersion = function() {
    return GM_info.script.version;
  };
  globalWindow.wfes.g.canAppeal = function() {
    return jCopy(wfes.nominations.canAppeal);
  };
  globalWindow.wfes.g.curentPage = function() {
    return jCopy(wfes.currentPage);
  };
  globalWindow.wfes.g.drafts = function() {
    return jCopy(wfes.drafts);
  };
  globalWindow.wfes.g.edit = function() {
    return jCopy(wfes.edit);
  };
  globalWindow.wfes.g.isMobile = function() {
    return _isMobile;
  };
  globalWindow.wfes.g.isLoggedIn = function() {
    return _isLoggedIn;
  };
  globalWindow.wfes.g.loginConfig = function() {
    return jCopy(wfes.loginConfig);
  };
  globalWindow.wfes.g.messages = function() {
    return jCopy(wfes.messages);
  };
  globalWindow.wfes.g.nominationDetail = function() {
    return jCopy(wfes.nominations.detail);
  };
  globalWindow.wfes.g.nominationsList = function() {
    return jCopy(wfes.nominations.list);
  };
  globalWindow.wfes.g.profile = function() {
    return jCopy(wfes.profile);
  };
  globalWindow.wfes.g.properties = function() {
    return jCopy(wfes.properties);
  };
  globalWindow.wfes.g.reviewAppeal = function() {
    return jCopy(wfes.review.appeal);
  };
  globalWindow.wfes.g.reviewDecision = function() {
    return jCopy(wfes.review.decision);
  };
  globalWindow.wfes.g.reviewPageData = function() {
    return jCopy(wfes.review.pageData);
  };
  globalWindow.wfes.g.settings = function() {
    return jCopy(wfes.settings);
  };
  globalWindow.wfes.g.showcase = function() {
    return jCopy(wfes.showcase);
  };
  globalWindow.wfes.g.mapData = function() {
    return jCopy(wfes.mapData);
  };
  globalWindow.wfes.g.livePois = function() {
    return jCopy(wfes.livePois);
  };
  globalWindow.wfes.g.poiDetails = function() {
    return jCopy(wfes.poiDetails);
  };
  globalWindow.wfes.g.poiImages = function() {
    return jCopy(wfes.poiImages);
  };
  globalWindow.wfes.g.submitAvailable = function() {
    return jCopy(wfes.submitAvailable);
  };
  globalWindow.wfes.g.userId = new Promise((resolve, reject) => {
    getUserId().then((userID) => {
      resolve(userID);
    })
      .catch( () => {
        console.warn("%c" + GM_info.script.name + " keine Userid gefunden, nutze temp", "background-color: red;color: yellow");
        resolve(tmpUserId);
      });
  });
  globalWindow.wfes.g.wfPages = function() {
    return jCopy(wfes.WF_PAGES);
  };
  globalWindow.wfes.g.wfVersion = function() {
    return jCopy(wfes.version);
  };
  /* ================ /getter ======================= */

  /* ================ setter ======================== */
  globalWindow.wfes.s.callback = function(what, func) {
    switch (what) {
      case "showcaseclick":
        globalWindow.addEventListener("showcaseclick", func);
        break;
    }
  };
  /* ================ /setter ======================= */

  // make objects immutable
  Object.freeze(globalWindow.wfes.f);
  Object.freeze(globalWindow.wfes.g);
  Object.freeze(globalWindow.wfes.s);
  Object.freeze(globalWindow.wfes);

  if (document.location.pathname !== loginPath ) {
    globalWindow.wfes.f.addCSS(myCssId, myStyle);
    globalWindow.wfes.f.createNotificationArea();
  }

  /* we are done :-) */
  logger.info("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
