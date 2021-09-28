// ==UserScript==
// @name         WFES - Showcase
// @namespace    https://gitlab.com/fotofreund0815/WFES
// @version      0.1.1
// @description  Improve Wayfarer Showcase
// @author       fotofreund0815
// @match        https://wayfarer.nianticlabs.com/new/*
// @downloadURL  https://gitlab.com/fotofreund0815/WFES/-/raw/main/wfes-showcase.user.js
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

    function addCSS(){
    	let myID = 'showcaseCSS';
    	//already there?
    	if ( null === document.getElementById(myID)) {
            let headElem = document.getElementsByTagName("HEAD")[0];
            let customStyleElem = document.createElement("style");
            customStyleElem.setAttribute('id',myID);
            customStyleElem.innerText = `
				.gamelogo{
				  float: left;
				  padding: 5px;
				  width: 30px;
				  height: 30px;
				  background-repeat: no-repeat;
            	}
            	.bgNone {
            		display: none;
            	}  
            	.bgPGO {
            	background-image:  url('data:image/png;base64,
iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAMAAAAM7l6QAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJ\
bWFnZVJlYWR5ccllPAAAAFFQTFRF//////8z/8yZ/8xm/5lm/2Zm/zMzzMzMzMyZzMxmzGZmzDMz\
zDMAmczMmZnMmZmZmTMzmTMAZpnMZpmZZmZmZjMzM2ZmMzMzMwAAADMzAAAAQu3hzgAAAR1JREFU\
eNqc09GSgyAMBdC0QRFRQ6mI8v8fuglQRrednZ3eR4656IBw+zPwb0ZEpRTiR0bVdb3ljKN5Z1XM\
lgfwyth1DZ1zdlQXPunVoTTLcs+p7Fzth1yd0e17sHZ6PB55vrFU9zbEdUvJCYuXengNh00D6Fg8\
11fmb+LmQxR02qepsDOVbQghReBovaWdEwLvrgqPxxG3GGWWuD0eiRNjGAubWUsr8SxQeoJeiNZ1\
OyrfpRbWRFpTijpnnpenOTO7dBYjzjLUD8vvBDCvK9VJYV/5llkegJM+PVa+l/W2K2WmdiQnnpeq\
3jRG+DXKSqfzvkOdbOovl0n81ZsVr3cNhRsO7xfZDDNvvXjvCT/+BmgGosHgV3/JF/wjwACvbhgT\
fnV1HwAAAABJRU5ErkJggg==');
            	}
            	.bgING {
            	background-image:  url('data:image/png;base64,
iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAMAAAAM7l6QAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJ\
bWFnZVJlYWR5ccllPAAAAMBQTFRF7Oby5dvscj2aNQF2hFmp/Pv9WCaOSROFXCySdkCcwavUk2qy\
ZDSWbTuZ8e31e1GlqozDvabRd0uinYC+bDSWnHu7Zi2SWx6LrJPH3dLny7rbiGaw9vP5lHC12c3l\
Rg2CuKHOQAV9tJ3M08XhUhyJbkSeXTCTxLDWURGEsZXJpYzD4dbqYCSO1snji1+syrXZaD2az7/e\
oHu7l3O2pIbA+Pf6p4O/9PD3lna3UBeHWBeHajeY59/ul3i5////////hylKWQAAAEB0Uk5T////\
////////////////////////////////////////////////////////////////////////////\
////AMJ7sUQAAAJKSURBVHjaXNPpcoIwEADgyBFQwiEiiCgQxQAFrVo8OLq+/1s1YFs73R8Mm293\
hyNBj9/oJlftcNCuk9FrDf3cLLUxD8Hpr9r7Py4GHJeuUD4Lwr+cDug2h8KYOI3QJ9MXT/u8bYR3\
QCu0Ontln+c/3PcKXplDJ2iFZ0EnNe53P+cRH1Y2HzfeRivDzfiQk5DxRygGPoydzPQhdhu9tGRH\
dxupgE3pjaWeT0Lr5rAd83qhnPuOIwhec74gyRVSzpLuXUHLotL7E7TcguNID4R0vYlH1D5r68qy\
rueqsubaWsuki+3qBZrqepJ3jbsCCPeIR7c0AGK6NsaunqM57867MlsDCm3qkSizOtko64E1dGjb\
Ou8wqUenBUxcGnTdXL5n5doQ3FZC5pPbWgLcIpTCVIyNjHic1dYceMG7W7o3RJqCKZpgJm0ysI2k\
byYKg5n4gWp6C0W1Z73vvnPgnCRmFAP9MOgMsL6L6p5JgGLOeSHqvqFSsOxOgY1YQSXatyMmFuo4\
W/4cQluN7vLbZHJRMJ7JYdVx9tHDJtEn3HY0IYRuwYcgalkULQBUbPNvnhLMTitNifiYI8CSMoKp\
msqzhMX9D7VJotwvKKA1oVMgNaNJDNsjZTvo2WdEpXjaryj2PFGizxWvVQjbPzdTzPg88biHDRZF\
ao7gTYkYY4ufrWjxhNVUQhcNLyHFFPN89trIG7UviJSZLPv8Hdh37+8x2JqqqjJMj4GiMKaq9unf\
IYqHgkTBHM2N/P+MPR7hIjB3OzN427/WvgQYAPTTeKqgtlNiAAAAAElFTkSuQmCC');
            	}
            	
    `;
            headElem.appendChild(customStyleElem);
    	}
    }

	function showDetails(details) {
		// console.log( "WFES showDetails", details);
		let myDescID = "wfesDescrition";
		let myGameID = "wfesGame";
		
		if ( null === document.getElementById(myDescID)) {
			let descriptionText = document.createElement("div");
			descriptionText.setAttribute('id',myDescID);
			descriptionText.innerText = details.description;
			window.document.getElementsByClassName('showcase-item__title')[0].appendChild(descriptionText);
		} else {
			document.getElementById(myDescID).innerText = details.description;
		}

		let userBox = window.document.getElementsByClassName('showcase-item__image-caption nightwind-prevent')[0];
		let klasse = null;

		if (null === document.getElementById(myGameID)) {
			let gameLogo = document.createElement("div");
			gameLogo.setAttribute('id',myGameID);
			userBox.appendChild(gameLogo);
		}
		
		switch (details.discovererGame) {
			case '': // no logo
				klasse = 'bgNone';
				break;
			case 'Pokémon GO':
				klasse = 'gamelogo bgPGO';
				break;
			case 'Ingress':
				klasse = 'gamelogo bgING';
				break;
		}
		document.getElementById(myGameID).setAttribute("class", klasse);
	}

	function homePageLoaded() {
		// console.log( "WFES Showcase Event triggered");
		addCSS();

		showDetails(window.wfes.showcase.list[0]);

		let buttons = window.document.getElementsByClassName('wf-button showcase-gallery__button wf-button--icon ng-star-inserted');
		for (let i=0; i < buttons.length; i++) {
			buttons[i].addEventListener('click', () => setTimeout(()=>{
				let myDetail = window.document.getElementsByTagName('app-showcase-item')[0].__ngContext__[29];
				showDetails(myDetail);
				},100));
		}
	}

    let loadHomeTimerId = null;
    window.addEventListener("WFESHomePageLoaded",
    		() => { clearTimeout(loadHomeTimerId); loadHomeTimerId = setTimeout(homePageLoaded,250)});

	console.log( "WFES Showcase loadeded");
})();