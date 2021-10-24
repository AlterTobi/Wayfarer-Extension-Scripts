// ==UserScript==
// @name         WFES - review Add Orig Location
// @namespace    https://github.com/AlterTobi/WFES/
// @version      0.0.1
// @description  WFES location edits - add marker for original location
// @author       AlterTobi
// @match        https://wayfarer.nianticlabs.com/*
// @icon         https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @downloadURL  https://github.com/AlterTobi/WFES/raw/main/wfes-reviewAddOrigLocation.user.js
// @supportURL   https://github.com/AlterTobi/WFES/issues
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const markerSVG = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8' %3F%3E%3Csvg width='32px' height='32px' viewBox='0 0 32 32' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3C!-- Generator: Sketch 58 (84663) - https://sketch.com --%3E%3Ctitle%3EIcon / MapSpot%3C/title%3E%3Cdesc%3ECreated with Sketch.%3C/desc%3E%3Cg id='Icon-/-MapSpot' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E%3Cpath d='M16,31 C24.2842712,31 31,24.2842712 31,16 C31,7.71572875 24.2842712,1 16,1 C7.71572875,1 1,7.71572875 1,16 C1,24.2842712 7.71572875,31 16,31 Z' id='Path' fill='%23E78A6F' fill-rule='nonzero'%3E%3C/path%3E%3Cpath d='M16,27.8444983 C9.4584642,27.8444983 4.15550167,22.5415358 4.15550167,16 C4.15550167,9.4584642 9.4584642,4.15550167 16,4.15550167 C22.5415358,4.15550167 27.8444983,9.4584642 27.8444983,16 C27.8444983,22.5415358 22.5415358,27.8444983 16,27.8444983 Z' id='Path' fill='%2300FF00' fill-rule='nonzero' %3E%3C/path%3E%3C/g%3E%3C/svg%3E";

    function addMarkerCSS(number){
        const myID = 'locationMarkerCSS';
        number = 1 + Number(number); // buttons starten bei 1, nicht bei 0
        let css = `app-select-location-edit agm-map div[role="button"]:nth-child(${number}) {background-repeat: no-repeat; background-image: url("${markerSVG}"); }`;

        let headElem = document.getElementsByTagName("HEAD")[0];
        let customStyleElem = document.createElement("style");
        customStyleElem.setAttribute('id',myID);
        customStyleElem.innerText = css;
        headElem.appendChild(customStyleElem);
    }

    function addOrigLocation(map, lat, lng) {
        console.log("WFES addOrigLocation la/lo", lat, lng);
        let editMarkers = map.markers.default.markers;
        for (let marker in editMarkers) {
            console.log(editMarkers[marker].id);
            if ((editMarkers[marker].latitude === lat) && (editMarkers[marker].longitude === lng)) {
                // editMarkers[marker].icon.url = markerSVG;
                addMarkerCSS(marker);
                console.log("WFES Icon set", marker);
            }
        }
    }

    function addOrigMarker() {
        console.log("WFES addOrigMarker");
        // only on location edits
        if (window.wfes.edit.what.location) {
            // get the map - thx tehstone ;-)
            const gmap = document.querySelector('app-select-location-edit nia-map');
            let mapCtx = gmap.__ngContext__.at(-1);
            addOrigLocation(mapCtx, window.wfes.review.pageData.lat, window.wfes.review.pageData.lng);
        }
    }

    window.addEventListener("WFESReviewPageEditLoaded", () => { setTimeout(addOrigMarker,200);} );

    console.log("WFES Script loaded: review Add Orig Location");
})();
