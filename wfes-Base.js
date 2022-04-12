// @name         Base
// @version      0.9.99.1
// @description  basic functionality for WFES
// @author       AlterTobi

(function() {
    'use strict';

    /* WFES data structures */
    const PREFIX = '/api/v1/vault/';
    const sStoreReview = 'wfes_Reviews';
    const sStoreNominationsDetails = 'wfes_nominationDetails';

    let wfes = {};
    wfes.showcase = {};
    wfes.review = {};
    wfes.review.decision = {};
    wfes.review.appeal = {};
    wfes.profile = {};
    wfes.nominations = {};
    wfes.edit = {};
    wfes.properties = {};
    wfes.messages = {};
    wfes.version = '0.0.0';

    window.wfes.f = window.wfes.g = window.wfes.s = {}; // functions, getter,
    // setter

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
                    candidate = wfes.review.sessionHist[json.id];
                    wfes.review.decision.candidate = candidate;
                    wfes.review.decision.decision = json;
                    window.dispatchEvent(new Event("WFESReviewDecisionSent"));
                    break;
                case PREFIX + 'review/skip':
                    json = JSON.parse(daten);
                    candidate = wfes.review.sessionHist[json.id];
                    wfes.review.decision.candidate = candidate;
                    json.skipped = true;
                    wfes.review.decision.decision = json;
                    window.dispatchEvent(new Event("WFESReviewDecisionSent"));
                    break;
                case PREFIX + 'manage/appeal':
                    json = JSON.parse(daten);
                    wfes.review.appeal = json;
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
            } else {
                checkWfVersion(json.version);
            }

            let nominationDict, lang;
            switch (this._url) {
                case PREFIX + 'home':
                    wfes.showcase.list = json.result.showcase;
                    window.dispatchEvent(new Event("WFESHomePageLoaded"));
                    break;
                case PREFIX + 'review':
                    if ('GET' === this._method) {
                        handleReviewData(json.result);
                    }
                    break;
                case PREFIX + 'profile':
                    wfes.profile = json.result;
                    window.dispatchEvent(new Event("WFESProfileLoaded"));
                    break;
                case PREFIX + 'manage':
                    // nomination list
                    wfes.nominations.list = json.result.nominations;
                    wfes.nominations.canAppeal = json.result.canAppeal;
                    wfes.nominations.wayspots = json.result.wayspots;
                    window.dispatchEvent(new Event("WFESNominationListLoaded"));
                    break;
                case PREFIX + 'manage/detail':
                    // nomination detail
                    wfes.nominations.detail = json.result;
                    // save nomination Details in Sessionstorage
                    nominationDict = JSON.parse(sessionStorage.getItem(sStoreNominationsDetails)) || {};
                    nominationDict[wfes.nominations.detail.id] = wfes.nominations.detail;
                    window.wfes.f.sessionSave(sStoreNominationsDetails, nominationDict);
                    window.dispatchEvent(new Event("WFESNominationDetailLoaded"));
                    break;
                case PREFIX + 'properties':
                    wfes.properties = json.result;
                    window.dispatchEvent(new Event("WFESPropertiesLoaded"));
                    break;
                default:
                    // messages?language=de
                    if (PREFIX + 'messages?language=' === this._url.substr(0, 18 + PREFIX.length)) {
                        lang = this._url.substr(18 + PREFIX.length);
                        wfes.messages[lang] = json.result;
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
        wfes.review.sessionHist = makeIDbasedDictionary(reviewSessionHist);

        if (undefined === wfes.review.sessionHist[result.id]) {
            reviewSessionHist.push(result);
            window.wfes.f.sessionSave(sStoreReview, reviewSessionHist);
            wfes.review.sessionHist[result.id] = result;
        }

        wfes.edit.isEdit = false;

        wfes.review.pageData = result;
        switch (wfes.review.pageData.type) {
            case 'NEW':
                window.dispatchEvent(new Event("WFESReviewPageNewLoaded"));
                break;
            case 'EDIT':
                wfes.edit.isEdit = true;
                wfes.edit.what = {};
                wfes.edit.what.location = result.locationEdits.length > 1;
                wfes.edit.what.description = result.descriptionEdits.length > 0;
                wfes.edit.what.title = result.titleEdits.length > 0;
                window.dispatchEvent(new Event("WFESReviewPageEditLoaded"));
                break;
            case 'PHOTO':
                window.dispatchEvent(new Event("WFESReviewPagePhotoLoaded"));
                break;
        }
        window.dispatchEvent(new Event("WFESReviewPageLoaded"));
    }
    /* ================ /overwrite XHR ================ */

    function checkWfVersion(v) {
        if (wfes.version !== v) {
            console.log('WF version changed from', wfes.version, 'to', v);
            wfes.version = v;
            window.dispatchEvent(new Event("WFESVersionChanged"));
        }
    }
    /* ================ nomination page =============== */
    function loadCachedNomination(nomItem) {
        if (undefined === wfes.nominations.detail) {
            window.setTimeout(loadCachedNomination, 250, nomItem);
        }
        const myID = nomItem.__ngContext__[22].id;
        if (myID === wfes.nominations.detail.id) {
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
        wfes.nominations.detail = nomDetail;
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

    /* ================ basic functions =============== */

    // make a copy of data
    function jCopy(data) {
        return (JSON.parse(JSON.stringify(data)));
    }

    // save data in localstorage
    window.wfes.f.localSave = function(name, content) {
        let json = JSON.stringify(content);
        localStorage.setItem(name, json);
    }
    // save data in sessionstorage
    window.wfes.f.sessionSave = function(name, content) {
        let json = JSON.stringify(content);
        sessionStorage.setItem(name, json);
    }

    // add CSS to the head, if not there
    window.wfes.f.addCSS = function(myID, styles) {
        // already there?
        if (null === document.getElementById(myID)) {
            let headElem = document.getElementsByTagName("HEAD")[0];
            let customStyleElem = document.createElement("style");
            customStyleElem.setAttribute('id', myID);
            customStyleElem.innerText = styles;
            headElem.appendChild(customStyleElem);
        }
    }

    // Useful to make comparing easier. Essentially this function iterates over
    // all items and uses it's unique ID as key and stores relevant values under
    // that key. This way on checking we can simply find the ID when looking at
    // a current item
    window.wfes.f.makeIDbasedDictionary = function(itemList) {
        let dict = {}, item;
        for (let i = 0; i < itemList.length; i++) {
            item = itemList[i];
            dict[item.id] = item;
        }
        return dict;
    }

    /* ================ /basic functions=============== */
    /* ================ getter ======================== */
    window.wfes.g.profile = function() {
        return jCopy(wfes.profile);
    }
    window.wfes.g.nominationsList = function() {
        return jCopy(wfes.nominations.list);
    }
    window.wfes.g.nominationDetail = function() {
        return jCopy(wfes.nominations.detail);
    }
    window.wfes.g.canAppeal = function() {
        return jCopy(wfes.nominations.canAppeal);
    }
    window.wfes.g.wfVersion = function() {
        return jCopy(wfes.version);
    }
    window.wfes.g.reviewPageData = function() {
        return jCopy(wfes.review.pageData);
    }
    window.wfes.g.showcase = function() {
        return jCopy(wfes.showcase);
    }
    window.wfes.g.reviewDecision = function() {
        return jCopy(wfes.review.decision);
    }
    /* ================ /getter ======================= */
    /* ================ setter ======================== */

    /* ================ /setter ======================= */

    // make objects immutable
    Object.freeze(window.wfes.f);
    Object.freeze(window.wfes.g);
    Object.freeze(window.wfes.s);

    /* we are done :-) */
    console.log("Script loaded:", GM_info.script.name, 'v' + GM_info.script.version);
})();
