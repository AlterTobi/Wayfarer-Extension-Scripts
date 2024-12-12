// @name         AutoHold
// @version      1.3.1
// @description  put nomination on HOLD when additional stament contains the text "#hold"
// @author       AlterTobi

/* eslint no-use-before-define: ["error", { "functions": false }]*/

(function() {
  "use strict";

  const searchRegex = /#hold|,yxcv|,zxcv|placeholder|Platzhalter/;
  const idlist = [];
  const timeout = 2500;

  // based on example from https://www.w3schools.com/js/js_cookies.asp
  function _getCookie(cname) {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (" " === c.charAt(0)) {
        c = c.substring(1);
      }
      if (0 === c.indexOf(name)) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  function _setHold(id) {
    // XHR -> HOLD
    const theUrl = "/api/v1/vault/manage/hold";
    const request = new XMLHttpRequest();
    const csrf = _getCookie("XSRF-TOKEN");

    const data = {};
    data.id = id;
    const postData = JSON.stringify(data);

    request.open("POST", theUrl, true);
    request.setRequestHeader("content-type", "application/json");
    request.setRequestHeader("accept", "application/json, text/plain, */*");
    request.setRequestHeader("x-angular", "");
    request.setRequestHeader("x-csrf-token", csrf);

    request.addEventListener("load", function() {
      if (request.status >= 200 && request.status < 300) {
        // prozess next
        window.setTimeout(_prozessNext, timeout);
      } else {
        window.wfes.f.createNotification("AutoHold failed, see console for details", "red");
        console.warn(request.statusText, request.responseText);
      }
    });
    request.send(postData);
  }

  function _reloadPage() {
    window.location.reload();
  }

  function _prozessNext() {
    if (idlist.length > 0) {
      // have more?
      const o = idlist.pop();
      window.wfes.f.createNotification(`AutoHold: ${o.title}`, "orange");
      _setHold(o.id);
    } else {
      window.wfes.f.createNotification("AutoHold: all nominations processed, click arrow to reload page", "green", { callback: _reloadPage, icon: "renew"});
    }
  }

  function autoHold() {
    const nomList = window.wfes.g.nominationsList();
    let nom;

    for (let i = 0; i < nomList.length; i++) {
      nom = nomList[i];
      // process all new / in queue - NOMINATION only
      if (("NOMINATION" === nom.type) && ("NOMINATED" === nom.status)) {
        // search for '#hold'
        if (nom.statement.toLowerCase().search(searchRegex) > -1) {
          const o = {};
          o.id = nom.id;
          o.title = nom.title;
          idlist.push(o);
        }
      }
    }
    if (idlist.length > 0) {
      // got some ;-)
      window.setTimeout(_prozessNext, timeout);
    }
  }

  if (window.wfes.f.hasMinVersion("2.3.0")) {
    window.addEventListener("WFESNominationListLoaded", autoHold);
  } else {
    console.warn(GM_info.script.name, "Need at least wfes-Base version 2.3.0. Please upgrade.");
  }

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
