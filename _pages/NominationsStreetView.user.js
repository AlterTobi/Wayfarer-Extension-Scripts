// ==UserScript==
// @name           WFES - Nomination page StreetView
// @version        1.1.3
// @description    Adds the streetview view a reviewer will see on your own nominations!
// @author         MrJPGames / AlterTobi
// @namespace      https://github.com/AlterTobi/WFES/
// @homepage       https://altertobi.github.io/Wayfarer-Extension-Scripts/
// @supportURL     https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues
// @icon           https://wayfarer.nianticlabs.com/imgpub/favicon-256.png
// @downloadURL    https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-NominationsStreetView.user.js
// @updateURL      https://altertobi.github.io/Wayfarer-Extension-Scripts/wfes-NominationsStreetView.meta.js
// @match          https://wayfarer.nianticlabs.com/*
// @grant          none
// ==/UserScript==

/* global google */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "marker" }]*/

(function() {
  "use strict";

  let SVMap;

  function setStreetView() {
    if (null === document.getElementById("pano")) {
      const lastPane = document.getElementsByClassName("details-pane__map")[0];
      if (lastPane === undefined) {
        console.log("failed to find attach elem");
        return;
      }
      const SVMapElement = document.createElement("div");
      SVMapElement.id = "pano";
      SVMapElement.style.height = "480px";
      SVMapElement.style.marginTop = "10px";
      lastPane.parentElement.insertBefore(SVMapElement, lastPane.nextSibling);
    }

    const nomDetail = window.wfes.g.nominationDetail();
    const lat = nomDetail.lat;
    const lng = nomDetail.lng;

    SVMap = new google.maps.Map(document.getElementById("pano"), {
      center : {
        lat : lat,
        lng : lng
      },
      mapTypeId : "hybrid",
      zoom : 17,
      scaleControl : true,
      scrollwheel : true,
      gestureHandling : "greedy",
      mapTypeControl : false
    });
    const marker = new google.maps.Marker({
      map : SVMap,
      position : {
        lat : parseFloat(lat),
        lng : parseFloat(lng)
      },
      title : nomDetail.title
    });
    const panorama = SVMap.getStreetView();
    const client = new google.maps.StreetViewService;
    client.getPanoramaByLocation({
      lat : lat,
      lng : lng
    }, 50, function(result, status) {
      if ("OK" === status) {
        let point = new google.maps.LatLng(lat, lng);
        const oldPoint = point;
        point = result.location.latLng;
        const heading = google.maps.geometry.spherical.computeHeading(point, oldPoint);
        panorama.setPosition(point);
        panorama.setPov({
          heading : heading,
          pitch : 0,
          zoom : 1
        });
        panorama.setMotionTracking(false);
        panorama.setVisible(true);
      }
    });

    // console.log("[NomSVMap] Setting Nomination Streetview image");
  }

  window.addEventListener("WFESNominationDetailLoaded", setStreetView);
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
