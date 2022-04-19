// @name         URLify
// @version      1.0.0
// @description  detect links in supporting information
// @author       AlterTobi

(function() {
    'use strict';

    function URLify(s) {
        const urls = s.match(/((https?:\/\/)[-\w@:%_+.~#?,&/=]+)/g);
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
        if (null !== elem && null !== elem.children) {
            if (elem.children.length) {
                elem.children[0].innerHTML = URLify(elem.innerHTML);
            }
        } else {
            // @TODO set maxTries
            setTimeout(detectURL, 100);
        }
    }

    window.addEventListener("WFESReviewPageNewLoaded", detectURL);

    console.log("Script loaded:", GM_info.script.name, 'v' + GM_info.script.version);
})();
