// ==UserScript==
// @name         WFES - Base
// @namespace    https://gitlab.com/fotofreund0815/WFES
// @version      0.6.2
// @description  basic functionality for WFES
// @author       AlterTobi
// @match        https://wayfarer.nianticlabs.com/*
// @downloadURL  https://github.com/AlterTobi/WFES/raw/main/wfes-base.user.js
// @icon         https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @supportURL   https://github.com/AlterTobi/WFES/issues
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
    window.wfes.edit = {};
    window.wfes.properties = {};

    /* overwrite XHR */

    let openOrig = window.XMLHttpRequest.prototype.open, sendOrig = window.XMLHttpRequest.prototype.send;

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
        try {
            const response = this.response;
            const json = JSON.parse(response) || console
                                 .warn("WFES: failed to parse response from server");
            // ignore captcha
            if (json.captcha) {
                return;
            }
            if ('OK' !== json.code) {
                console.warn("WFES: got no OK from server", response);
            }
            if (!json.result) {
                console.warn("WFES: got no result from server");
                return;
            }

            switch (this._url) {
                case PREFIX + 'home':
                    window.wfes.showcase.list = json.result.showcase;
                    window.dispatchEvent(new Event("WFESHomePageLoaded"));
                    break;
                case PREFIX + 'review':
                    if ('GET' === this._method) {
                        handleReviewData(json.result);
                    }
                    break;
                case PREFIX + 'profile':
                    window.wfes.profile = json.result;
                    window.dispatchEvent(new Event("WFESProfileLoaded"));
                    break;
                case PREFIX + 'manage':
                    // nomination list
                    window.wfes.nominations.list = json.result;
                    window.dispatchEvent(new Event("WFESNominationListLoaded"));
                    break;
                case PREFIX + 'manage/detail':
                    // nomination detail
                    window.wfes.nominations.detail = json.result;
                    window.dispatchEvent(new Event("WFESNominationDetailLoaded"));
                    break;
                case PREFIX + 'properties':
                    window.wfes.properties = json.result;
                    window.dispatchEvent(new Event("WFESPropertiesLoaded"));
                default:
                    break;
            }
        } catch (e) {
            console.warn(e);
        }
    }

    window.XMLHttpRequest.prototype.open = openReplacement;
    window.XMLHttpRequest.prototype.send = sendReplacement;

    /* handle data */

    // Useful to make comparing easier. Essentially this function iterates over
    // all items
    // and uses it's unique ID as key and stores relevant values under that key.
    // This way on checking we can simply find the ID when looking at a current
    // item
    function makeIDbasedDictionary(itemList) {
        let dict = {};
        for (let i = 0; i < itemList.length; i++) {
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
            sessionStorage.setItem(sStoreReview, JSON.stringify(reviewSessionHist));
            window.wfes.review.sessionHist[result.id] = result;
        }

        window.wfes.edit.isEdit = false;

        window.wfes.review.pageData = result;
        switch (window.wfes.review.pageData.type) {
            case 'NEW':
                window.dispatchEvent(new Event("WFESReviewPageNewLoaded"));
                break;
            case 'EDIT':
                window.wfes.edit.isEdit = true;
                window.wfes.edit.what = {};
                window.wfes.edit.what.location = result.locationEdits.length > 1;
                window.wfes.edit.what.description = result.descriptionEdits.length > 0;
                window.wfes.edit.what.title = result.titleEdits.length > 0;
                window.dispatchEvent(new Event("WFESReviewPageEditLoaded"));
                break;
            case 'PHOTO':
                window.dispatchEvent(new Event("WFESReviewPagePhotoLoaded"));
                break;
        }
        window.dispatchEvent(new Event("WFESReviewPageLoaded"));
    }

    /* we are done :-) */
    console.log("WFES Script loaded: BASE");
})();
