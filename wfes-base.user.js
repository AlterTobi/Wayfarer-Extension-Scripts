// ==UserScript==
// @name         WFES - Base
// @namespace    https://gitlab.com/fotofreund0815/WFES
// @version      0.0.0
// @description  basic functionality for WFES
// @author       AlterTobi
// @match        https://wayfarer.nianticlabs.com/new/*
// @downloadURL  https://gitlab.com/fotofreund0815/WFES/-/raw/dev/wfes-base.user.js
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

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
		  /**
		   * PLACE HERE YOUR CODE WHEN REQUEST IS SENT
		   */
		  console.log( "WFES SEND: ", this.responseText );
		  console.dir( this );
		  // this.onreadystatechange = onReadyStateChangeReplacement;
		  return sendOrig.apply(this, arguments);
		}

	function handleLoadEvent(e) {
		try {
			const response = this.response;
			  console.log( "WFES LOADEVENT --> ", response );
			  console.dir( response );
		} catch (e)	{
			console.log(e);
		}
	}

	/*
	function parseNominations(e) {
		try {
			const response = this.response;
			const json = JSON.parse(response);
			sentNominations = json && json.result;
			if (!sentNominations) {
				logMessage('Failed to parse nominations from Wayfarer');
				return;
			}
			analyzeCandidates();

		} catch (e)	{
			console.log(e); // eslint-disable-line no-console
		}

	}

	function onReadyStateChangeReplacement() {
		   // PLACE HERE YOUR CODE FOR READYSTATECHANGE
		  if(this._onreadystatechange) {
		    return this._onreadystatechange.apply(this, arguments);
		  }
		}
	*/

	window.XMLHttpRequest.prototype.open = openReplacement;
	window.XMLHttpRequest.prototype.send = sendReplacement;

})();