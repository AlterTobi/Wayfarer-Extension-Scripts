// ==UserScript==
// @name        WFR Stats
// @version     0.4.4
// @description save Wayfarer statistics in local browser storage
// @author      https://gitlab.com/fotofreund0815
// @match       https://wayfarer.nianticlabs.com/*
// @grant       none
// @downloadURL https://gitlab.com/fotofreund0815/opr-stats/raw/wayfarernew/wfr-stats.user.js
// @updateURL   https://gitlab.com/fotofreund0815/opr-stats/raw/wayfarernew/wfr-stats.user.js
// @supportURL  https://gitlab.com/fotofreund0815/opr-stats/issues
// @homepageURL https://gitlab.com/fotofreund0815/opr-stats
// ==/UserScript==

(function () {
    'use strict'
    const selfname = 'WFRStats'
	const maincount = 14

	// define names
	const lStoreStats = selfname+'_Stats'
	const lStorePogo = selfname+'_PoGoCount'
	const lStoreCheck = selfname+'_IsChecked'
	const lStoreUpgrades = selfname+'_myUpgrades'

	const rx = /https:\/\/wayfarer.nianticlabs.com\/new\/(\w+)/

  	// get Values from localStorage
	let PoGoStats = JSON.parse(localStorage.getItem(lStorePogo)) || []
	let wfrStats = JSON.parse(localStorage.getItem(lStoreStats)) || []
	let isChecked = JSON.parse(localStorage.getItem(lStoreCheck)) || false

    let body = document.getElementsByTagName('body')[0]
    let head = document.getElementsByTagName('head')[0]

	function localSave(name,content){
		let json = JSON.stringify(content)
		localStorage.setItem(name,json)
	}

    // show Stats Tables
    function displayStats() {
        let section = document.getElementsByClassName('showcase')[0];

        addCSS();
		addDivs();
		showStatsTable();
		// showGamesTable();
		buttonFuncs();

		function addCSS() {
	    	let CSS = `
	    		th { text-align: center; }
	    		td, th { padding: 5px; }
	    		td { text-align: right; }
	    		table { margin-top: 10px; font-family: monospace
	    			background-color: #2d2d2d; width: 100%; }
	    		#reversebox { margin: 0 10px; }
	    		#buttonsdiv button { margin: 0 10px; }
	    		#buttonsdiv, #statsdiv, #gamesdiv { margin-bottom: 2em; }
	    		`

	   		let head = document.getElementsByTagName("head")[0]
	    	if (!head) return
	    	let style = document.createElement("style")
	    	style.type = "text/css"
	    	style.innerHTML = CSS
	    	head.appendChild(style)
	    }

		function addDivs() {
			let cText = isChecked ? 'checked' : ''
			section.insertAdjacentHTML("beforeEnd",
					'<div id="statsdiv"></div>' +
					'<div id="gamesdiv"></div>' +
					'<div id="buttonsdiv" class="pull-right">reverse: <input type="checkbox" id="reversebox" ' + cText + '/>' +
					'<button class="button-primary" id="WFRStatsBtn">show my stats</button></div>' 
					)
		}

		function buttonFuncs() {
			// Stats
			function _writeLine(stats){
				let dupes = "undefined" === typeof(stats.duplicated) ? "" : stats.duplicated
				body.insertAdjacentHTML("beforeEnd", YMDfromTime(stats.datum) + ';' + stats.reviewed + ';' + stats.accepted + ';' + stats.rejected + ';' + dupes + '<br/>')
			}
			document.getElementById('WFRStatsBtn').addEventListener('click', function(){
				emptyPage("/#mystats")
				if (isChecked) {
			        for (let i = wfrStats.length -1 ; i >= 0 ; i--) {
			        	_writeLine(wfrStats[i])
			        }
				} else {
			        for (let i = 0 ; i < wfrStats.length ; i++) {
			        	_writeLine(wfrStats[i])
			        }
				}
			    localSave(lStoreCheck,isChecked)
			})
		}

		function showGamesTable() {
			let gamesdiv = document.getElementById('gamesdiv')
	    	gamesdiv.insertAdjacentHTML("afterBegin",
	    			'<table border="2"><colgroup><col width="4%"><col width="19%"><col width="8%"><col width="8%"><col width="8%">' +
	    			'<col width="8%"><col width="8%"><col width="8%"><col width="8%"><col width="8%"><col width="14%"></colgroup>' +
	    			'<thead><tr><th rowspan="2" colspan="2"></th><th colspan="4">Portaleinreichungen</th>' +
	    			'<th rowspan="2" colspan="2">Portal Edits</th><th rowspan="2" colspan="2">Photo</th>' +
	    			'<th rowspan="2">gesamt</th></tr><tr><th colspan="2">classic/redacted</th>' +
	    			'<th colspan="2">Prime/Pokémon Go</th></tr></thead>' +
	    			'<tbody id="gamesTBbody"></tbody></table>')

	    	let innertable = document.getElementById('gamesTBbody')
	    	let redg, redp, prig, prip, edig, edip, edih, redh, prih, phog, phop, phoh
	    	redg = redp = prig = prip = edig = edip = edih = redh = prih = phog = phop = phoh = 0

	    	// Zählen
	    	for (let i = 0; i < PoGoStats.length; i++) {
	    		switch (PoGoStats[i].typ) {
	    			case "EDIT":
	    				edig++
	    				if (PoGoStats[i].pogo) { edip++ }
	    				if (PoGoStats[i].hpwu) { edih++ }
	    				break
	    			case "NEW":
	    				switch (PoGoStats[i].subtyp) {
	    					case 0:
	    						redg++
	    						if (PoGoStats[i].pogo) { redp++ }
	    						if (PoGoStats[i].hpwu) { redh++ }
	    						break
	    					case 1:
	    						prig++
	    						if (PoGoStats[i].pogo) { prip++ }
	    						if (PoGoStats[i].hpwu) { prih++ }
	    						break
	    					default:
	    						console.warn('PoGoTable: falscher subtyp: ' + PoGoStats[i].subtyp)
	    				}
	    				break
	    			case "PHOTO":
	    				phog++
	    				if (PoGoStats[i].pogo) { phop++ }
	    				if (PoGoStats[i].hpwu) { phoh++ }
	    				break
	    			default:
	    				console.warn(selfname + ' falscher typ: ' + PoGoStats[i].typ)
	    		}
	    	}

	    	let revg = redg + prig + edig + phog
	    	let revp = redp + prip + edip + phop
	    	let revh = redh + prih + edih + phoh

	       	let redpp = redg > 0 ? (100*redp/redg).toFixed(2) : ' -- '
	    	let pripp = prig > 0 ? (100*prip/prig).toFixed(2) : ' -- '
	    	let edipp = edig > 0 ? (100*edip/edig).toFixed(2) : ' -- '
	    	let revpp = revg > 0 ? (100*revp/revg).toFixed(2) : ' -- '
	    	let phopp = phog > 0 ? (100*phop/phog).toFixed(2) : ' -- '

	    	// Tabelle füllen
	    	let redgp = revg > 0 ? (100*redg/revg).toFixed(2) : ' -- '
	    	let prigp = revg > 0 ? (100*prig/revg).toFixed(2) : ' -- '
	    	let edigp = revg > 0 ? (100*edig/revg).toFixed(2) : ' -- '
	    	let phogp = revg > 0 ? (100*phog/revg).toFixed(2) : ' -- '

	    	innertable.insertAdjacentHTML("beforeEnd", '<tr style="border-top: 2px solid;"><th colspan="2">reviews gesamt </th><td>' + redg + '</td><td>'+redgp+'%</td><td>'+
	    			prig + '</td><td>'+prigp+'%</td><td>' + edig + '</td><td>'+edigp+'%</td><td>' + phog + '</td><td>'+phogp+'%</td><td>' + revg + '</td></tr>')

	    	// PoGo Prozente
	    	let redgpp = revp > 0 ? (100*redp/revp).toFixed(2) : ' -- '
	    	let prigpp = revp > 0 ? (100*prip/revp).toFixed(2) : ' -- '
	    	let edigpp = revp > 0 ? (100*edip/revp).toFixed(2) : ' -- '
	    	let phogpp = revp > 0 ? (100*phop/revp).toFixed(2) : ' -- '

	    	innertable.insertAdjacentHTML("beforeEnd", '<tr style="border-top: 1px solid;"><th></th><th>davon Pokémon </th><td>' + redp + '</td><td>'+redgpp+'%</td><td>'+ prip +
	    			'</td><td>'+prigpp+'%</td><td>' + edip + '</td><td>'+edigpp+'%</td><td>' + phop + '</td><td>'+phogpp+'%</td><td>' + revp + '</td></tr>')
	    	innertable.insertAdjacentHTML("beforeEnd", '<tr><th></th><th>in Prozent </th><th colspan="2">' + redpp + '%</th><th colspan="2">'+ pripp +
	    			'%</th><th colspan="2">' + edipp + '%</th><th colspan="2">' + phopp + '%</th><th>' + revpp + '%</th></tr>')

	    	// HPWU Prozente
	       	let redhp = redg > 0 ? (100*redh/redg).toFixed(2) : ' -- '
	    	let prihp = prig > 0 ? (100*prih/prig).toFixed(2) : ' -- '
	    	let edihp = edig > 0 ? (100*edih/edig).toFixed(2) : ' -- '
	    	let revhp = revg > 0 ? (100*revh/revg).toFixed(2) : ' -- '
    		let phohp = phog > 0 ? (100*phoh/revg).toFixed(2) : ' -- '

	    	let redghp = revh > 0 ? (100*redh/revh).toFixed(2) : ' -- '
	       	let prighp = revh > 0 ? (100*prih/revh).toFixed(2) : ' -- '
	       	let edighp = revh > 0 ? (100*edih/revh).toFixed(2) : ' -- '
	       	let phoghp = revh > 0 ? (100*phoh/revh).toFixed(2) : ' -- '

	    	innertable.insertAdjacentHTML("beforeEnd", '<tr style="border-top: 1px solid;"><th></th><th>davon Harry Potter </th><td>' + redh + '</td><td>'+redghp+'%</td><td>'+ prih +
	    			'</td><td>'+prighp+'%</td><td>' + edih + '</td><td>'+edighp+'%</td><td>' + phoh + '</td><td>'+phoghp+'%</td><td>' + revh + '</td></tr>')
	    	innertable.insertAdjacentHTML("beforeEnd", '<tr><th></th><th>in Prozent </th><th colspan="2">' + redhp + '%</th><th colspan="2">'+ prihp +
	    			'%</th><th colspan="2">' + edihp + '%</th><th colspan="2">' + phohp + '%</th><th>' + revhp + '%</th></tr>')
	    }

		function showStatsTable() {
			// Stats - Tabelle

			let end = Math.max(0, wfrStats.length - maincount)
			let week = Math.min(7, wfrStats.length - 1)

			// Tabelle für die Statistik
			document.getElementById('statsdiv').insertAdjacentHTML("beforeEnd", '<table border="2"><thead><tr><th></th><th colspan="5">total</th><th colspan="5">yesterday</th><th colspan="5">last ' + week + ' days (sliding window)</th></tr>'+
					'<tr style="border-bottom: 1px solid;"><th>date</th><th>reviewed</th><th>created</th><th>rejected</th><th>dup</th><th>%</th><th>reviewed</th><th>created</th><th>rejected</th><th>dup</th><th>%</th><th>reviewed</th><th>created</th><th>rejected</th><th>dup</th><th>%</th></tr></thead>'+
					'<tbody id="statstablebody"></tbody></table>')
			let innertable = document.getElementById("statstablebody")

			// Statistik einfügen
			let gproz, grev, gacc, grej, gdup, wproz, wrev, wacc, wrej, wdup, tproz, agr, aproz, rproz, dproz, trev, tacc, trej, tdup
			trev = tacc = trej = tdup = 0

			for (var i = wfrStats.length - 1; i >= end; i--) {
		       let ymd = YMDfromTime(wfrStats[i].datum)

		       let prozent = wfrStats[i].reviewed > 0 ? 100*(wfrStats[i].accepted + wfrStats[i].rejected + wfrStats[i].duplicated)/ wfrStats[i].reviewed : 0
		       if (i > 0) {
		    	   grev = wfrStats[i].reviewed - wfrStats[i-1].reviewed
		           gacc = wfrStats[i].accepted - wfrStats[i-1].accepted
		           grej = wfrStats[i].rejected - wfrStats[i-1].rejected
		           gdup = wfrStats[i].duplicated - wfrStats[i-1].duplicated
		           gproz = grev > 0 ? (100*(gacc+grej+gdup)/grev).toFixed(2) : ' -- '
		           trev += grev
		           tacc += gacc
		           trej += grej
		           tdup += gdup
		       } else {
		    	   gproz = grev = gacc = grej = gdup = ' -- '
		       }
		       if (i > week-1) {
		    	   wrev = wfrStats[i].reviewed - wfrStats[i-week].reviewed
		           wacc = wfrStats[i].accepted - wfrStats[i-week].accepted
		           wrej = wfrStats[i].rejected - wfrStats[i-week].rejected
		           wdup = wfrStats[i].duplicated - wfrStats[i-week].duplicated
		           wproz = wrev > 0 ? (100*(wacc+wrej+wdup)/wrev).toFixed(2) : ' -- '
		       } else {
		    	   wproz = wrev = wacc = wrej = wdup = ' -- '
		       }
		       innertable.insertAdjacentHTML("beforeEnd", '<tr><td>' + ymd +'</td><td>' + wfrStats[i].reviewed + '</td><td>'+
		    		   wfrStats[i].accepted + '</td><td>' + wfrStats[i].rejected + '</td><td>' + wfrStats[i].duplicated + '</td><td>' + prozent.toFixed(2) + '%</td>'+
		    		   '<td>' + grev + '</td><td>' + gacc + '</td><td>' + grej + '</td><td>' + gdup + '</td><td>(' + gproz + '%)</td>' +
		    		   '<td>' + wrev + '</td><td>' + wacc + '</td><td>' + wrej + '</td><td>' + wdup + '</td><td>(' + wproz + '%)</td></tr>')
		    }
			tproz = trev > 0 ? (100*(tacc+trej+tdup)/trev).toFixed(2) : ' -- '
			agr = tacc+trej+tdup
			aproz = agr > 0 ? (100*tacc/agr).toFixed(2) : ' -- '
			rproz = agr > 0 ? (100*trej/agr).toFixed(2) : ' -- '
			dproz = agr > 0 ? (100*tdup/agr).toFixed(2) : ' -- '

		    innertable.insertAdjacentHTML("beforeEnd", '<tr style="border-top: 2px solid;"><td colspan="6" rowspan="2"></td>'+
		 		   '<td>' + trev + '</td><td>' + tacc + '</td><td>' + trej + '</td><td>' + tdup + '</td><td>(' + tproz + '%)</td>' +
		 		   '<td colspan="5" rowspan="2"></td></tr>' +
		 		   '<td></td><td>' + aproz + '%</td><td>' + rproz + '%</td><td>' + dproz + '%</td><td></td>')
	    }
    }

    function wfrstats() {
		var heute, last, ut

		// nur tun, wenn heute noch nicht und Stunde > 3
		let jetzt = new Date()
		let stunde = jetzt.getHours()

	    if (stunde < 3) {
	        heute = new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate()-1 )
	    } else {
	        heute = new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate() )
	    }

	    let heuteTS = heute.getTime()

		if (wfrStats.length > 0) {
			last = wfrStats[wfrStats.length-1].datum
		} else {
			last = 0
		}

		if (heuteTS > last) {

			console.log(selfname + ' saving stats')

			const stats = window.document.getElementsByTagName("app-profile-stats")[0]
			const reviewed = parseInt(stats.children[0].children[0].children[1].innerText)
			const accepted = parseInt(stats.children[0].children[2].children[1].innerText)
			const rejected = parseInt(stats.children[0].children[3].children[1].innerText)
            const duplicated = parseInt(stats.children[0].children[4].children[1].innerText)

			if ( last > 0 ) {
				// nur wenn schon gespeicherte Werte vorhanden.
				let einTag = 24*60*60*1000; // milliseconds

				let letzter = new Date()
	            letzter.setTime(last)
				let letzterTS = new Date(letzter.getFullYear(), letzter.getMonth(), letzter.getDate()).getTime()

				while ( (heuteTS - letzterTS) > einTag ) {
					letzterTS += einTag
					var curstats = {'datum':letzterTS,'reviewed':reviewed,'accepted':accepted,'rejected':rejected,'duplicated':duplicated}
					wfrStats.push(curstats)
				}
			}

	        if (stunde > 3) {
	            ut = jetzt.getTime()
	        } else {
	            ut = heuteTS
	        }

			curstats = {'datum':ut,'reviewed':reviewed,'accepted':accepted,'rejected':rejected,'duplicated':duplicated}

		    wfrStats.push(curstats)
		    localSave(lStoreStats,wfrStats)

		} else {
			console.log('stats already saved today')
		}
	}

    function YMDfromTime(time){
        let curdate = new Date()
        curdate.setTime(time)

        let Jahr = curdate.getFullYear().toString(),
            Monat = ('0' + ( 1 + curdate.getMonth())).slice(-2),
            Tag = ('0' + curdate.getDate()).slice(-2)

        let ymd = Tag + '.' + Monat + '.' + Jahr
        return ymd
    }

    function emptyPage(histText){
        // fake history Eintrag (wegen zurückbutton)
        var stateObj = {info: "fake Chronik"}
        history.pushState(stateObj, "wfr main page", histText)
        window.addEventListener('popstate', function(){
            location.reload()
        })

        let reverse = document.getElementById('reversebox') || false
        isChecked = reverse.checked

        // Body leeren
        body.innerHTML = null

        // styles & Co. entfernen
        let removables = ['script','style','link']
        for (let r of removables){
        	let rms = head.getElementsByTagName(r)
	        while (rms.length > 0){
	        	head.removeChild(rms[0])
	        }
        }

        let fav = document.createElement("link")
		fav.setAttribute("rel","shortcut icon")
		fav.setAttribute("href","/imgpub/favicon.ico")
		head.appendChild(fav)
    }

	function upgrades() {
		/* die Upgrades zählen */
		console.log(selfname + ' zähle Upgrades')
		let myWFRupgrades = JSON.parse(localStorage.getItem(lStoreUpgrades)) || []

		let scope = window.angular.element(document.getElementById("ProfileController")).scope()
		if (null !== scope) {
			let progress = scope.profileCtrl.profile.progress
			let total = scope.profileCtrl.profile.total
			let lastProgress = 0
			let lastTotal = 0

			if (myWFRupgrades.length > 0) {
				lastProgress = myWFRupgrades[myWFRupgrades.length-1].progress
				lastTotal = myWFRupgrades[myWFRupgrades.length-1].total
			}

			if ((total != lastTotal ) || (progress!=lastProgress)) {
				let ut = new Date().getTime()
				let curstats = {'datum':ut,'progress':progress,'total':total}
				myWFRupgrades.push(curstats)
				localSave(lStoreUpgrades,myWFRupgrades)
			}
		} else {
			console.log('wfr-stats: kein scope auf upgrade page')
		}
	}

	/* PoGO und HPWU zählen */
    function checkGames() {

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
        	]
        let HPWUArr = [
        	'Gasthaus',
    		'Festung',
    		'Gewächshaus',
    		'Wizard',
    		'Potter'
    		]

    	function pruefeText(text, arr, was){
        	let hasText = false
            for (let p of arr) {
                let r = new RegExp(p,'im')
                if (r.test(text)) {
                	hasText = true
                	break // den Rest können wir uns sparen :-)
                }
            }
            if (hasText) {
                console.log(selfname + ' ERGEBNIS: ' + was + ' gefunden')
            } else {
            	console.log(selfname + ' ERGEBNIS: ' + was + ' frei :-)')
            }
            return (hasText)
    	}
    	function set_warning(image) {
            let elem = window.document.querySelector("div.answer-header")
    		elem.insertAdjacentHTML('beforeEnd', '<img style="width: 64px;height: 64px;" src="' + image + '">')
    	}

        const scope = window.angular.element(document.getElementById("ReviewController")).scope()
        const subController = scope.reviewCtrl
        const newPortalData = subController.pageData

        let statement = newPortalData.statement === undefined ? "" : newPortalData.statement.trim()
        let type = subController.reviewType
        let subtype = 0
        let usertext = statement + ' ' +
        	newPortalData.title + ' ' +
        	newPortalData.description

        if ( ('NEW' == type) && ("" !== statement) ) {
        	subtype = 1
        }

        if ( 'EDIT' == type ) {
            for (let d of newPortalData.descriptionEdits) {
            	usertext += ' ' + d.value
            }
            for (let t of newPortalData.titleEdits) {
            	usertext += ' ' + t.value
            }
        }

        if (usertext !== "") {
        	let hasPoketext = pruefeText(usertext, pokeArr, 'Pokémon')
        	let hasHPWUtext = pruefeText(usertext, HPWUArr, 'HPWU')

            // Statistik speichern
            let jetzt = new Date()
            let curstats = {
            		'datum' : jetzt.getTime(),
            		'typ' : type,
            		'subtyp' : subtype,
            		'pogo' : hasPoketext,
            		'hpwu' : hasHPWUtext,
            		'latE6' : newPortalData.lat * 1E6,
            		'lngE6' : newPortalData.lng * 1E6,
            		'titel' : newPortalData.title
            		}
            PoGoStats.push(curstats)
    	    let jsonstats = JSON.stringify(PoGoStats)
    	    localStorage.setItem(lStorePogo,jsonstats)
    	    if (hasPoketext){
    	    	set_warning(WARN_POGO)
    	    }
    	    if (hasHPWUtext){
    	    	set_warning(WARN_HPWU)
    	    }

        } else {
            console.warn(selfname + ' kein Text - das ist ein Bug')
        }
    }

    function isLoggedIn() {
    	// @TODO Abwesenheit des app-login Tags ist kein gute Indikator fürs Eingeloggtsein
    	if (window.document.getElementsByTagName('app-login').length > 0) {
    		return false;
    	} else {
    		return true;
    	}
    }

    function menuClicks() {
        console.log(selfname + ' menuClicks()');
    	// @TODO auf location-Änderung prüfen
    	// nach 1 Sekunde sollte es geladen sein....
    	var handleMain = setTimeout(main, 1000);
    }

    function main() {
        console.log(selfname + ' main()');
    	let treffer = rx.exec(document.location.href);
		if (null !== treffer) {
			console.log(selfname + ' ' + treffer[1]);
			switch (treffer[1]) {
			    case "review":
			    	// auf Pogo oder HPWU prüfen
			    	// window.setTimeout(checkGames,10000) // 10 Sekunden sollten reichen
			        break;
			    case "profile":
			    	wfrstats();
					// window.setTimeout(upgrades,5000) // Werte können derzeit nicht ausgelesen werden
			        break
			    case "showcase":
					console.log(selfname + ' mainpage');
					displayStats();
					break;
			    default:
			        console.log(selfname + ' unknown URL: ' + treffer[1]);
			        break;
			}
		} else {
			console.log(selfname + ' unknown page');
		}
    }

