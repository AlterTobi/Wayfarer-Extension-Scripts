// ==UserScript==
// @name         WFES - Base
// @namespace    https://gitlab.com/fotofreund0815/WFES
// @version      0.4.0
// @description  basic functionality for WFES
// @author       fotofreund0815
// @match        https://wayfarer.nianticlabs.com/*
// @downloadURL  https://github.com/AlterTobi/WFES/raw/main/wfes-base.user.js
// @grant        none
// ==/UserScript==

(function() {
	'use strict';

/* WFES data structures */
	const PREFIX = '/api/v1/vault/';
	const sStoreReview = 'wfes_Reviews';

    window.wfes = {};
    window.wfes.showcase = {};
    window.wfes.review = {};
    window.wfes.review.decision = {};
    window.wfes.profile = {};
    window.wfes.nominations = {};

/* overwrite XHR */

    let openOrig = window.XMLHttpRequest.prototype.open,
	    sendOrig = window.XMLHttpRequest.prototype.send;

	function openReplacement(method, url, async, user, password) {
		  this._url = url;
		  this._method = method;
		  // console.log( "WFES OPEN: ", method, url );
		  this.addEventListener('load', handleLoadEvent);
		  return openOrig.apply(this, arguments);
	}

	function sendReplacement(daten) {
		let candidate, json;
		// handle only POST requests
		if ('POST' === this._method) {
			  switch (this._url) {
			  	case PREFIX + 'review':
                    json = JSON.parse(daten);
			  		candidate = window.wfes.review.sessionHist[json.id];
			  		window.wfes.review.decision.candidate = candidate;
			  		window.wfes.review.decision.decision = json;
			  		window.dispatchEvent(new Event("WFESReviewDecisionSent"));
			  		break;
			  	case PREFIX + 'skip':
			  		json = JSON.parse(daten);
			  		candidate = window.wfes.review.sessionHist[json.id];
			  		window.wfes.review.decision.candidate = candidate;
			  		json.skipped = true;
			  		window.wfes.review.decision.decision = json;
			  		window.dispatchEvent(new Event("WFESReviewDecisionSent"));
			  		break;
			  	default:
			  		break;
			  }
		}
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
				case PREFIX + 'review':
					if ('GET' === this._method) {
						json = JSON.parse(response);
						handleReviewData(json.result);
					}
					break;
				case PREFIX + 'profile':
				    json = JSON.parse(response);
				    if ('OK' === json.code) {
				        window.wfes.profile = json.result;
				        window.dispatchEvent(new Event("WFESProfileLoaded"));
				    } else {
				        console.log('WFES profile load error', response);
				    }
				    break;
				case PREFIX + 'manage':
                                    // nomination list
				    json = JSON.parse(response);
                                    if ('OK' === json.code) {
                                        window.wfes.nominations.list = json.result;
                                        window.dispatchEvent(new Event("WFESNominationListLoaded"));
                                    } else {
                                        console.log('WFES nomination list load error', response);
                                    }
				    break;
				case PREFIX + 'detail':
				    // nomination detail
                                    json = JSON.parse(response);
                                    if ('OK' === json.code) {
                                        window.wfes.nominations.detail = json.result;
                                        window.dispatchEvent(new Event("WFESNominationDetailLoaded"));
                                    } else {
                                        console.log('WFES nomination detail load error', response);
                                    }
				    break;
				default:
					break;
			}
		} catch (e)	{
			console.warn(e);
		}
	}

	window.XMLHttpRequest.prototype.open = openReplacement;
	window.XMLHttpRequest.prototype.send = sendReplacement;

/* handle data */

	//Useful to make comparing easier. Essentially this function iterates over all items
	//and uses it's unique ID as key and stores relevant values under that key.
	//This way on checking we can simply find the ID when looking at a current item
	function makeIDbasedDictionary(itemList){
		let dict = {};
		for (let i = 0; i < itemList.length; i++){
			let item = itemList[i];
			dict[item.id] = item;
		}
		return dict;
	}

	function handleReviewData(result) {
		// save review data in ...pagedata and sessionstore
		let reviewSessionHist = JSON.parse(sessionStorage.getItem(sStoreReview)) || []
		window.wfes.review.sessionHist = makeIDbasedDictionary(reviewSessionHist);

		if (undefined === window.wfes.review.sessionHist[result.id]) {
			reviewSessionHist.push(result);
			sessionStorage.setItem(sStoreReview,JSON.stringify(reviewSessionHist));
			window.wfes.review.sessionHist[result.id] = result;
		}

		window.wfes.review.pageData = result;
		window.dispatchEvent(new Event("WFESReviewPageLoaded"));
	}

/* we are done :-) */
	console.log( "WFES BASE loaded");
})();
