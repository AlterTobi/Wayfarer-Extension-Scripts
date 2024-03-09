// @name         Reverse Image Search Bing
// @version      1.0.0
// @description  Search Bing for Images
// @author       AlterTobi

(function() {
  "use strict";

  const myCssId = "bingImageSearchCSS";
  const myStyle = `wfesBingIMage {
        margin: 0.6em 0;
    }
    `;
  const mainImageElem = "app-photo-b > wf-review-card-b > div.wf-review-card__header > div";
  const targetName = "wfesReverseImageBing";

  function prepareURI(imgUrl) {
    const encoded = encodeURIComponent(imgUrl);
    const bingURI = `https://www.bing.com/images/search?view=detailv2&iss=sbi&form=SBIWEB&sbisrc=UrlPaste&q=imgurl:${encoded}&idpbck=1&selectedindex=0&id=${encoded}&ccid=wKrWr9BS&mediaurl=${encoded}&exph=2815&expw=2592&vt=2&sim=1`;
    return bingURI;
  }

  function addLink(url, elem ) {
    const span = document.createElement("span");
    span.setAttribute("class", "wfesBingIMage");
    const link = document.createElement("a");
    link.href = url;
    link.target = targetName;
    link.textContent = "Bing Reverse Image Search";
    span.appendChild(link);
    elem.appendChild(span);
  }

  function reviewNew() {
    window.wfes.f.addCSS(myCssId, myStyle);
    const data = window.wfes.g.reviewPageData();
    // wait for main photo
    window.wfes.f.waitForElem(mainImageElem)
      .then((e)=>{
        const imageUrl = data.imageUrl + "=s0";
        addLink(prepareURI(imageUrl), e);
      })
      .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
  }

  function reviewPhoto() {
    // window.wfes.f.addCSS(myCssId, myStyle);
    // nothing yet
  }

  window.addEventListener("WFESReviewPageNewLoaded", reviewNew);
  window.addEventListener("WFESReviewPagePhotoLoaded", reviewPhoto);

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();