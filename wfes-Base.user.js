// ==UserScript==
// @name           WFES - Base
// @version        1.3.4
// @description    basic functionality for WFES
// @author         AlterTobi
// @run-at         document-start
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-Base.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-Base.meta.js
// @match          https://wayfarer.nianticlabs.com/*
// @grant          none
// ==/UserScript==

/* eslint no-unused-vars: ["error", { "args": "none" }] */

(function() {
  "use strict";

  /* WFES data structures */
  const PREFIX = "/api/v1/vault/";
  const sStoreReview = "wfes_Reviews";
  const sStoreNominationsDetails = "wfes_nominationDetails";

  const wfes = {};
  wfes.showcase = {};
  wfes.review = {};
  wfes.review.decision = {};
  wfes.review.appeal = {};
  wfes.profile = {};
  wfes.nominations = {};
  wfes.edit = {};
  wfes.properties = {};
  wfes.messages = {};
  wfes.version = "0.0.0";
  wfes.userId = false;
  const tmpUserId = "temporaryUserId";
  let propsLoaded = false;

  window.wfes = {};
  window.wfes.f = window.wfes.g = window.wfes.s = {}; // functions, getter, setter

  /* =========== helper ============================= */
  function checkWfVersion(v) {
    if (wfes.version !== v) {
      console.log("WF version changed from", wfes.version, "to", v);
      wfes.version = v;
      window.dispatchEvent(new Event("WFESVersionChanged"));
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
    } catch(e) {
      console.error(GM_info.script.name, ": userprofile does not contain email");
    }
  }
  window.addEventListener("WFESPropertiesLoaded", setUserId);

  // sometimes (i.e. when pressing F5) properties are not (re-)loaded by WF
  function _getPropsOnce() {
    if (false === propsLoaded) {
      if ( null !== window.document.querySelector("body > app-root > app-wayfarer")) {
        // make sure, application is loaded, login is: window.document.querySelector('body > app-root > app-login')
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
        resolve(tmpUserId);
        _getPropsOnce();
      } else if (wfes.userId) {
        resolve(wfes.userId);
      } else {
        setTimeout(() => checkUID(tries + 1), 200);
      }
    };
    checkUID(1);
  });

  // aufräumen
  function garbageCollection(propNew, propOld) {
    // remove old entries, if new ones exist
    if (Object.prototype.hasOwnProperty.call(localStorage, propNew)) {
      if(Object.prototype.hasOwnProperty.call(localStorage, propOld)) {
        localStorage.removeItem(propOld);
      }
    }

  }

  /* ================ overwrite XHR ================ */
  const openOrig = window.XMLHttpRequest.prototype.open, sendOrig = window.XMLHttpRequest.prototype.send;

  /* handle data */
  function handleReviewData(result) {
    // save review data in ...pagedata and sessionstore
    window.wfes.f.sessionGet(sStoreReview, [] ).then((reviewSessionHist)=>{
      wfes.review.sessionHist = window.wfes.f.makeIDbasedDictionary(reviewSessionHist);
      if (undefined === wfes.review.sessionHist[result.id]) {
        reviewSessionHist.push(result);
        window.wfes.f.sessionSave(sStoreReview, reviewSessionHist);
        wfes.review.sessionHist[result.id] = result;
      }
    });
    wfes.edit.isEdit = false;

    wfes.review.pageData = result;
    switch (wfes.review.pageData.type) {
    case "NEW":
      window.dispatchEvent(new Event("WFESReviewPageNewLoaded"));
      break;
    case "EDIT":
      wfes.edit.isEdit = true;
      wfes.edit.what = {};
      wfes.edit.what.location = result.locationEdits.length > 1;
      wfes.edit.what.description = result.descriptionEdits.length > 0;
      wfes.edit.what.title = result.titleEdits.length > 0;
      window.dispatchEvent(new Event("WFESReviewPageEditLoaded"));
      break;
    case "PHOTO":
      window.dispatchEvent(new Event("WFESReviewPagePhotoLoaded"));
      break;
    }
    window.dispatchEvent(new Event("WFESReviewPageLoaded"));
  }

  function handleLoadEvent(e) {
    try {
      const response = this.response;
      const json = JSON.parse(response) || console
        .warn("WFES: failed to parse response from server");
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
        wfes.showcase.list = json.result.showcase;
        window.dispatchEvent(new Event("WFESHomePageLoaded"));
        break;
      case PREFIX + "review":
        if ("GET" === this._method) {
          handleReviewData(json.result);
        }
        break;
      case PREFIX + "profile":
        wfes.profile = json.result;
        window.dispatchEvent(new Event("WFESProfileLoaded"));
        break;
      case PREFIX + "manage":
        // nomination list
        wfes.nominations.list = json.result.nominations;
        wfes.nominations.canAppeal = json.result.canAppeal;
        wfes.nominations.wayspots = json.result.wayspots;
        window.dispatchEvent(new Event("WFESNominationListLoaded"));
        break;
      case PREFIX + "manage/detail":
        // nomination detail
        wfes.nominations.detail = json.result;
        // save nomination Details in Sessionstorage
        window.wfes.f.sessionGet(sStoreNominationsDetails, {}).then((nominationDict)=>{
          nominationDict[wfes.nominations.detail.id] = wfes.nominations.detail;
          window.wfes.f.sessionSave(sStoreNominationsDetails, nominationDict).then(()=>{
            window.dispatchEvent(new Event("WFESNominationDetailLoaded"));
          });
        });
        break;
      case PREFIX + "properties":
        wfes.properties = json.result;
        window.dispatchEvent(new Event("WFESPropertiesLoaded"));
        break;
      default:
        // messages?language=de
        if (PREFIX + "messages?language=" === this._url.substr(0, 18 + PREFIX.length)) {
          lang = this._url.substr(18 + PREFIX.length);
          wfes.messages[lang] = json.result;
        } else {
          // console.log('WFES Base - unhandled URL: ',
          // this._url);
        }
        break;
      }
    } catch (e) {
      console.warn(e);
    }
  }

  function openReplacement(method, url, async, user, password) {
    this._url = url;
    this._method = method;
    // console.log( "WFES OPEN: ", method, url );
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
        window.dispatchEvent(new Event("WFESReviewDecisionSent"));
        break;
      case PREFIX + "review/skip":
        json = JSON.parse(daten);
        candidate = wfes.review.sessionHist[json.id];
        wfes.review.decision.candidate = candidate;
        json.skipped = true;
        wfes.review.decision.decision = json;
        window.dispatchEvent(new Event("WFESReviewDecisionSent"));
        break;
      case PREFIX + "manage/appeal":
        json = JSON.parse(daten);
        wfes.review.appeal = json;
        window.dispatchEvent(new Event("WFESReviewAppealSent"));
        break;
      default:
        break;
      }
    }
    return sendOrig.apply(this, arguments);
  }

  window.XMLHttpRequest.prototype.open = openReplacement;
  window.XMLHttpRequest.prototype.send = sendReplacement;

  /* ================ /overwrite XHR ================ */

  /* ================ showcase ====================== */
  function showCaseLoaded() {
    wfes.showcase.current = wfes.showcase.list[0];
    const buttons = window.document.getElementsByClassName("wf-button showcase-gallery__button wf-button--icon ng-star-inserted");
    for (let i=0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", () => setTimeout(()=>{
        const myDetail = window.document.getElementsByTagName("app-showcase-item")[0].__ngContext__[29];
        wfes.showcase.current = myDetail;
        window.dispatchEvent(new Event("WFESShowCaseClick"));
      }, 100));
    }
  }

  window.addEventListener("WFESHomePageLoaded", () => {setTimeout(showCaseLoaded, 250);});
  /* ================ /showcase ===================== */

  /* ================ nomination page =============== */
  function loadCachedNomination(nomItem) {
    if (undefined === wfes.nominations.detail) {
      window.setTimeout(loadCachedNomination, 250, nomItem);
    }
    const myID = nomItem.__ngContext__[22].id;
    if (myID === wfes.nominations.detail.id) {
      // already loaded, do nothing
      return;
    }
    window.wfes.f.sessionGet(sStoreNominationsDetails, {}).then((nominationDict)=>{
      const nomDetail = nominationDict[myID];
      if (undefined === nomDetail) {
        // nothing there, ignore
        return;
      }
      // set cached values
      wfes.nominations.detail = nomDetail;
      window.dispatchEvent(new Event("WFESNominationDetailLoaded"));
    });
  }
  function nominationsClickHander(elem) {
    const nomItem = elem.target.closest("app-nominations-list-item");
    window.setTimeout(loadCachedNomination, 250, nomItem);
  }
  function addNominationsClickHandler() {
    const nomList = document.getElementsByTagName("app-nominations-list")[0];
    nomList.addEventListener("click", nominationsClickHander);
  }
  window.addEventListener("WFESNominationListLoaded", addNominationsClickHandler);
  /* ================ /nomination page ============== */

  /* ================ basic functions =============== */
  // save data in localstorage
  window.wfes.f.localSave = (name, content) => new Promise((resolve, reject) => {
    getUserId().then((userId) => {
      const json = JSON.stringify(content);
      localStorage.setItem(name+"_"+userId, json);
      if(tmpUserId !== userId) {
        garbageCollection(name+"_"+userId, name);
      }
      resolve();
    });
  });

  // save data in sessionstorage
  window.wfes.f.sessionSave = (name, content) => new Promise((resolve, reject) => {
    getUserId().then((userId) => {
      const json = JSON.stringify(content);
      sessionStorage.setItem(name+"_"+userId, json);
      resolve();
    });
  });

  // get data from localstorage
  window.wfes.f.localGet = (name, content = "") => new Promise((resolve, reject) => {
    getUserId().then((userId) => {
      const data = JSON.parse(localStorage.getItem(name+"_"+userId)) || JSON.parse(localStorage.getItem(name)) || content;
      resolve(data);
    });
  });
  // gete data from sessionstorage
  window.wfes.f.sessionGet = (name, content = "") => new Promise((resolve, reject) => {
    getUserId().then((userId) => {
      const data = JSON.parse(sessionStorage.getItem(name+"_"+userId)) || content;
      resolve(data);
    });
  });

  // add CSS to the head, if not there
  window.wfes.f.addCSS = function(myID, styles) {
    // already there?
    if (null === document.getElementById(myID)) {
      const headElem = document.getElementsByTagName("HEAD")[0];
      const customStyleElem = document.createElement("style");
      customStyleElem.setAttribute("id", myID);
      customStyleElem.innerText = styles;
      headElem.appendChild(customStyleElem);
    }
  };

  // Useful to make comparing easier. Essentially this function iterates over
  // all items and uses it's unique ID as key and stores relevant values under
  // that key. This way on checking we can simply find the ID when looking at
  // a current item
  window.wfes.f.makeIDbasedDictionary = function(itemList) {
    const dict = {};
    let item;
    for (let i = 0; i < itemList.length; i++) {
      item = itemList[i];
      dict[item.id] = item;
    }
    return dict;
  };

  window.wfes.f.hasUserId = function() {
    return wfes.userId;
  };

  /* ================ /basic functions=============== */
  /* ================ getter ======================== */
  window.wfes.g.wfVersion = function() {
    return jCopy(wfes.version);
  };
  window.wfes.g.showcase = function() {
    return jCopy(wfes.showcase);
  };
  window.wfes.g.profile = function() {
    return jCopy(wfes.profile);
  };
  window.wfes.g.nominationsList = function() {
    return jCopy(wfes.nominations.list);
  };
  window.wfes.g.nominationDetail = function() {
    return jCopy(wfes.nominations.detail);
  };
  window.wfes.g.canAppeal = function() {
    return jCopy(wfes.nominations.canAppeal);
  };
  window.wfes.g.reviewPageData = function() {
    return jCopy(wfes.review.pageData);
  };
  window.wfes.g.reviewDecision = function() {
    return jCopy(wfes.review.decision);
  };
  window.wfes.g.reviewAppeal = function() {
    return jCopy(wfes.review.appeal);
  };
  window.wfes.g.edit = function() {
    return jCopy(wfes.edit);
  };
  window.wfes.g.properties = function() {
    return jCopy(wfes.properties);
  };
  window.wfes.g.messages = function() {
    return jCopy(wfes.messages);
  };
  window.wfes.g.userId = new Promise((resolve, reject) => {
    getUserId().then((userID) => {
      resolve(userID);
    });
  });
  /* ================ /getter ======================= */
  /* ================ setter ======================== */
  window.wfes.s.callback = function(what, func) {
    switch (what) {
    case "showcaseclick":
      window.addEventListener("showcaseclick", func);
      break;
    }
  };
  /* ================ /setter ======================= */

  // make objects immutable
  Object.freeze(window.wfes.f);
  Object.freeze(window.wfes.g);
  Object.freeze(window.wfes.s);
  Object.freeze(window.wfes);

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
