// @name         Nomination page StreetView
// @version      1.1.2
// @description  Adds the streetview view a reviewer will see on your own nominations!
// @author       MrJPGames / AlterTobi

/*global google */
/*eslint no-unused-vars: ["error", { "varsIgnorePattern": "marker" }]*/

(function() {
  'use strict';

  var SVMap;

  function setStreetView() {
    if (null === document.getElementById("pano")) {
      let lastPane = document.getElementsByClassName("details-pane__map")[0];
      if (lastPane === undefined) {
        console.log("failed to find attach elem");
        return;
      }
      let SVMapElement = document.createElement("div");
      SVMapElement.id = "pano";
      SVMapElement.style.height = "480px";
      SVMapElement.style.marginTop = "10px";
      lastPane.parentElement.insertBefore(SVMapElement, lastPane.nextSibling);
    }

    let nomDetail = window.wfes.g.nominationDetail();
    let lat = nomDetail.lat;
    let lng = nomDetail.lng;

    SVMap = new google.maps.Map(document.getElementById("pano"), {
      center : {
        lat : lat,
        lng : lng
      },
      mapTypeId : "hybrid",
      zoom : 17,
      scaleControl : true,
      scrollwheel : true,
      gestureHandling : 'greedy',
      mapTypeControl : false
    });
    let marker = new google.maps.Marker({
      map : SVMap,
      position : {
        lat : parseFloat(lat),
        lng : parseFloat(lng)
      },
      title : nomDetail.title
    });
    var panorama = SVMap.getStreetView();
    var client = new google.maps.StreetViewService;
    client.getPanoramaByLocation({
      lat : lat,
      lng : lng
    }, 50, function(result, status) {
      if ("OK" === status) {
        var point = new google.maps.LatLng(lat, lng);
        var oldPoint = point;
        point = result.location.latLng;
        var heading = google.maps.geometry.spherical.computeHeading(point, oldPoint);
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
  console.log("Script loaded:", GM_info.script.name, 'v' + GM_info.script.version);
})();