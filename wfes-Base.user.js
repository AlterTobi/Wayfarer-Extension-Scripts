// ==UserScript==
// @name         WFES - Base
// @namespace    https://github.com/AlterTobi/WFES/
// @version      1.0.0
// @description  basic functionality for WFES
// @author       AlterTobi
// @match        https://wayfarer.nianticlabs.com/*
// @downloadURL  https://github.com/AlterTobi/WFES/raw/feature/immutable/wfes-Base.user.js
// @icon         https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @supportURL   https://github.com/AlterTobi/WFES/issues
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    /* WFES data structures */
    const PREFIX = '/api/v1/vault/';
    const sStoreReview = 'wfes_Reviews';
    const sStoreNominationsDetails = 'wfes_nominationDetails';

    window.wfes = {};
    window.wfes.showcase = {};
    window.wfes.review = {};
    window.wfes.review.decision = {};
    window.wfes.review.appeal = {};
    window.wfes.profile = {};
    window.wfes.nominations = {};
    window.wfes.edit = {};
    window.wfes.properties = {};
    window.wfes.messages = {};
    window.wfes.f = window.wfes.g = window.wfes.s = {}; // function, get, set

    /* ================ overwrite XHR ================ */
    let openOrig = window.XMLHttpRequest.prototype.open, sendOrig = window.XMLHttpRequest.prototype.send;

    function openReplacement(method, url, async, user, password) {
        this._url = url;
        this._method = method;
        // console.log( "WFES OPEN: ", method, url );
        if (PREFIX === this._url.substr(0, PREFIX.length)) {
            // handle only Wayfarer URLs
            this.addEventListener('load', handleLoadEvent);
        }
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
                case PREFIX + 'review/skip':
                    json = JSON.parse(daten);
                    candidate = window.wfes.review.sessionHist[json.id];
                    window.wfes.review.decision.candidate = candidate;
                    json.skipped = true;
                    window.wfes.review.decision.decision = json;
                    window.dispatchEvent(new Event("WFESReviewDecisionSent"));
                    break;
                case PREFIX + 'manage/appeal':
                    json = JSON.parse(daten);
                    window.wfes.review.appeal = json;
                    window.dispatchEvent(new Event("WFESReviewAppealSent"));
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
                return;
            }
            if (!json.result) {
                console.warn("WFES: got no result from server");
                return;
            }

            let nominationDict, lang;
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
                    window.wfes.nominations.list = json.result.nominations;
                    window.wfes.nominations.canAppeal = json.result.canAppeal;
                    window.wfes.nominations.wayspots = json.result.wayspots;
                    window.dispatchEvent(new Event("WFESNominationListLoaded"));
                    break;
                case PREFIX + 'manage/detail':
                    // nomination detail
                    window.wfes.nominations.detail = json.result;
                    // save nomination Details in Sessionstorage
                    nominationDict = JSON.parse(sessionStorage.getItem(sStoreNominationsDetails)) || {};
                    nominationDict[window.wfes.nominations.detail.id] = window.wfes.nominations.detail;
                    sessionSave(sStoreNominationsDetails, nominationDict);
                    window.dispatchEvent(new Event("WFESNominationDetailLoaded"));
                    break;
                case PREFIX + 'properties':
                    window.wfes.properties = json.result;
                    window.dispatchEvent(new Event("WFESPropertiesLoaded"));
                    break;
                default:
                    // messages?language=de
                    if (PREFIX + 'messages?language=' === this._url.substr(0, 18 + PREFIX.length)) {
                        lang = this._url.substr(18 + PREFIX.length);
                        window.wfes.messages[lang] = json.result;
                    } else {
                        // console.log('WFES Base - unhandled URL: ',
                        // this._url);
                    }
                    break;
            }
        } catch (e) {
            console.warn(e);
        }
    }

    window.XMLHttpRequest.prototype.open = openReplacement;
    window.XMLHttpRequest.prototype.send = sendReplacement;

    /* handle data */
    function handleReviewData(result) {
        // save review data in ...pagedata and sessionstore
        let reviewSessionHist = JSON.parse(sessionStorage.getItem(sStoreReview)) || [];
        window.wfes.review.sessionHist = makeIDbasedDictionary(reviewSessionHist);

        if (undefined === window.wfes.review.sessionHist[result.id]) {
            reviewSessionHist.push(result);
            sessionSave(sStoreReview, reviewSessionHist);
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
    /* ================ /overwrite XHR ================ */

    /* ================ helper functions ============== */
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

    function sessionSave(name, content) {
        let json = JSON.stringify(content);
        sessionStorage.setItem(name, json);
    }
    /* ================ /helper functions ============= */

    /* ================ nomination page =============== */
    function loadCachedNomination(nomItem) {
        if (undefined === window.wfes.nominations.detail) {
            window.setTimeout(loadCachedNomination, 250, nomItem);
        }
        const myID = nomItem.__ngContext__[22].id;
        if (myID === window.wfes.nominations.detail.id) {
            // already loaded, do nothing
            return;
        }
        const nominationDict = JSON.parse(sessionStorage.getItem(sStoreNominationsDetails)) || [];
        const nomDetail = nominationDict[myID];
        if (undefined === nomDetail) {
            // nothing there, ignore
            return;
        }
        // set cached values
        window.wfes.nominations.detail = nomDetail;
        window.dispatchEvent(new Event("WFESNominationDetailLoaded"));
    }
    function nominationsClickHander(elem) {
        const nomItem = elem.target.closest('app-nominations-list-item');
        window.setTimeout(loadCachedNomination, 250, nomItem);
    }
    function addNominationsClickHandler() {
        const nomList = document.getElementsByTagName('app-nominations-list')[0];
        nomList.addEventListener('click', nominationsClickHander);
    }
    window.addEventListener("WFESNominationListLoaded", addNominationsClickHandler);
    /* ================ /nomination page ============== */

    // make objects immutable
    Object.freeze(window.wfes.f);
    Object.freeze(window.wfes.g);
    Object.freeze(window.wfes.s);

    /* we are done :-) */
    console.log("WFES Script loaded: BASE");
})();