/*********************************************************************************
*										MAIN
**********************************************************************************/
    function init() {
        console.log(selfname + ' init()');
    	// aufs Angular warten...
    	let tryNumber = 10;
    	const initWatcher = setInterval(() => {
    		if (tryNumber === 0) {
    			clearInterval(initWatcher);
    			console.warn(selfname + ' Angular not initialised. Aborting');
    			return;
    		}
            try {
                if (window.getAllAngularRootElements().length > 0) {
                    // maincode hier rein
                    if ( isLoggedIn() ) {
                        // weil wir keine einzelnen Seitenaufrufe mehr haben, müssen wir tricksen
                        // klicks im Menü abfangen
                    	if (0 == document.getElementsByTagName('app-sidebar').length) {
                    		throw "no_sidebar";
                    	}
                        var clickhandler = document.getElementsByTagName('app-sidebar')[0].addEventListener('click', menuClicks);
                        setTimeout(main, 1000);
                    } else {
                        console.log(selfname + ' not logged in');
                    }
                    clearInterval(initWatcher);
                }
            } catch (e) {
            	if ("no_sidebar" == e) {
            		console.log(selfname + ' - no sidebar # ' + e);
            		tryNumber--;
            		return;
            	}
                console.log(selfname + ' # ' + e);
            }
          tryNumber--;
    	  }, 1000);
    }

