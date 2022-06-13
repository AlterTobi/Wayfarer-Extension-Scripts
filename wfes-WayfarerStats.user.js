// ==UserScript==
// @name           WFES - Wayfarer Stats
// @version        1.2.0
// @description    save Wayfarer statistics in local browser storage
// @author         AlterTobi
// @TODO           .then(()=>{})
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-WayfarerStats.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-WayfarerStats.meta.js
// @match          https://wayfarer.nianticlabs.com/*
// @grant          none
// ==/UserScript==

(function() {
  "use strict";
  const selfname = "wfes_wayfarerStats";
  const maincount = 14;

  // define names
  const lStoreStats = selfname+"_Stats";
  const lStorePogo = selfname+"_PoGoCount";
  const lStoreCheck = selfname+"_IsChecked";
  const lStoreUpgrades = selfname+"_myUpgrades";

  const myCssId = "wayfarerStatsCSS";
  const myStyle = `
    th { text-align: center; }
    td, th { padding: 5px; }
    td { text-align: right; }
    table { margin-top: 10px; font-family: monospace
            background-color: #2d2d2d; width: 100%; }
    #reversebox { margin: 0 10px; }
    #buttonsdiv button { margin: 0 10px; }
    #buttonsdiv, #statsdiv, #gamesdiv { margin-bottom: 2em; }
    `;

  const WARN_POGO = `data:image/png;base64,
iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAMAAAAM7l6QAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJ
bWFnZVJlYWR5ccllPAAAAFFQTFRF//////8z/8yZ/8xm/5lm/2Zm/zMzzMzMzMyZzMxmzGZmzDMz
zDMAmczMmZnMmZmZmTMzmTMAZpnMZpmZZmZmZjMzM2ZmMzMzMwAAADMzAAAAQu3hzgAAAR1JREFU
eNqc09GSgyAMBdC0QRFRQ6mI8v8fuglQRrednZ3eR4656IBw+zPwb0ZEpRTiR0bVdb3ljKN5Z1XM
lgfwyth1DZ1zdlQXPunVoTTLcs+p7Fzth1yd0e17sHZ6PB55vrFU9zbEdUvJCYuXengNh00D6Fg8
11fmb+LmQxR02qepsDOVbQghReBovaWdEwLvrgqPxxG3GGWWuD0eiRNjGAubWUsr8SxQeoJeiNZ1
OyrfpRbWRFpTijpnnpenOTO7dBYjzjLUD8vvBDCvK9VJYV/5llkegJM+PVa+l/W2K2WmdiQnnpeq
3jRG+DXKSqfzvkOdbOovl0n81ZsVr3cNhRsO7xfZDDNvvXjvCT/+BmgGosHgV3/JF/wjwACvbhgT
fnV1HwAAAABJRU5ErkJggg==`;

  let PoGoStats, wfrStats, isChecked;
  let isInitialized = false;

  const body = document.getElementsByTagName("body")[0];
  const head = document.getElementsByTagName("head")[0];

  // init
  function init() {
    // get Values from localStorage
    window.wfes.f.localGet(lStorePogo, []).then((PS)=>{
      PoGoStats = PS;
      window.wfes.f.localGet(lStoreStats, []).then((wf)=>{
        wfrStats = wf;
        window.wfes.f.localGet(lStoreCheck, false).then((ic)=>{
          isChecked = ic;
          isInitialized = true;
        });
      });
    });
  }

  function YMDfromTime(time) {
    const curdate = new Date();
    curdate.setTime(time);

    const Jahr = curdate.getFullYear().toString(),
      Monat = ("0" + ( 1 + curdate.getMonth())).slice(-2),
      Tag = ("0" + curdate.getDate()).slice(-2);

    const ymd = Tag + "." + Monat + "." + Jahr;
    return ymd;
  }

  function upgrades() {
    /* die Upgrades zählen */
    console.log(selfname + " zähle Upgrades");
    const profile = window.wfes.g.profile();
    const progress = profile.progress;
    const total = profile.total;
    let lastProgress = 0;
    let lastTotal = 0;

    window.wfes.f.localGet(lStoreUpgrades, []).then((myWFRupgrades)=>{
      if (myWFRupgrades.length > 0) {
        lastProgress = myWFRupgrades[myWFRupgrades.length-1].progress;
        lastTotal = myWFRupgrades[myWFRupgrades.length-1].total;
      }

      if ((total !== lastTotal ) || (progress !== lastProgress)) {
        const ut = new Date().getTime();
        const curstats = {"datum":ut, "progress":progress, "total":total};
        myWFRupgrades.push(curstats);
        window.wfes.f.localSave(lStoreUpgrades, myWFRupgrades);
      }
    });
  }

  function wfrstats() {
    let heute, last, ut;

    // nur tun, wenn heute noch nicht und Stunde > 3
    const jetzt = new Date();
    const stunde = jetzt.getHours();

    if (stunde < 3) {
      heute = new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate()-1 );
    } else {
      heute = new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate() );
    }

    const heuteTS = heute.getTime();

    if (wfrStats.length > 0) {
      last = wfrStats[wfrStats.length-1].datum;
    } else {
      last = 0;
    }

    if (heuteTS > last) {
      console.log(selfname + " saving stats");

      const profile = window.wfes.g.profile();

      const reviewed = profile.finished;
      const accepted = profile.accepted;
      const rejected = profile.rejected;
      const duplicated = profile.duplicated;
      let curstats;

      if ( last > 0 ) {
        // nur wenn schon gespeicherte Werte vorhanden.
        const einTag = 25*60*60*1000; // milliseconds
        // 25hours because of DST

        const letzter = new Date();
        letzter.setTime(last);
        let letzterTS = new Date(letzter.getFullYear(), letzter.getMonth(), letzter.getDate()).getTime();

        while ( (heuteTS - letzterTS) > einTag ) {
          letzterTS += einTag;
          curstats = {"datum":letzterTS, "reviewed":reviewed, "accepted":accepted, "rejected":rejected, "duplicated":duplicated};
          wfrStats.push(curstats);
        }
      }

      if (stunde > 3) {
        ut = jetzt.getTime();
      } else {
        ut = heuteTS;
      }

      curstats = {"datum":ut, "reviewed":reviewed, "accepted":accepted, "rejected":rejected, "duplicated":duplicated};

      wfrStats.push(curstats);
      window.wfes.f.localSave(lStoreStats, wfrStats);

    } else {
      console.log("stats already saved today");
    }
  }

  function emptyPage(histText) {
    // fake history Eintrag (wegen zurückbutton)
    const stateObj = {info: "fake Chronik"};
    history.pushState(stateObj, "wfr main page", histText);
    window.addEventListener("popstate", function() {
      location.reload();
    });

    const reverse = document.getElementById("reversebox") || false;
    isChecked = reverse.checked;

    // Body leeren
    body.innerHTML = null;

    // styles & Co. entfernen
    const removables = ["script", "style", "link"];
    for (const r of removables) {
      const rms = head.getElementsByTagName(r);
      while (rms.length > 0) {
        head.removeChild(rms[0]);
      }
    }

    const fav = document.createElement("link");
    fav.setAttribute("rel", "shortcut icon");
    fav.setAttribute("href", "/imgpub/favicon.ico");
    head.appendChild(fav);
  }

  /* PoGO zählen */
  function handleReview() {
    if (!isInitialized) {
      return;
    }

    // hier die zu suchenden Begriffe rein
    const pokeArr= [
      "Pok[eéè]mon",
      "Pok[eéè]stop",
      "Stop",
      "Trainer",
      "Arena",
      "Raid",
      "Pogo",
      "Lockmodul",
      "Nester",
      "Pokespot"
    ];
    function pruefeText(text, arr) {
      let hasText = false;
      for (const p of arr) {
        const r = new RegExp(p, "im");
        if (r.test(text)) {
          hasText = true;
          break; // den Rest können wir uns sparen :-)
        }
      }
      return (hasText);
    }
    function set_warning(image) {
      const elem = window.document.querySelector("div.wf-page-header");
      elem.insertAdjacentHTML("beforeEnd", '<img style="width: 64px;height: 64px;" src="' + image + '">');
    }

    const newPortalData = window.wfes.g.reviewPageData();

    const statement = newPortalData.statement === undefined ? "" : newPortalData.statement.trim();
    const type = newPortalData.type;
    let subtype = 0;
    let usertext = statement + " " +
      newPortalData.title + " " +
      newPortalData.description;

    if ( ("NEW" === type) && ("" !== statement) ) {
      subtype = 1;
    }

    if ( "EDIT" === type ) {
      for (const d of newPortalData.descriptionEdits) {
        usertext += " " + d.value;
      }
      for (const t of newPortalData.titleEdits) {
        usertext += " " + t.value;
      }
    }

    if ("" === usertext) {
      console.warn(selfname + " kein Text - das ist ein Bug");
    } else {
      const hasPoketext = pruefeText(usertext, pokeArr);

      // Statistik speichern
      const jetzt = new Date();
      const curstats = {
        "datum" : jetzt.getTime(),
        "typ" : type,
        "subtyp" : subtype,
        "pogo" : hasPoketext,
        "hpwu" : false,
        "latE6" : newPortalData.lat * 1E6,
        "lngE6" : newPortalData.lng * 1E6,
        "titel" : newPortalData.title
      };
      PoGoStats.push(curstats);
      window.wfes.f.localSave(lStorePogo, PoGoStats);
      if (hasPoketext) {
        set_warning(WARN_POGO);
      }
    }
  }

  function handleProfile() {
    if (!isInitialized) {
      return;
    }
    wfrstats();
    upgrades();
  }

  function handleShowcase() {
    if (!isInitialized) {
      return;
    }

    const section = document.getElementsByClassName("showcase")[0];

    // --- helper functions ---
    function addDivs() {
      const cText = isChecked ? "checked" : "";
      section.insertAdjacentHTML("beforeEnd",
        '<div id="statsdiv"></div>' +
         '<div id="gamesdiv"></div>' +
         '<div id="buttonsdiv" class="pull-right">reverse: <input type="checkbox" id="reversebox" ' + cText + "/>" +
         '<button class="button-primary" id="WFRStatsBtn">show my stats</button>'+
         '<button class="button-primary" id="WFRSUpgrBtn">show my upgrades</button>' +
         '<button class="button-primary" id="WFRMarkBtn">WFR Marker Map</button>' +
         '<button class="button-primary" id="WFRHeatBtn">WFR HeatMap</button>' +
         "</div>"
      );
    }

    function showStatsTable() {
      // Stats - Tabelle

      const end = Math.max(0, wfrStats.length - maincount);
      const week = Math.min(7, wfrStats.length - 1);

      // Tabelle für die Statistik
      document.getElementById("statsdiv").insertAdjacentHTML("beforeEnd", '<table border="2"><thead><tr><th></th><th colspan="5">total</th><th colspan="5">yesterday</th><th colspan="5">last ' + week + " days (sliding window)</th></tr>"+
        '<tr style="border-bottom: 1px solid;"><th>date</th><th>reviewed</th><th>created</th><th>rejected</th><th>dup</th><th>%</th><th>reviewed</th><th>created</th><th>rejected</th><th>dup</th><th>%</th><th>reviewed</th><th>created</th><th>rejected</th><th>dup</th><th>%</th></tr></thead>'+
        '<tbody id="statstablebody"></tbody></table>');
      const innertable = document.getElementById("statstablebody");

      // Statistik einfügen
      let gproz, grev, gacc, grej, gdup, wproz, wrev, wacc, wrej, wdup, trev, tacc, trej, tdup;
      trev = tacc = trej = tdup = 0;

      for (let i = wfrStats.length - 1; i >= end; i--) {
        const ymd = YMDfromTime(wfrStats[i].datum);

        const prozent = wfrStats[i].reviewed > 0 ? 100*(wfrStats[i].accepted + wfrStats[i].rejected + wfrStats[i].duplicated)/ wfrStats[i].reviewed : 0;
        if (i > 0) {
          grev = wfrStats[i].reviewed - wfrStats[i-1].reviewed;
          gacc = wfrStats[i].accepted - wfrStats[i-1].accepted;
          grej = wfrStats[i].rejected - wfrStats[i-1].rejected;
          gdup = wfrStats[i].duplicated - wfrStats[i-1].duplicated;
          gproz = grev > 0 ? (100*(gacc+grej+gdup)/grev).toFixed(2) : " -- ";
          trev += grev;
          tacc += gacc;
          trej += grej;
          tdup += gdup;
        } else {
          gproz = grev = gacc = grej = gdup = " -- ";
        }
        if (i > week-1) {
          wrev = wfrStats[i].reviewed - wfrStats[i-week].reviewed;
          wacc = wfrStats[i].accepted - wfrStats[i-week].accepted;
          wrej = wfrStats[i].rejected - wfrStats[i-week].rejected;
          wdup = wfrStats[i].duplicated - wfrStats[i-week].duplicated;
          wproz = wrev > 0 ? (100*(wacc+wrej+wdup)/wrev).toFixed(2) : " -- ";
        } else {
          wproz = wrev = wacc = wrej = wdup = " -- ";
        }
        innertable.insertAdjacentHTML("beforeEnd", "<tr><td>" + ymd +"</td><td>" + wfrStats[i].reviewed + "</td><td>"+
         wfrStats[i].accepted + "</td><td>" + wfrStats[i].rejected + "</td><td>" + wfrStats[i].duplicated + "</td><td>" + prozent.toFixed(2) + "%</td>"+
         "<td>" + grev + "</td><td>" + gacc + "</td><td>" + grej + "</td><td>" + gdup + "</td><td>(" + gproz + "%)</td>" +
         "<td>" + wrev + "</td><td>" + wacc + "</td><td>" + wrej + "</td><td>" + wdup + "</td><td>(" + wproz + "%)</td></tr>");
      }
      const tproz = trev > 0 ? (100*(tacc+trej+tdup)/trev).toFixed(2) : " -- ";
      const agr = tacc+trej+tdup;
      const aproz = agr > 0 ? (100*tacc/agr).toFixed(2) : " -- ";
      const rproz = agr > 0 ? (100*trej/agr).toFixed(2) : " -- ";
      const dproz = agr > 0 ? (100*tdup/agr).toFixed(2) : " -- ";

      innertable.insertAdjacentHTML("beforeEnd", '<tr style="border-top: 2px solid;"><td colspan="6" rowspan="2"></td>'+
       "<td>" + trev + "</td><td>" + tacc + "</td><td>" + trej + "</td><td>" + tdup + "</td><td>(" + tproz + "%)</td>" +
       '<td colspan="5" rowspan="2"></td></tr>' +
       "<td></td><td>" + aproz + "%</td><td>" + rproz + "%</td><td>" + dproz + "%</td><td></td>");
    }


    function buttonFuncs() {
      // Stats
      function _writeLine(stats) {
        const dupes = "undefined" === typeof(stats.duplicated) ? "" : stats.duplicated;
        body.insertAdjacentHTML("beforeEnd", YMDfromTime(stats.datum) + ";" + stats.reviewed + ";" + stats.accepted + ";" + stats.rejected + ";" + dupes + "<br/>");
      }
      document.getElementById("WFRStatsBtn").addEventListener("click", function() {
        emptyPage("/#mystats");
        if (isChecked) {
          for (let i = wfrStats.length -1; i >= 0; i--) {
            _writeLine(wfrStats[i]);
          }
        } else {
          for (let i = 0; i < wfrStats.length; i++) {
            _writeLine(wfrStats[i]);
          }
        }
        window.wfes.f.localSave(lStoreCheck, isChecked);
      });

      // Upgrades
      document.getElementById("WFRSUpgrBtn").addEventListener("click", function() {
        emptyPage("/#myupgrades");
        window.wfes.f.localGet(lStoreUpgrades, []).then((myup)=>{
          if (isChecked) {
            for (let i = myup.length -1; i >= 0; i--) {
              body.insertAdjacentHTML("beforeEnd", myup[i].datum + ";" + myup[i].progress + ";" + myup[i].total + "<br/>");
            }
          } else {
            for (let i = 0; i < myup.length; i++) {
              body.insertAdjacentHTML("beforeEnd", myup[i].datum + ";" + myup[i].progress + ";" + myup[i].total + "<br/>");
            }
          }
          window.wfes.f.localSave(lStoreCheck, isChecked);
        });
      });

      function showMap() {
        let histText, innerScript = "";
        if ("WFRHeatBtn" === this.id ) {
          histText = "/#wfrheatmap";
          innerScript += `
            function getPoints() {
            return [`;
          for (let i = PoGoStats.length - 1; i > PoGoStats.length -501; i--) {
            // nur die neuesten 500
            const lat = PoGoStats[i].latE6/1E6;
            const lng = PoGoStats[i].lngE6/1E6;
            innerScript += "new google.maps.LatLng("+lat+","+lng+"),";
            if ( 0 === i) { break; }// weniger geht nicht
          }
          innerScript += `]}
            heatmap = new google.maps.visualization.HeatmapLayer({
              data: getPoints(),
              opacity: 0.6,
              map: map
            })`;
        } else if ("WFRMarkBtn" === this.id ) {
          histText = "/#wfrmarker";
          const iconBase = "https://icons.iconarchive.com/icons/icons-land/vista-map-markers/32/";

          for (let i = PoGoStats.length - 1; i > PoGoStats.length -501; i--) {
            // nur die neuesten 500
            const lat = PoGoStats[i].latE6/1E6;
            const lng = PoGoStats[i].lngE6/1E6;
            let ti1, ti2, ico;
            let color = "Azure";
            ti1 = ti2 = "";
            if (PoGoStats[i].pogo) { ti2 = "PoGo"; color = "Pink";}
            if (PoGoStats[i].hpwu) { ti2 = "HPWU"; color = "Chartreuse";}

            switch (PoGoStats[i].typ) {
            case "EDIT":
              ti1 = "Edit";
              ico = "Map-Marker-Ball-Right-" + color + "-icon.png";
              break;
            case "NEW":
              switch (PoGoStats[i].subtyp) {
              case 0:
                ti1 = "NEW R";
                ico = "Map-Marker-Push-Pin-1-"+color+"-icon.png";
                break;
              case 1:
                ti1 = "NEW P";
                ico = "Map-Marker-Marker-Outside-"+color+"-icon.png";
                break;
              }
              break;
            case "PHOTO":
              ti1 = "Photo";
              ico = "Map-Marker-Flag-1-Right-" + color + "-icon.png";
              break;
            default:
              ti1 = "unknowm";
              ico = "Map-Marker-Chequered-Flag-Right-" + color + "-icon.png";
              break;
            }
            const title = ti1 + " " + ti2;
            const icon = iconBase + ico;
            innerScript += "marker = new google.maps.Marker({" +
              "position: {lat:"+lat+",lng:"+lng+"}," +
              "map: map," +
              "title: '" + title + "'," +
              "icon: '"+ icon + "'"+
              "});\n";
            if ( 0 === i) { break; }// weniger geht nicht
          }
        }

        // Body leeren
        emptyPage(histText);

        const style = document.createElement("style");
        style.innerHTML= `#map { height: 100%; }
                    html, body { height: 100%; margin: 0; padding: 0;}`;
        head.appendChild(style);

        body.insertAdjacentHTML("afterBegin", '<div id="map"></div>');

        let script = document.createElement("script");
        script.type = "text/javascript";
        script.innerHTML=`
          function initMap() {
          map = new google.maps.Map(document.getElementById('map'), {
            zoom: 7,
            center: {lat: 51.38, lng: 10.12},
            mapTypeId: 'hybrid'
          })
          `;
        script.innerHTML += innerScript + "}";

        body.appendChild(script);

        script = document.createElement("script");
        script.type = "text/javascript";
        script.setAttribute("src", "https://maps.googleapis.com/maps/api/js?key=AIzaSyB8G-1vuHW3Sx8ONsM71G9TzWJHHWXfAf8&libraries=visualization,geometry&callback=initMap");
        body.appendChild(script);
      }

      // Marker Map
      document.getElementById("WFRHeatBtn").addEventListener("click", showMap);

      // Heatmap
      document.getElementById("WFRMarkBtn").addEventListener("click", showMap);
    }

    function showGamesTable() {
      const gamesdiv = document.getElementById("gamesdiv");
      gamesdiv.insertAdjacentHTML("afterBegin",
        '<table border="2"><colgroup><col width="4%"><col width="19%"><col width="8%"><col width="8%"><col width="8%">' +
        '<col width="8%"><col width="8%"><col width="8%"><col width="8%"><col width="8%"><col width="14%"></colgroup>' +
        '<thead><tr><th rowspan="2" colspan="2"></th><th colspan="4">Portaleinreichungen</th>' +
        '<th rowspan="2" colspan="2">Portal Edits</th><th rowspan="2" colspan="2">Photo</th>' +
        '<th rowspan="2">gesamt</th></tr><tr><th colspan="2">classic/redacted</th>' +
        '<th colspan="2">Prime/Pokémon Go</th></tr></thead>' +
        '<tbody id="gamesTBbody"></tbody></table>');

      const innertable = document.getElementById("gamesTBbody");
      let redg, redp, prig, prip, edig, edip, edih, redh, prih, phog, phop, phoh;
      redg = redp = prig = prip = edig = edip = edih = redh = prih = phog = phop = phoh = 0;

      // Zählen
      for (let i = 0; i < PoGoStats.length; i++) {
        switch (PoGoStats[i].typ) {
        case "EDIT":
          edig++;
          if (PoGoStats[i].pogo) { edip++; }
          if (PoGoStats[i].hpwu) { edih++; }
          break;
        case "NEW":
          switch (PoGoStats[i].subtyp) {
          case 0:
            redg++;
            if (PoGoStats[i].pogo) { redp++; }
            if (PoGoStats[i].hpwu) { redh++; }
            break;
          case 1:
            prig++;
            if (PoGoStats[i].pogo) { prip++; }
            if (PoGoStats[i].hpwu) { prih++; }
            break;
          default:
            console.warn("PoGoTable: falscher subtyp: " + PoGoStats[i].subtyp);
          }
          break;
        case "PHOTO":
          phog++;
          if (PoGoStats[i].pogo) { phop++; }
          if (PoGoStats[i].hpwu) { phoh++; }
          break;
        default:
          console.warn(selfname + " falscher typ: " + PoGoStats[i].typ);
        }
      }

      const revg = redg + prig + edig + phog;
      const revp = redp + prip + edip + phop;
      const revh = redh + prih + edih + phoh;

      const redpp = redg > 0 ? (100*redp/redg).toFixed(2) : " -- ";
      const pripp = prig > 0 ? (100*prip/prig).toFixed(2) : " -- ";
      const edipp = edig > 0 ? (100*edip/edig).toFixed(2) : " -- ";
      const revpp = revg > 0 ? (100*revp/revg).toFixed(2) : " -- ";
      const phopp = phog > 0 ? (100*phop/phog).toFixed(2) : " -- ";

      // Tabelle füllen
      const redgp = revg > 0 ? (100*redg/revg).toFixed(2) : " -- ";
      const prigp = revg > 0 ? (100*prig/revg).toFixed(2) : " -- ";
      const edigp = revg > 0 ? (100*edig/revg).toFixed(2) : " -- ";
      const phogp = revg > 0 ? (100*phog/revg).toFixed(2) : " -- ";

      innertable.insertAdjacentHTML("beforeEnd", '<tr style="border-top: 2px solid;"><th colspan="2">reviews gesamt </th><td>' + redg + "</td><td>"+redgp+"%</td><td>"+
                         prig + "</td><td>"+prigp+"%</td><td>" + edig + "</td><td>"+edigp+"%</td><td>" + phog + "</td><td>"+phogp+"%</td><td>" + revg + "</td></tr>");

      // PoGo Prozente
      const redgpp = revp > 0 ? (100*redp/revp).toFixed(2) : " -- ";
      const prigpp = revp > 0 ? (100*prip/revp).toFixed(2) : " -- ";
      const edigpp = revp > 0 ? (100*edip/revp).toFixed(2) : " -- ";
      const phogpp = revp > 0 ? (100*phop/revp).toFixed(2) : " -- ";

      innertable.insertAdjacentHTML("beforeEnd", '<tr style="border-top: 1px solid;"><th></th><th>davon Pokémon </th><td>' + redp + "</td><td>"+redgpp+"%</td><td>"+ prip +
                        "</td><td>"+prigpp+"%</td><td>" + edip + "</td><td>"+edigpp+"%</td><td>" + phop + "</td><td>"+phogpp+"%</td><td>" + revp + "</td></tr>");
      innertable.insertAdjacentHTML("beforeEnd", '<tr><th></th><th>in Prozent </th><th colspan="2">' + redpp + '%</th><th colspan="2">'+ pripp +
                        '%</th><th colspan="2">' + edipp + '%</th><th colspan="2">' + phopp + "%</th><th>" + revpp + "%</th></tr>");

      // HPWU Prozente
      const redhp = redg > 0 ? (100*redh/redg).toFixed(2) : " -- ";
      const prihp = prig > 0 ? (100*prih/prig).toFixed(2) : " -- ";
      const edihp = edig > 0 ? (100*edih/edig).toFixed(2) : " -- ";
      const revhp = revg > 0 ? (100*revh/revg).toFixed(2) : " -- ";
      const phohp = phog > 0 ? (100*phoh/revg).toFixed(2) : " -- ";

      const redghp = revh > 0 ? (100*redh/revh).toFixed(2) : " -- ";
      const prighp = revh > 0 ? (100*prih/revh).toFixed(2) : " -- ";
      const edighp = revh > 0 ? (100*edih/revh).toFixed(2) : " -- ";
      const phoghp = revh > 0 ? (100*phoh/revh).toFixed(2) : " -- ";

      innertable.insertAdjacentHTML("beforeEnd", '<tr style="border-top: 1px solid;"><th></th><th>davon Harry Potter </th><td>' + redh + "</td><td>"+redghp+"%</td><td>"+ prih +
                        "</td><td>"+prighp+"%</td><td>" + edih + "</td><td>"+edighp+"%</td><td>" + phoh + "</td><td>"+phoghp+"%</td><td>" + revh + "</td></tr>");
      innertable.insertAdjacentHTML("beforeEnd", '<tr><th></th><th>in Prozent </th><th colspan="2">' + redhp + '%</th><th colspan="2">'+ prihp +
                        '%</th><th colspan="2">' + edihp + '%</th><th colspan="2">' + phohp + "%</th><th>" + revhp + "%</th></tr>");
    }

    // ---
    window.wfes.f.addCSS(myCssId, myStyle);
    addDivs();
    showStatsTable();
    showGamesTable();
    buttonFuncs();

  }

  /* =========== MAIN ================================ */

  // window.setTimeout(init, 200);
  init(); // die promises sollten es richten :-)
  // install Event Handlers
  window.addEventListener("WFESReviewPageLoaded", () => {setTimeout(handleReview, 2000);});
  window.addEventListener("WFESProfileLoaded", handleProfile);
  window.addEventListener("WFESHomePageLoaded", handleShowcase);

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
