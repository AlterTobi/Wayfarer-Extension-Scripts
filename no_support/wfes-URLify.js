// @name URLify
// @version 1.1.0beta1
// @description detect links in supporting information
// @author AlterTobi

(function() {
  "use strict";

  let maxtries = 10;

  function URLify(s) {
    let t = s;
    const urls = t.match(/((https?:\/\/)[-\w@:%_+.~#?,&/=]+)/g);
    if (urls) {
      urls.forEach(function(url) {
        t = t.replace(url, '<a target="_blank" href="' + url + '">' + url + "</a>");
      });
    }
    return t;
  }

  function detectURL() {
    const candidate = window.wfes.g.reviewPageData();

    if (undefined !== candidate.statement) {
      const elem = document
        .querySelector("app-review-new app-supporting-info > wf-review-card.wf-review-card.card.ng-star-inserted > div > div > div.mt-2.bg-gray-200.px-4.py-2.ng-star-inserted");
      if (null !== elem && null !== elem.children) {
        if (elem.children.length > 0) {
          elem.children[0].innerHTML = URLify(candidate.statement);
        } else {
          elem.innerHTML = URLify(candidate.statement);
        }
      } else if (maxtries-- > 0) {
        // @TODO set maxTries
        setTimeout(detectURL, 100);
      }
    }
  }

  window.addEventListener("WFESReviewPageNewLoaded", detectURL);

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