setTimeout(() => {
    console.log(selfname + ' Userscript loaded');
	init();
}, 500)

/***** Section Const ***************************************************************/
const WARN_HPWU = `data:image/png;base64,
iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAMAAAAM7l6QAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJ
bWFnZVJlYWR5ccllPAAAAEJQTFRF///////M//+Z//9m//8z/8yZ/5mZzJlmzGZmzGYzzDMzmWZm
mWYzmTMAZmYzZjMzZjMAZgAAMzMzMzMAMwAAAAAAXZu2egAAAThJREFUeNqck9tywyAMROW4QmCE
hZHz/7/axZfGaTKdTvaFGR+0uiDT15+if2M69B4TS1LVFInGF3yjVGp1aKnp4UAnLdWbHypxeMKg
3h7y5eQbHqlcIW4ucntgODfzFbYGOoP7wuOJKXbqImIA+1HT8IOLNW/Ms3C/lTtuNRx4pApLGfRu
HJBAgiHJIrTj7u3GrKsFNpvvIQPX+A7rqlndkE1PnHpluzmrSZAZ3Msl2rZwYbY5Z96wXjHaziKB
5/UueYU5Jn9WXoBNbUVz5jPnnruele995yHf9abeAsbSrBX6wamg0EGUxZtFYfXD+5j5hFkrpum9
CEPlR/CBpdv3F9mEkZZIl/eGvTU7BTrR07ZQnPrnHVpJ9GvXCAZli60IpZdNHYlimqbp/aZeFn38
6C/5AH8LMADPWh06LhCQOwAAAABJRU5ErkJggg==`

