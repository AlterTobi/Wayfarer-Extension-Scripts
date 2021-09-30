// ==UserScript==
// @name         Nomination page StreetView
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds the streetview view a reviewer will see on your own nominations!
// @author       MrJPGames
// @match        https://wayfarer.nianticlabs.com/*
// @icon         https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
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

        var lat = window.wft.nominationsApp.selectedNomination.nomination.lat;
        var lng = window.wft.nominationsApp.selectedNomination.nomination.lng;

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
            title: window.wft.nominationsApp.selectedNomination.nomination.title
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

    window.addEventListener("WFTNominationSelected", setStreetView);
})();