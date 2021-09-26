// ==UserScript==
// @name         WFES - Showcase
// @namespace    https://gitlab.com/fotofreund0815/WFES
// @version      0.0.0
// @description  WFES Showcase
// @author       fotofreund0815
// @match        https://wayfarer.nianticlabs.com/new/*
// @downloadURL  https://gitlab.com/fotofreund0815/WFES/-/raw/dev/wfes-showcase.user.js
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	function homePageLoaded() {
		console.log( "WFES Showcase Event triggered");
        alert(window.wfes.showcase[0].guid);
	}

    let loadHomeTimerId = null;
    window.addEventListener("WFTHomePageLoad",
    		() => { clearTimeout(loadHomeTimerId); loadHomeTimerId = setTimeout(homePageLoaded,250)});

	console.log( "WFES Showcase loaded");
})();