const WARN_POGO = `data:image/png;base64,
iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAMAAAAM7l6QAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJ
bWFnZVJlYWR5ccllPAAAAFFQTFRF//////8z/8yZ/8xm/5lm/2Zm/zMzzMzMzMyZzMxmzGZmzDMz
zDMAmczMmZnMmZmZmTMzmTMAZpnMZpmZZmZmZjMzM2ZmMzMzMwAAADMzAAAAQu3hzgAAAR1JREFU
eNqc09GSgyAMBdC0QRFRQ6mI8v8fuglQRrednZ3eR4656IBw+zPwb0ZEpRTiR0bVdb3ljKN5Z1XM
lgfwyth1DZ1zdlQXPunVoTTLcs+p7Fzth1yd0e17sHZ6PB55vrFU9zbEdUvJCYuXengNh00D6Fg8
11fmb+LmQxR02qepsDOVbQghReBovaWdEwLvrgqPxxG3GGWWuD0eiRNjGAubWUsr8SxQeoJeiNZ1
OyrfpRbWRFpTijpnnpenOTO7dBYjzjLUD8vvBDCvK9VJYV/5llkegJM+PVa+l/W2K2WmdiQnnpeq
3jRG+DXKSqfzvkOdbOovl0n81ZsVr3cNhRsO7xfZDDNvvXjvCT/+BmgGosHgV3/JF/wjwACvbhgT
fnV1HwAAAABJRU5ErkJggg==`
})()
