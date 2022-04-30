// @name URLify
// @version 1.1.0
// @description detect links in supporting information
// @author AlterTobi

(function() {
  "use strict";

  const myReg = /((https?:\/\/)[-\w@:%_+.~#?,&/=]+)/g;
  let maxtries = 10;

  function URLify(s) {
    let t = s;
    const urls = t.match(myReg);
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
      // nur ersetzen, wenn auch URLs drin sind
      if (null !== candidate.statement.match(myReg)) {
        const elem = document
          .querySelector("app-review-new app-supporting-info > wf-review-card.wf-review-card.card.ng-star-inserted > div > div > div.mt-2.bg-gray-200.px-4.py-2.ng-star-inserted");
        if (null !== elem && null !== elem.children) {
          if (elem.children.length > 0) {
            elem.children[0].innerHTML = URLify(candidate.statement);
          } else {
            elem.innerHTML = URLify(candidate.statement);
          }
        } else if (maxtries-- > 0) {
          setTimeout(detectURL, 100);
        }
      }
    }
  }

  window.addEventListener("WFESReviewPageNewLoaded", detectURL);

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();