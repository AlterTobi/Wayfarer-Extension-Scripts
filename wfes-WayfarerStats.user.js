// ==UserScript==
// @name        WFES - Wayfarer Stats
// @namespace   https://github.com/AlterTobi/WFES/
// @version     0.9.0
// @description save Wayfarer statistics in local browser storage
// @author      AlterTobi
// @match       https://wayfarer.nianticlabs.com/*
// @icon        https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @downloadURL https://github.com/AlterTobi/WFES/release/v0.9/wfes-WayfarerStats.user.js
// @supportURL  https://github.com/AlterTobi/WFES/issues
// @grant       none
// ==/UserScript==

(function () {
    'use strict';
    const selfname = 'wfes_wayfarerStats';
    const maincount = 14;

    // define names
    const lStoreStats = selfname+'_Stats';
    const lStorePogo = selfname+'_PoGoCount';
    const lStoreCheck = selfname+'_IsChecked';
    const lStoreUpgrades = selfname+'_myUpgrades';

    const selfnameO = 'WFRStats';
    const lStoreStatsO = selfnameO+'_Stats';
    const lStorePogoO = selfnameO+'_PoGoCount';
    const lStoreCheckO = selfnameO+'_IsChecked';
    const lStoreUpgradesO = selfnameO+'_myUpgrades';

    // get Values from localStorage
    let PoGoStats = JSON.parse(localStorage.getItem(lStorePogo)) || JSON.parse(localStorage.getItem(lStorePogoO)) || [];
    let wfrStats = JSON.parse(localStorage.getItem(lStoreStats)) || JSON.parse(localStorage.getItem(lStoreStatsO)) || [];
    let isChecked = JSON.parse(localStorage.getItem(lStoreCheck)) || JSON.parse(localStorage.getItem(lStoreCheckO)) || false;

    let body = document.getElementsByTagName('body')[0];
    let head = document.getElementsByTagName('head')[0];

    function addCSS() {
        let myID = 'wayfarerStatsCSS';
        // already there?
        if ( null === document.getElementById(myID)) {
            let headElem = document.getElementsByTagName("head")[0];
            let customStyleElem = document.createElement("style");
            customStyleElem.setAttribute('id',myID);
            customStyleElem.innerText = `
                th { text-align: center; }
                td, th { padding: 5px; }
                td { text-align: right; }
                table { margin-top: 10px; font-family: monospace
                        background-color: #2d2d2d; width: 100%; }
                #reversebox { margin: 0 10px; }
                #buttonsdiv button { margin: 0 10px; }
                #buttonsdiv, #statsdiv, #gamesdiv { margin-bottom: 2em; }
                `;
            headElem.appendChild(customStyleElem);
        }
    }

    function localSave(name,content){
        let json = JSON.stringify(content);
        localStorage.setItem(name,json);
    }

    function YMDfromTime(time){
        let curdate = new Date();
        curdate.setTime(time);

        let Jahr = curdate.getFullYear().toString(),
            Monat = ('0' + ( 1 + curdate.getMonth())).slice(-2),
            Tag = ('0' + curdate.getDate()).slice(-2);

        let ymd = Tag + '.' + Monat + '.' + Jahr;
        return ymd;
    }

    function upgrades() {
        /* die Upgrades zählen */
        console.log(selfname + ' zähle Upgrades');
        let myWFRupgrades = JSON.parse(localStorage.getItem(lStoreUpgrades)) || JSON.parse(localStorage.getItem(lStoreUpgradesO)) || [];
        let progress = window.wfes.profile.progress;
                let total = window.wfes.profile.total;
                let lastProgress = 0;
                let lastTotal = 0;

                if (myWFRupgrades.length > 0) {
                        lastProgress = myWFRupgrades[myWFRupgrades.length-1].progress;
                        lastTotal = myWFRupgrades[myWFRupgrades.length-1].total;
                }

                if ((total != lastTotal ) || (progress!=lastProgress)) {
                        let ut = new Date().getTime();
                        let curstats = {'datum':ut,'progress':progress,'total':total};
                        myWFRupgrades.push(curstats);
                        localSave(lStoreUpgrades,myWFRupgrades);
                }
    }

    function wfrstats() {
        var heute, last, ut;

        // nur tun, wenn heute noch nicht und Stunde > 3
        let jetzt = new Date();
        let stunde = jetzt.getHours();

        if (stunde < 3) {
            heute = new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate()-1 );
        } else {
            heute = new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate() );
        }

        let heuteTS = heute.getTime();

        if (wfrStats.length > 0) {
            last = wfrStats[wfrStats.length-1].datum;
        } else {
            last = 0;
        }

        if (heuteTS > last) {

            console.log(selfname + ' saving stats');

            const reviewed = window.wfes.profile.finished;
            const accepted = window.wfes.profile.accepted;
            const rejected = window.wfes.profile.rejected;
            const duplicated = window.wfes.profile.duplicated;

            if ( last > 0 ) {
                // nur wenn schon gespeicherte Werte vorhanden.
                let einTag = 25*60*60*1000; // milliseconds
                                            // 25hours because of DST

                let letzter = new Date();
                letzter.setTime(last);
                let letzterTS = new Date(letzter.getFullYear(), letzter.getMonth(), letzter.getDate()).getTime();

                while ( (heuteTS - letzterTS) > einTag ) {
                    letzterTS += einTag;
                    var curstats = {'datum':letzterTS,'reviewed':reviewed,'accepted':accepted,'rejected':rejected,'duplicated':duplicated};
                    wfrStats.push(curstats);
                }
            }

            if (stunde > 3) {
                ut = jetzt.getTime();
            } else {
                ut = heuteTS;
            }

            curstats = {'datum':ut,'reviewed':reviewed,'accepted':accepted,'rejected':rejected,'duplicated':duplicated};

            wfrStats.push(curstats);
            localSave(lStoreStats,wfrStats);

            } else {
                console.log('stats already saved today');
            }
    }

    function emptyPage(histText){
        // fake history Eintrag (wegen zurückbutton)
        var stateObj = {info: "fake Chronik"};
        history.pushState(stateObj, "wfr main page", histText);
        window.addEventListener('popstate', function(){
            location.reload();
        })

        let reverse = document.getElementById('reversebox') || false;
        isChecked = reverse.checked;

        // Body leeren
        body.innerHTML = null;

        // styles & Co. entfernen
        let removables = ['script','style','link'];
        for (let r of removables){
                let rms = head.getElementsByTagName(r);
                while (rms.length > 0){
                        head.removeChild(rms[0]);
                }
        }

        let fav = document.createElement("link");
                fav.setAttribute("rel","shortcut icon");
                fav.setAttribute("href","/imgpub/favicon.ico");
                head.appendChild(fav);
    }

    /* PoGO zählen */
    function handleReview() {

        // hier die zu suchenden Begriffe rein
        let pokeArr= [
                'Pok[eéè]mon',
                'Pok[eéè]stop',
                'Stop',
                'Trainer',
                'Arena',
                'Raid',
                'Pogo',
                'Lockmodul',
                'Nester',
                'Pokespot'
                ];
        function pruefeText(text, arr, was){
            let hasText = false;
            for (let p of arr) {
                let r = new RegExp(p,'im');
                if (r.test(text)) {
                        hasText = true;
                        break; // den Rest können wir uns sparen :-)
                }
            }
            return (hasText);
        }
        function set_warning(image) {
            let elem = window.document.querySelector("div.wf-page-header");
                elem.insertAdjacentHTML('beforeEnd', '<img style="width: 64px;height: 64px;" src="' + image + '">');
        }

        const newPortalData = window.wfes.review.pageData;

        let statement = newPortalData.statement === undefined ? "" : newPortalData.statement.trim();
        let type = window.wfes.review.pageData.type;
        let subtype = 0;
        let usertext = statement + ' ' +
                newPortalData.title + ' ' +
                newPortalData.description;

        if ( ('NEW' == type) && ("" !== statement) ) {
                subtype = 1;
        }

        if ( 'EDIT' == type ) {
            for (let d of newPortalData.descriptionEdits) {
                usertext += ' ' + d.value;
            }
            for (let t of newPortalData.titleEdits) {
                usertext += ' ' + t.value;
            }
        }

        if (usertext !== "") {
            let hasPoketext = pruefeText(usertext, pokeArr, 'Pokémon');

            // Statistik speichern
            let jetzt = new Date();
            let curstats = {
                        'datum' : jetzt.getTime(),
                        'typ' : type,
                        'subtyp' : subtype,
                        'pogo' : hasPoketext,
                        'hpwu' : false,
                        'latE6' : newPortalData.lat * 1E6,
                        'lngE6' : newPortalData.lng * 1E6,
                        'titel' : newPortalData.title
                        };
            PoGoStats.push(curstats);
            localSave(lStorePogo,PoGoStats);
            if (hasPoketext){
                set_warning(WARN_POGO);
            }
        } else {
            console.warn(selfname + ' kein Text - das ist ein Bug');
        }
    }

    function handleProfile() {
        wfrstats();
        upgrades();
    }

    function handleShowcase() {
        let section = document.getElementsByClassName('showcase')[0];

        // --- helper functions ---
        function addDivs() {
            let cText = isChecked ? 'checked' : '';
            section.insertAdjacentHTML("beforeEnd",
                   '<div id="statsdiv"></div>' +
                   '<div id="gamesdiv"></div>' +
                   '<div id="buttonsdiv" class="pull-right">reverse: <input type="checkbox" id="reversebox" ' + cText + '/>' +
                   '<button class="button-primary" id="WFRStatsBtn">show my stats</button>'+
                   '<button class="button-primary" id="WFRSUpgrBtn">show my upgrades</button>' +
                   '<button class="button-primary" id="WFRMarkBtn">WFR Marker Map</button>' +
                   '<button class="button-primary" id="WFRHeatBtn">WFR HeatMap</button>' +
                   '</div>'
                   );
        }

        function showStatsTable() {
            // Stats - Tabelle

            let end = Math.max(0, wfrStats.length - maincount);
            let week = Math.min(7, wfrStats.length - 1);

            // Tabelle für die Statistik
            document.getElementById('statsdiv').insertAdjacentHTML("beforeEnd", '<table border="2"><thead><tr><th></th><th colspan="5">total</th><th colspan="5">yesterday</th><th colspan="5">last ' + week + ' days (sliding window)</th></tr>'+
                            '<tr style="border-bottom: 1px solid;"><th>date</th><th>reviewed</th><th>created</th><th>rejected</th><th>dup</th><th>%</th><th>reviewed</th><th>created</th><th>rejected</th><th>dup</th><th>%</th><th>reviewed</th><th>created</th><th>rejected</th><th>dup</th><th>%</th></tr></thead>'+
                            '<tbody id="statstablebody"></tbody></table>');
            let innertable = document.getElementById("statstablebody");

            // Statistik einfügen
            let gproz, grev, gacc, grej, gdup, wproz, wrev, wacc, wrej, wdup, tproz, agr, aproz, rproz, dproz, trev, tacc, trej, tdup;
            trev = tacc = trej = tdup = 0;

            for (var i = wfrStats.length - 1; i >= end; i--) {
                let ymd = YMDfromTime(wfrStats[i].datum);

                let prozent = wfrStats[i].reviewed > 0 ? 100*(wfrStats[i].accepted + wfrStats[i].rejected + wfrStats[i].duplicated)/ wfrStats[i].reviewed : 0;
                if (i > 0) {
                    grev = wfrStats[i].reviewed - wfrStats[i-1].reviewed;
                    gacc = wfrStats[i].accepted - wfrStats[i-1].accepted;
                    grej = wfrStats[i].rejected - wfrStats[i-1].rejected;
                    gdup = wfrStats[i].duplicated - wfrStats[i-1].duplicated;
                    gproz = grev > 0 ? (100*(gacc+grej+gdup)/grev).toFixed(2) : ' -- ';
                    trev += grev;
                    tacc += gacc;
                    trej += grej;
                    tdup += gdup;
                } else {
                    gproz = grev = gacc = grej = gdup = ' -- ';
                }
                if (i > week-1) {
                    wrev = wfrStats[i].reviewed - wfrStats[i-week].reviewed;
                    wacc = wfrStats[i].accepted - wfrStats[i-week].accepted;
                    wrej = wfrStats[i].rejected - wfrStats[i-week].rejected;
                    wdup = wfrStats[i].duplicated - wfrStats[i-week].duplicated;
                    wproz = wrev > 0 ? (100*(wacc+wrej+wdup)/wrev).toFixed(2) : ' -- ';
                } else {
                    wproz = wrev = wacc = wrej = wdup = ' -- ';
                }
                innertable.insertAdjacentHTML("beforeEnd", '<tr><td>' + ymd +'</td><td>' + wfrStats[i].reviewed + '</td><td>'+
                       wfrStats[i].accepted + '</td><td>' + wfrStats[i].rejected + '</td><td>' + wfrStats[i].duplicated + '</td><td>' + prozent.toFixed(2) + '%</td>'+
                       '<td>' + grev + '</td><td>' + gacc + '</td><td>' + grej + '</td><td>' + gdup + '</td><td>(' + gproz + '%)</td>' +
                       '<td>' + wrev + '</td><td>' + wacc + '</td><td>' + wrej + '</td><td>' + wdup + '</td><td>(' + wproz + '%)</td></tr>');
                }
                tproz = trev > 0 ? (100*(tacc+trej+tdup)/trev).toFixed(2) : ' -- ';
                agr = tacc+trej+tdup;
                aproz = agr > 0 ? (100*tacc/agr).toFixed(2) : ' -- ';
                rproz = agr > 0 ? (100*trej/agr).toFixed(2) : ' -- ';
                dproz = agr > 0 ? (100*tdup/agr).toFixed(2) : ' -- ';

                innertable.insertAdjacentHTML("beforeEnd", '<tr style="border-top: 2px solid;"><td colspan="6" rowspan="2"></td>'+
                       '<td>' + trev + '</td><td>' + tacc + '</td><td>' + trej + '</td><td>' + tdup + '</td><td>(' + tproz + '%)</td>' +
                       '<td colspan="5" rowspan="2"></td></tr>' +
                       '<td></td><td>' + aproz + '%</td><td>' + rproz + '%</td><td>' + dproz + '%</td><td></td>');
            }


        function buttonFuncs() {
            // Stats
            function _writeLine(stats){
                    let dupes = "undefined" === typeof(stats.duplicated) ? "" : stats.duplicated;
                    body.insertAdjacentHTML("beforeEnd", YMDfromTime(stats.datum) + ';' + stats.reviewed + ';' + stats.accepted + ';' + stats.rejected + ';' + dupes + '<br/>');
            }
            document.getElementById('WFRStatsBtn').addEventListener('click', function(){
                emptyPage("/#mystats");
                if (isChecked) {
                    for (let i = wfrStats.length -1 ; i >= 0 ; i--) {
                            _writeLine(wfrStats[i]);
                    }
                } else {
                    for (let i = 0 ; i < wfrStats.length ; i++) {
                            _writeLine(wfrStats[i]);
                    }
                }
                localSave(lStoreCheck,isChecked);
            });

            // Upgrades
            document.getElementById('WFRSUpgrBtn').addEventListener('click', function(){
                emptyPage("/#myupgrades")
                let myup = JSON.parse(localStorage.getItem(lStoreUpgrades)) || [];
                if (isChecked) {
                    for (let i = myup.length -1 ; i >= 0 ; i--) {
                        body.insertAdjacentHTML("beforeEnd", myup[i].datum + ';' + myup[i].progress + ';' + myup[i].total + '<br/>');
                    }
                } else {
                    for (let i = 0 ; i < myup.length ; i++) {
                        body.insertAdjacentHTML("beforeEnd", myup[i].datum + ';' + myup[i].progress + ';' + myup[i].total + '<br/>');
                    }
                }
                localSave(lStoreCheck,isChecked);
            });

            // Marker Map
            document.getElementById('WFRHeatBtn').addEventListener('click', showMap);

            // Heatmap
            document.getElementById('WFRMarkBtn').addEventListener('click', showMap);

            function showMap() {
                let histText, innerScript = '';
                if ('WFRHeatBtn' === this.id ) {
                    histText = '/#wfrheatmap';
                    innerScript += `
                        function getPoints() {
                        return [`;
                    for (let i = PoGoStats.length - 1; i > PoGoStats.length -501; i--) {
                        // nur die neuesten 500
                        let lat = PoGoStats[i].latE6/1E6;
                        let lng = PoGoStats[i].lngE6/1E6;
                        innerScript += "new google.maps.LatLng("+lat+","+lng+"),";
                        if ( 0 === i) { break; }// weniger geht nicht
                    }
                    innerScript += `]}
                        heatmap = new google.maps.visualization.HeatmapLayer({
                          data: getPoints(),
                          opacity: 0.6,
                          map: map
                        })`;
                } else if ('WFRMarkBtn' === this.id ) {
                    histText = '/#wfrmarker';
                    let iconBase = 'https://icons.iconarchive.com/icons/icons-land/vista-map-markers/32/';

                    for (let i = PoGoStats.length - 1; i > PoGoStats.length -501; i--) {
                        // nur die neuesten 500
                        let lat = PoGoStats[i].latE6/1E6;
                        let lng = PoGoStats[i].lngE6/1E6;
                        let ti1, ti2, ico;
                        let color = 'Azure';
                        ti1 = ti2 = '';
                        if (PoGoStats[i].pogo) { ti2 = 'PoGo'; color = 'Pink' ;}
                        if (PoGoStats[i].hpwu) { ti2 = 'HPWU'; color = 'Chartreuse' ;}

                        switch (PoGoStats[i].typ) {
                            case "EDIT":
                                ti1 = 'Edit';
                                ico = 'Map-Marker-Ball-Right-' + color + '-icon.png';
                                break;
                            case "NEW":
                                switch (PoGoStats[i].subtyp) {
                                    case 0:
                                        ti1 = 'NEW R';
                                        ico = 'Map-Marker-Push-Pin-1-'+color+'-icon.png';
                                        break;
                                    case 1:
                                        ti1 = 'NEW P';
                                        ico = 'Map-Marker-Marker-Outside-'+color+'-icon.png';
                                        break;
                                }
                                break;
                            case "PHOTO":
                                ti1 = 'Photo';
                                ico = 'Map-Marker-Flag-1-Right-' + color + '-icon.png';
                                break;
                            default:
                                ti1 = 'unknowm';
                                ico = 'Map-Marker-Chequered-Flag-Right-' + color + '-icon.png';
                                break;
                        }
                        let title = ti1 + " " + ti2;
                        let icon = iconBase + ico;
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

                let style = document.createElement("style");
                    style.innerHTML= `#map { height: 100%; }
                    html, body { height: 100%; margin: 0; padding: 0;}`;
                head.appendChild(style);

                body.insertAdjacentHTML("afterBegin",'<div id="map"></div>');

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
                script.setAttribute("src",'https://maps.googleapis.com/maps/api/js?key=AIzaSyB8G-1vuHW3Sx8ONsM71G9TzWJHHWXfAf8&libraries=visualization,geometry&callback=initMap');
                body.appendChild(script);
            }
        }

        function showGamesTable() {
                let gamesdiv = document.getElementById('gamesdiv');
                gamesdiv.insertAdjacentHTML("afterBegin",
                    '<table border="2"><colgroup><col width="4%"><col width="19%"><col width="8%"><col width="8%"><col width="8%">' +
                    '<col width="8%"><col width="8%"><col width="8%"><col width="8%"><col width="8%"><col width="14%"></colgroup>' +
                    '<thead><tr><th rowspan="2" colspan="2"></th><th colspan="4">Portaleinreichungen</th>' +
                    '<th rowspan="2" colspan="2">Portal Edits</th><th rowspan="2" colspan="2">Photo</th>' +
                    '<th rowspan="2">gesamt</th></tr><tr><th colspan="2">classic/redacted</th>' +
                    '<th colspan="2">Prime/Pokémon Go</th></tr></thead>' +
                    '<tbody id="gamesTBbody"></tbody></table>');

                let innertable = document.getElementById('gamesTBbody');
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
                                console.warn('PoGoTable: falscher subtyp: ' + PoGoStats[i].subtyp);
                            }
                            break;
                    case "PHOTO":
                        phog++;
                        if (PoGoStats[i].pogo) { phop++; }
                        if (PoGoStats[i].hpwu) { phoh++; }
                        break;
                    default:
                        console.warn(selfname + ' falscher typ: ' + PoGoStats[i].typ);
                }
        }

        let revg = redg + prig + edig + phog;
        let revp = redp + prip + edip + phop;
        let revh = redh + prih + edih + phoh;

        let redpp = redg > 0 ? (100*redp/redg).toFixed(2) : ' -- ';
        let pripp = prig > 0 ? (100*prip/prig).toFixed(2) : ' -- ';
        let edipp = edig > 0 ? (100*edip/edig).toFixed(2) : ' -- ';
        let revpp = revg > 0 ? (100*revp/revg).toFixed(2) : ' -- ';
        let phopp = phog > 0 ? (100*phop/phog).toFixed(2) : ' -- ';

        // Tabelle füllen
        let redgp = revg > 0 ? (100*redg/revg).toFixed(2) : ' -- ';
        let prigp = revg > 0 ? (100*prig/revg).toFixed(2) : ' -- ';
        let edigp = revg > 0 ? (100*edig/revg).toFixed(2) : ' -- ';
        let phogp = revg > 0 ? (100*phog/revg).toFixed(2) : ' -- ';

        innertable.insertAdjacentHTML("beforeEnd", '<tr style="border-top: 2px solid;"><th colspan="2">reviews gesamt </th><td>' + redg + '</td><td>'+redgp+'%</td><td>'+
                         prig + '</td><td>'+prigp+'%</td><td>' + edig + '</td><td>'+edigp+'%</td><td>' + phog + '</td><td>'+phogp+'%</td><td>' + revg + '</td></tr>');

        // PoGo Prozente
        let redgpp = revp > 0 ? (100*redp/revp).toFixed(2) : ' -- ';
        let prigpp = revp > 0 ? (100*prip/revp).toFixed(2) : ' -- ';
        let edigpp = revp > 0 ? (100*edip/revp).toFixed(2) : ' -- ';
        let phogpp = revp > 0 ? (100*phop/revp).toFixed(2) : ' -- ';

        innertable.insertAdjacentHTML("beforeEnd", '<tr style="border-top: 1px solid;"><th></th><th>davon Pokémon </th><td>' + redp + '</td><td>'+redgpp+'%</td><td>'+ prip +
                        '</td><td>'+prigpp+'%</td><td>' + edip + '</td><td>'+edigpp+'%</td><td>' + phop + '</td><td>'+phogpp+'%</td><td>' + revp + '</td></tr>');
        innertable.insertAdjacentHTML("beforeEnd", '<tr><th></th><th>in Prozent </th><th colspan="2">' + redpp + '%</th><th colspan="2">'+ pripp +
                        '%</th><th colspan="2">' + edipp + '%</th><th colspan="2">' + phopp + '%</th><th>' + revpp + '%</th></tr>');

        // HPWU Prozente
        let redhp = redg > 0 ? (100*redh/redg).toFixed(2) : ' -- ';
        let prihp = prig > 0 ? (100*prih/prig).toFixed(2) : ' -- ';
        let edihp = edig > 0 ? (100*edih/edig).toFixed(2) : ' -- ';
        let revhp = revg > 0 ? (100*revh/revg).toFixed(2) : ' -- ';
        let phohp = phog > 0 ? (100*phoh/revg).toFixed(2) : ' -- ';

        let redghp = revh > 0 ? (100*redh/revh).toFixed(2) : ' -- ';
        let prighp = revh > 0 ? (100*prih/revh).toFixed(2) : ' -- ';
        let edighp = revh > 0 ? (100*edih/revh).toFixed(2) : ' -- ';
        let phoghp = revh > 0 ? (100*phoh/revh).toFixed(2) : ' -- ';

        innertable.insertAdjacentHTML("beforeEnd", '<tr style="border-top: 1px solid;"><th></th><th>davon Harry Potter </th><td>' + redh + '</td><td>'+redghp+'%</td><td>'+ prih +
                        '</td><td>'+prighp+'%</td><td>' + edih + '</td><td>'+edighp+'%</td><td>' + phoh + '</td><td>'+phoghp+'%</td><td>' + revh + '</td></tr>');
        innertable.insertAdjacentHTML("beforeEnd", '<tr><th></th><th>in Prozent </th><th colspan="2">' + redhp + '%</th><th colspan="2">'+ prihp +
                        '%</th><th colspan="2">' + edihp + '%</th><th colspan="2">' + phohp + '%</th><th>' + revhp + '%</th></tr>');
     }

    // ---
    addCSS();
    addDivs();
    showStatsTable();
    showGamesTable();
    buttonFuncs();

}

/*******************************************************************************
 * MAIN
 ******************************************************************************/

    // install Event Handlers
    window.addEventListener("WFESReviewPageLoaded", () => {setTimeout(handleReview,2000)});
    window.addEventListener("WFESProfileLoaded", handleProfile);
    window.addEventListener("WFESHomePageLoaded", handleShowcase);

    console.log( "WFES Script loaded: Wayfarer Stats");

/**
 * *** Section Const
 * **************************************************************
 */
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
})();