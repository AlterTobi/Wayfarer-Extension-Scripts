// @name         image Mods
// @version      1.0.0
// @description  open fullsize images in "named" tabs
// @author       AlterTobi

(function() {
    'use strict';

    const myCssId = 'imageModsCSS';
    const myStyle = `.material-icons-fontsize {
                  font-size: 48px;
                }
                .lupe {
                  position: absolute;
                  left: 0px;
                }
                .bottom {
                  bottom: 0px;
                }
        `;

    function addFullImageButton(elem, url, target, position = "afterEnd", styleclass = 'lupe'){
        let a = document.createElement("a");
        let span = document.createElement("span");

        span.className = "material-icons material-icons-fontsize";
        span.innerText = 'search';
        a.appendChild(span);
        a.target = target;
        a.href = url;
        a.className = styleclass;
        switch (position) {
            case 'afterEnd':
            case 'beforeBegin':
                elem.parentNode.style.position = "relative";
                break;
            case 'beforeEnd':
            case 'afterBegin':
                elem.style.position = "relative";
                break;
        }
        elem.insertAdjacentElement(position,a);
    }

    function addFullSizeImageLinks() {
        let elem, imageUrl;
        let myData = window.wfes.g.reviewPageData();

        window.wfes.f.addCSS(myCssId,myStyle);
        switch (myData.type) {
            case "NEW":
                elem = document.getElementsByClassName("wf-image-modal flex-grow bg-contain bg-center bg-no-repeat");
                imageUrl = myData.imageUrl + "=s0";
                addFullImageButton(elem[0],imageUrl,'mainImage');

                // Supporting Image
                if (myData.supportingImageUrl){
                    imageUrl = myData.supportingImageUrl + "=s0";
                    addFullImageButton(elem[1],imageUrl,'supportingImage')
                }
                break;
            case "EDIT":
                elem = document.getElementsByClassName("wf-image-modal");
                imageUrl = myData.imageUrl + "=s0";
                addFullImageButton(elem[0],imageUrl,'mainImage','beforeBegin');
                break;
            case "PHOTO":
                elem = document.getElementsByClassName("photo-card__photo");
                for (let i=0; i < elem.length; i++){
                    imageUrl = myData.newPhotos[i].value + "=s0";
                    addFullImageButton(elem[i].parentNode.parentNode.parentNode,imageUrl,'additionalImage','beforeEnd', 'lupe bottom');
                }
                break;
        }
    }

    window.addEventListener("WFESReviewPageLoaded", () => {setTimeout(addFullSizeImageLinks,100)});

    console.log("Script loaded:", GM_info.script.name, 'v' + GM_info.script.version);
})();
