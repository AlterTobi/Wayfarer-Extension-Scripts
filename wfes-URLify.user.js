// ==UserScript==
// @name         WFES - URLify
// @namespace    https://github.com/AlterTobi/WFES/
// @version      0.1.0
// @description  WFES - detect links in supporting information
// @author       AlterTobi
// @match        https://wayfarer.nianticlabs.com/*
// @icon         https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @downloadURL  https://github.com/AlterTobi/WFES/raw/main/wfes-URLify.user.js
// @supportURL   https://github.com/AlterTobi/WFES/issues
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function URLify(s) {
        const urls = s.match(/((https?:\/\/)[\-\w@:%_\+.~#?,&\/=]+)/g);
        if (urls) {
            urls.forEach(function(url) {
                s = s.replace(url, '<a target="_blank" href="' + url + '">' + url + "</a>");
            });
        }
        return s;
    }

    function detectURL() {
        let elem = document
                .querySelector('app-review-new app-supporting-info > wf-review-card.wf-review-card.card.ng-star-inserted > div > div > div.mt-2.bg-gray-200.px-4.py-2.ng-star-inserted');
        if (null !== elem) {
            elem.innerHTML = URLify(elem.innerHTML);
        } else {
            // @TODO set maxTries
            setTimeout(detectURL, 100);
        }
    }

    window.addEventListener("WFESReviewPageNewLoaded", detectURL);

    console.log("WFES Script loaded: URLify");
})();