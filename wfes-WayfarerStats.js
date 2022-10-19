// @name        Wayfarer Stats
// @version     1.4.0.alpha1
// @description save Wayfarer statistics in local browser storage
// @author      AlterTobi
// @TODO .then(()=>{})

(function() {
  "use strict";
  const selfname = "wfes_wayfarerStats";
  const maincount = 14;

  // define names
  const lStoreStats = selfname+"_Stats";
  const lStorePogo = selfname+"_PoGoCount";
  const lStoreCheck = selfname+"_IsChecked";
  const lStoreCheckS2 = selfname+"_IsCheckedS2";
  const lStoreUpgrades = selfname+"_myUpgrades";

  const myCssId = "wayfarerStatsCSS";
  const myStyle = `
    th { text-align: center; }
    td, th { padding: 5px; }
    td { text-align: right; }
    table { margin-top: 10px; font-family: monospace
            background-color: #2d2d2d; width: 100%; }
    #reversebox { margin: 0 10px; }
    #s2box { margin: 0 10px; }
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

  let PoGoStats, wfrStats, isChecked, isCheckedS2;
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
          window.wfes.f.localGet(lStoreCheckS2, false).then((s2c)=>{
            isCheckedS2 = s2c;
            isInitialized = true;
          });
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

    isChecked = document.getElementById("reversebox").checked || false;
    isCheckedS2 = document.getElementById("s2box").checked || false;

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
      const s2Text = isCheckedS2 ? "checked" : "";
      section.insertAdjacentHTML("beforeEnd",
        '<div id="statsdiv"></div>' +
         '<div id="gamesdiv"></div>' +
         '<div id="buttonsdiv" class="pull-right">reverse: <input type="checkbox" id="reversebox" ' + cText + "/>" +
         '<button class="button-primary" id="WFRStatsBtn">show my stats</button>'+
         '<button class="button-primary" id="WFRSUpgrBtn">show my upgrades</button>' +
         '<button class="button-primary" id="WFRMarkBtn">WFR Marker Map</button>' +
         '<button class="button-primary" id="WFRHeatBtn">WFR HeatMap</button>' +
         '<div id="buttonsdiv" >show S2 grid: <input type="checkbox" id="s2box" ' + s2Text + "/>" +
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
          window.wfes.f.localSave(lStoreCheckS2, isCheckedS2);
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
            });`;

          if(isCheckedS2) {
            innerScript += ` // S2 Grid
              getGrid();
              function idleGrid() {
                overlay.updateGrid(map, 6, 'red', 2);
              }
              function getGrid() {
                  overlay.drawCellGrid(map, 6, 'red', 2);
                  map.addListener('idle', idleGrid);
              }`;
          }

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
        if(isCheckedS2) {
          script.innerHTML=`
            class S2Overlay{constructor(){this.polyLines=[]}check_map_bounds_ready(t){return!!t&&void 0!==t.getBounds&&void 0!==t.getBounds()}until(t,e){let n=l=>{t(e)?l():setTimeout(()=>n(l),400)};return new Promise(n)}updateGrid(t,e,n,l=1,r=null,o=null){this.polyLines.forEach(t=>{t.setMap(null)});let i=this.drawCellGrid(t,e,n,l);return null!==r&&this.drawCellGrid(t,r,o,2),i}async drawCellGrid(t,e,n,l=1){await this.until(this.check_map_bounds_ready,t);let r=t.getBounds(),o={},i=[];if(e>=2&&e<t.getZoom()+2){let a=t.getCenter(),u=S2.S2Cell.FromLatLng(this.getLatLngPoint(a),e);i.push(u),o[u.toString()]=!0;let $;for(;i.length>0;){$=i.pop();let s=$.getNeighbors();for(let c=0;c<s.length;c++){let g=s[c].toString();!o[g]&&(o[g]=!0,this.isCellOnScreen(r,s[c])&&i.push(s[c]))}this.drawCell(t,$,n,l)}}}drawCell(t,e,n,l){let r=e.getCornerLatLngs();r[4]=r[0];let o=new google.maps.Polyline({path:r,geodesic:!0,fillColor:"grey",fillOpacity:0,strokeColor:n,strokeOpacity:1,strokeWeight:l,map:t});this.polyLines.push(o)}getLatLngPoint(t){let e={lat:"function"==typeof t.lat?t.lat():t.lat,lng:"function"==typeof t.lng?t.lng():t.lng};return e}isCellOnScreen(t,e){let n=e.getCornerLatLngs();for(let l=0;l<n.length;l++)if(t.intersects(new google.maps.LatLngBounds(n[l])))return!0;return!1}}!function(t){"use strict";let e=t.S2={L:{}};e.L.LatLng=function(t,e,n){let l=parseFloat(t,10),r=parseFloat(e,10);if(isNaN(l)||isNaN(r))throw Error("Invalid LatLng object: ("+t+", "+e+")");return!0!==n&&(l=Math.max(Math.min(l,90),-90),r=(r+180)%360+(r<-180||180===r?180:-180)),{lat:l,lng:r}},e.L.LatLng.DEG_TO_RAD=Math.PI/180,e.L.LatLng.RAD_TO_DEG=180/Math.PI,e.LatLngToXYZ=function(t){let n=e.L.LatLng.DEG_TO_RAD,l=t.lat*n,r=t.lng*n,o=Math.cos(l);return[Math.cos(r)*o,Math.sin(r)*o,Math.sin(l)]},e.XYZToLatLng=function(t){let n=e.L.LatLng.RAD_TO_DEG,l=Math.atan2(t[2],Math.sqrt(t[0]*t[0])+t[1]*t[1]),r=Math.atan2(t[1],t[0]);return e.L.LatLng(l*n,r*n)};let n=function(t){let e=[Math.abs(t[0]),Math.abs(t[1]),Math.abs(t[2])];return e[0]>e[1]?e[0]>e[2]?0:2:e[1]>e[2]?1:2},l=function(t,e){let n,l;switch(t){case 0:n=e[1]/e[0],l=e[2]/e[0];break;case 1:n=-e[0]/e[1],l=e[2]/e[1];break;case 2:n=-e[0]/e[2],l=-e[1]/e[2];break;case 3:n=e[2]/e[0],l=e[1]/e[0];break;case 4:n=e[2]/e[1],l=-e[0]/e[1];break;case 5:n=-e[1]/e[2],l=-e[0]/e[2];break;default:throw{error:"Invalid face"}}return[n,l]};e.XYZToFaceUV=function(t){let e=n(t);t[e]<0&&(e+=3);let r=l(e,t);return[e,r]},e.FaceUVToXYZ=function(t,e){let n=e[0],l=e[1];switch(t){case 0:return[1,n,l];case 1:return[-n,1,l];case 2:return[-n,-l,1];case 3:return[-1,-l,-n];case 4:return[l,-1,-n];case 5:return[l,n,-1];default:throw{error:"Invalid face"}}};let r=function(t){return t>=.5?1/3*(4*t*t-1):1/3*(1-4*(1-t)*(1-t))};e.STToUV=function(t){return[r(t[0]),r(t[1])]};let o=function(t){return t>=0?.5*Math.sqrt(1+3*t):1-.5*Math.sqrt(1-3*t)};e.UVToST=function(t){return[o(t[0]),o(t[1])]},e.STToIJ=function(t,e){let n=1<<e,l=function(t){return Math.max(0,Math.min(n-1,Math.floor(t*n)))};return[l(t[0]),l(t[1])]},e.IJToST=function(t,e,n){let l=1<<e;return[(t[0]+n[0])/l,(t[1]+n[1])/l]};let i=function(t,e,n,l){if(0===l){1===n&&(e.x=t-1-e.x,e.y=t-1-e.y);let r=e.x;e.x=e.y,e.y=r}},a=function(t,e,n,l){let r={a:[[0,"d"],[1,"a"],[3,"b"],[2,"a"]],b:[[2,"b"],[1,"b"],[3,"a"],[0,"c"]],c:[[2,"c"],[3,"d"],[1,"c"],[0,"b"]],d:[[0,"a"],[3,"c"],[1,"d"],[2,"d"]]};"number"!=typeof l&&console.warn(Error("called pointToHilbertQuadList without face value, defaulting to '0'").stack);let o=l%2?"d":"a",i=[];for(let a=n-1;a>=0;a--){let u=1<<a,$=t&u?1:0,s=e&u?1:0,c=r[o][2*$+s];i.push(c[0]),o=c[1]}return i};e.S2Cell=function(){},e.S2Cell.FromHilbertQuadKey=function(t){let n=t.split("/"),l=parseInt(n[0]),r=n[1],o=r.length,a={x:0,y:0},u,$,s,c,g,_;for(u=o-1;u>=0;u--)$=o-u,s=r[u],c=0,g=0,"1"===s?g=1:"2"===s?(c=1,g=1):"3"===s&&(c=1),i(_=Math.pow(2,$-1),a,c,g),a.x+=_*c,a.y+=_*g;if(1==l%2){let f=a.x;a.x=a.y,a.y=f}return e.S2Cell.FromFaceIJ(parseInt(l),[a.x,a.y],$)},e.S2Cell.FromLatLng=function(t,n){if(!t.lat&&0!==t.lat||!t.lng&&0!==t.lng)throw Error("Pass { lat: lat, lng: lng } to S2.S2Cell.FromLatLng");let l=e.LatLngToXYZ(t),r=e.XYZToFaceUV(l),o=e.UVToST(r[1]),i=e.STToIJ(o,n);return e.S2Cell.FromFaceIJ(r[0],i,n)},e.S2Cell.FromFaceIJ=function(t,n,l){let r=new e.S2Cell;return r.face=t,r.ij=n,r.level=l,r},e.S2Cell.prototype.toString=function(){return"F"+this.face+"ij["+this.ij[0]+","+this.ij[1]+"]@"+this.level},e.S2Cell.prototype.getLatLng=function(){let t=e.IJToST(this.ij,this.level,[.5,.5]),n=e.STToUV(t),l=e.FaceUVToXYZ(this.face,n);return e.XYZToLatLng(l)},e.S2Cell.prototype.getCornerLatLngs=function(){let t=[],n=[[0,0],[0,1],[1,1],[1,0]];for(let l=0;l<4;l++){let r=e.IJToST(this.ij,this.level,n[l]),o=e.STToUV(r),i=e.FaceUVToXYZ(this.face,o);t.push(e.XYZToLatLng(i))}return t},e.S2Cell.prototype.getFaceAndQuads=function(){let t=a(this.ij[0],this.ij[1],this.level,this.face);return[this.face,t]},e.S2Cell.prototype.toHilbertQuadkey=function(){let t=a(this.ij[0],this.ij[1],this.level,this.face);return this.face.toString(10)+"/"+t.join("")},e.latLngToNeighborKeys=e.S2Cell.latLngToNeighborKeys=function(t,n,l){return e.S2Cell.FromLatLng({lat:t,lng:n},l).getNeighbors().map(function(t){return t.toHilbertQuadkey()})},e.S2Cell.prototype.getNeighbors=function(){let t=function(t,n,l){let r=1<<l;if(n[0]>=0&&n[1]>=0&&n[0]<r&&n[1]<r)return e.S2Cell.FromFaceIJ(t,n,l);{let o=e.IJToST(n,l,[.5,.5]),i=e.STToUV(o),a=e.FaceUVToXYZ(t,i),u=e.XYZToFaceUV(a);return t=u[0],i=u[1],o=e.UVToST(i),n=e.STToIJ(o,l),e.S2Cell.FromFaceIJ(t,n,l)}},n=this.face,l=this.ij[0],r=this.ij[1],o=this.level;return[t(n,[l-1,r],o),t(n,[l,r-1],o),t(n,[l+1,r],o),t(n,[l,r+1],o)]},e.FACE_BITS=3,e.MAX_LEVEL=30,e.POS_BITS=2*e.MAX_LEVEL+1,e.facePosLevelToId=e.S2Cell.facePosLevelToId=e.fromFacePosLevel=function(n,l,r){let o=t.dcodeIO&&t.dcodeIO.Long,i,a,u;for(r||(r=l.length),l.length>r&&(l=l.substr(0,r)),i=o.fromString(n.toString(10),!0,10).toString(2);i.length<e.FACE_BITS;)i="0"+i;for(a=o.fromString(l,!0,4).toString(2);a.length<2*r;)a="0"+a;for(u=i+a,u+="1";u.length<e.FACE_BITS+e.POS_BITS;)u+="0";return o.fromString(u,!0,2).toString(10)},e.keyToId=e.S2Cell.keyToId=e.toId=e.toCellId=e.fromKey=function(t){let n=t.split("/");return e.fromFacePosLevel(n[0],n[1],n[1].length)},e.idToKey=e.S2Cell.idToKey=e.S2Cell.toKey=e.toKey=e.fromId=e.fromCellId=e.S2Cell.toHilbertQuadkey=e.toHilbertQuadkey=function(n){let l=t.dcodeIO&&t.dcodeIO.Long,r=l.fromString(n,!0,10).toString(2);for(;r.length<e.FACE_BITS+e.POS_BITS;)r="0"+r;let o=r.lastIndexOf("1"),i=r.substring(0,3),a=r.substring(3,o),u=a.length/2,$=l.fromString(i,!0,2).toString(10),s=l.fromString(a,!0,2).toString(4);for(;s.length<u;)s="0"+s;return $+"/"+s},e.keyToLatLng=e.S2Cell.keyToLatLng=function(t){let n=e.S2Cell.FromHilbertQuadKey(t);return n.getLatLng()},e.idToLatLng=e.S2Cell.idToLatLng=function(t){let n=e.idToKey(t);return e.keyToLatLng(n)},e.S2Cell.latLngToKey=e.latLngToKey=e.latLngToQuadkey=function(t,n,l){if(isNaN(l)||l<1||l>30)throw Error("'level' is not a number between 1 and 30 (but it should be)");return e.S2Cell.FromLatLng({lat:t,lng:n},l).toHilbertQuadkey()},e.stepKey=function(e,n){let l=t.dcodeIO&&t.dcodeIO.Long,r=e.split("/"),o=r[0],i=r[1],a=r[1].length,u=l.fromString(i,!0,4),$;n>0?$=u.add(Math.abs(n)):n<0&&($=u.subtract(Math.abs(n)));let s=$.toString(4);for("0"===s&&console.warning(Error("face/position wrapping is not yet supported"));s.length<a;)s="0"+s;return o+"/"+s},e.S2Cell.prevKey=e.prevKey=function(t){return e.stepKey(t,-1)},e.S2Cell.nextKey=e.nextKey=function(t){return e.stepKey(t,1)}}("undefined"==typeof module?window:module.exports);
            let overlay = new S2Overlay();
            `;
        }
        script.innerHTML += `
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
        '<th rowspan="2">total</th></tr><tr><th colspan="2">classic/redacted</th>' +
        '<th colspan="2">Prime/Pokémon Go</th></tr></thead>' +
        '<tbody id="gamesTBbody"></tbody></table>');

      const innertable = document.getElementById("gamesTBbody");
      let redg, redp, prig, prip, edig, edip, phog, phop;
      redg = redp = prig = prip = edig = edip = phog = phop = 0;

      // Zählen
      for (let i = 0; i < PoGoStats.length; i++) {
        switch (PoGoStats[i].typ) {
        case "EDIT":
          edig++;
          if (PoGoStats[i].pogo) { edip++; }
          break;
        case "NEW":
          switch (PoGoStats[i].subtyp) {
          case 0:
            redg++;
            if (PoGoStats[i].pogo) { redp++; }
            break;
          case 1:
            prig++;
            if (PoGoStats[i].pogo) { prip++; }
            break;
          default:
            console.warn("PoGoTable: falscher subtyp: " + PoGoStats[i].subtyp);
          }
          break;
        case "PHOTO":
          phog++;
          if (PoGoStats[i].pogo) { phop++; }
          break;
        default:
          console.warn(selfname + " falscher typ: " + PoGoStats[i].typ);
        }
      }

      const revg = redg + prig + edig + phog;
      const revp = redp + prip + edip + phop;

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

      innertable.insertAdjacentHTML("beforeEnd", '<tr style="border-top: 2px solid;"><th colspan="2">reviews total </th><td>' + redg + "</td><td>"+redgp+"%</td><td>"+
                         prig + "</td><td>"+prigp+"%</td><td>" + edig + "</td><td>"+edigp+"%</td><td>" + phog + "</td><td>"+phogp+"%</td><td>" + revg + "</td></tr>");

      // PoGo Prozente
      const redgpp = revp > 0 ? (100*redp/revp).toFixed(2) : " -- ";
      const prigpp = revp > 0 ? (100*prip/revp).toFixed(2) : " -- ";
      const edigpp = revp > 0 ? (100*edip/revp).toFixed(2) : " -- ";
      const phogpp = revp > 0 ? (100*phop/revp).toFixed(2) : " -- ";

      innertable.insertAdjacentHTML("beforeEnd", '<tr style="border-top: 1px solid;"><th></th><th>thereof  Pokémon </th><td>' + redp + "</td><td>"+redgpp+"%</td><td>"+ prip +
                        "</td><td>"+prigpp+"%</td><td>" + edip + "</td><td>"+edigpp+"%</td><td>" + phop + "</td><td>"+phogpp+"%</td><td>" + revp + "</td></tr>");
      innertable.insertAdjacentHTML("beforeEnd", '<tr><th></th><th>in percent </th><th colspan="2">' + redpp + '%</th><th colspan="2">'+ pripp +
                        '%</th><th colspan="2">' + edipp + '%</th><th colspan="2">' + phopp + "%</th><th>" + revpp + "%</th></tr>");
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
