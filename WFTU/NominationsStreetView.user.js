// ==UserScript==
// @name         WFES - Nomination page StreetView
// @namespace    https://gitlab.com/fotofreund0815/WFES
// @version      1.0.1
// @description  Adds the streetview view a reviewer will see on your own nominations!
// @author       MrJPGames / AlterTobi
// @match        https://wayfarer.nianticlabs.com/*
// @icon         https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @downloadURL  https://github.com/AlterTobi/WFES/raw/main/no_support/NominationsStreetView.user.js
// @supportURL   https://github.com/AlterTobi/WFES/issues
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var SVMap;

    function setStreetView(){
        if (document.getElementById("pano") === null){
            let lastPane = document.getElementsByClassName("details-pane__map")[0];
            if (lastPane === undefined){
                console.log("failed to find attach elem");
                return;
            }
            let SVMapElement = document.createElement("div");
            SVMapElement.id = "pano";
            SVMapElement.style.height = "480px";
            SVMapElement.style.marginTop = "10px";
            lastPane.parentElement.insertBefore(SVMapElement, lastPane.nextSibling);
        }

        var lat = window.wfes.nominations.detail.lat;
        var lng = window.wfes.nominations.detail.lng;

        SVMap = new google.maps.Map(document.getElementById("pano"),{
            center: {
                lat: lat,
                lng: lng
            },
            mapTypeId: "hybrid",
            zoom: 17,
            scaleControl: true,
            scrollwheel: true,
            gestureHandling: 'greedy',
            mapTypeControl: false
        });
        var marker = new google.maps.Marker({
            map: SVMap,
            position: {
                lat: parseFloat(lat),
                lng: parseFloat(lng)
            },
            title: window.wfes.nominations.detail.title
        });
        var panorama = SVMap.getStreetView();
        var client = new google.maps.StreetViewService;
        client.getPanoramaByLocation({
            lat: lat,
            lng: lng
        }, 50, function(result, status) {
            if (status === "OK") {
                var point = new google.maps.LatLng(lat,lng);
                var oldPoint = point;
                point = result.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(point, oldPoint);
                panorama.setPosition(point);
                panorama.setPov({
                    heading: heading,
                    pitch: 0,
                    zoom: 1
                });
                panorama.setMotionTracking(false);
                panorama.setVisible(true);
            }
        });

        console.log("[NomSVMap] Setting Nomination Streetview image");
    }

    window.addEventListener("WFESNominationDetailLoaded", setStreetView);
    console.log( "WFES Script loaded: NominationsStreetView");
})();