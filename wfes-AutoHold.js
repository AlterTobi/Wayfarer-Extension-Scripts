// @name         AutoHold
// @version      0.2.0
// @description  put nomination on HOLD when additional stament contains the text "#hold"
// @author       AlterTobi

/* eslint no-use-before-define: ["error", { "functions": false }] */

(function() {
  "use strict";

  const searchRegex = /#hold/;
  const idlist = [];
  const timeout = 2000;

  // used example from https://www.w3schools.com/js/js_cookies.asp
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
        // console.log(request.responseText);
        // prozess next
        window.setTimeout(_prozessNext, timeout);
      } else {
        window.wfes.f.createNotification("set hold failed, see console for details", "red");
        console.warn(request.statusText, request.responseText);
      }
    });
    request.send(postData);
  }

  function _prozessNext() {
    if (idlist.length > 0) {
      // have more?
      const o = idlist.pop();
      console.log(GM_info.script.name, "process ID:", o.id, "name", o.title);
      window.wfes.f.createNotification(`set hold: ${o.title}`, "orange");
      _setHold(o.id);
    }
  }

  function AutoHold() {
    console.log(GM_info.script.name, "starte AutoHold");
    const nomList = window.wfes.g.nominationsList();
    let nom;

    for (let i = 0; i < nomList.length; i++) {
      nom = nomList[i];
      // process all new / in queue
      if ("NOMINATED" === nom.status) {
        // serach for '#hold'
        if (nom.statement.toLocaleLowerCase().search(searchRegex) > -1) {
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

  window.addEventListener("WFESNominationListLoaded", AutoHold);

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
