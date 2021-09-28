// ==UserScript==
// @name         WFES - Base
// @namespace    https://gitlab.com/fotofreund0815/WFES
// @version      0.1.0
// @description  basic functionality for WFES
// @author       fotofreund0815
// @match        https://wayfarer.nianticlabs.com/new/*
// @downloadURL  https://gitlab.com/fotofreund0815/WFES/-/raw/main/wfes-base.user.js
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

	const PREFIX = '/api/v1/vault/';

    window.wfes = {};
    window.wfes.showcase = {};

	// window.wfes.showcase;

	let openOrig = window.XMLHttpRequest.prototype.open,
	    sendOrig = window.XMLHttpRequest.prototype.send;

	function openReplacement(method, url, async, user, password) {
		  this._url = url;
		  console.log( "WFES OPEN: ", method, url );
		  this.addEventListener('load', handleLoadEvent);
		  return openOrig.apply(this, arguments);
		}

	function sendReplacement(data) {
		  if(this.onreadystatechange) {
		    this._onreadystatechange = this.onreadystatechange;
		  }
		  //console.log( "WFES SEND: ", data );
		  //console.dir( data );
		  // this.onreadystatechange = onReadyStateChangeReplacement;
		  return sendOrig.apply(this, arguments);
		}

	function handleLoadEvent(e) {
        let json;
		try {
			const response = this.response;
			switch (this._url) {
				case PREFIX + 'home':
					json = JSON.parse(response);
					window.wfes.showcase.list = json.result.showcase;
					window.dispatchEvent(new Event("WFESHomePageLoaded"));
					break;
			}
		} catch (e)	{
			console.log(e);
		}
	}

	/*
	function onReadyStateChangeReplacement() {
		   // PLACE HERE YOUR CODE FOR READYSTATECHANGE
		  if(this._onreadystatechange) {
		    return this._onreadystatechange.apply(this, arguments);
		  }
		}
	*/

	window.XMLHttpRequest.prototype.open = openReplacement;
	window.XMLHttpRequest.prototype.send = sendReplacement;
	console.log( "WFES BASE loaded");
})();