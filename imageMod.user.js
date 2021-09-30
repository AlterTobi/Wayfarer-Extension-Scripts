// ==UserScript==
// @name         WFES - image Mods
// @namespace    https://gitlab.com/fotofreund0815/WFES
// @version      0.1.1
// @description  open fullsize images in "named" tabs
// @author       AlterTobi
// @match        https://wayfarer.nianticlabs.com/*
// @downloadURL  https://github.com/AlterTobi/WFES/raw/main/imageMod.user.js
// @icon         https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function addCSS(){
    	let myID = 'imageModsCSS';
    	//already there?
    	if ( null === document.getElementById(myID)) {
            let headElem = document.getElementsByTagName("HEAD")[0];
            let customStyleElem = document.createElement("style");
            customStyleElem.setAttribute('id',myID);
            customStyleElem.innerText = `
.material-icons-fontsize {
  font-size: 48px;
}
.lupe {
  z-index: 9999;
  position: absolute;
  left: 0px;
}
.bottom {
  bottom: 0px;
}
    `;
            headElem.appendChild(customStyleElem);
    	}
    }

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
    	let myData = window.wft.reviewApp.pageData;

        addCSS();
    	switch (myData.type) {
    		case "NEW":
    			elem = document.getElementsByClassName("wf-image-modal flex-grow bg-contain bg-center bg-no-repeat");
    			imageUrl = myData.imageUrl + "=s0";
    			addFullImageButton(elem[0],imageUrl,'mainImage');

    			//Supporting Image
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

    console.log('WFES Script loaded: imageMod');
})();
