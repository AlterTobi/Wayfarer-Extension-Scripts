// @name review Add Orig Location
// @version 1.0.3
// @description location edits - add marker for original location
// @author AlterTobi

/* global google */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "marker" }] */

(function() {
  "use strict";

  const markerSVG = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='28px' height='61px' viewBox='0 0 28 61' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3EIcon-Pink%3C/title%3E%3Cg id='Icon-Pink' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E%3Cpath d='M15.5093388,20.7281993 C14.9275251,20.9855232 14.2863961,21.1311947 13.6095035,21.1311947 C12.9326109,21.1311947 12.2914819,20.9855232 11.7096682,20.7281993 C10.0593063,19.997225 8.90701866,18.3486077 8.90701866,16.4278376 C8.90701866,13.8310471 11.012713,11.726225 13.6095035,11.726225 C16.206294,11.726225 18.3119883,13.8310471 18.3119883,16.4278376 C18.3119883,18.3486077 17.1597007,19.997225 15.5093388,20.7281993 M22.3271131,7.71022793 C17.5121036,2.89609069 9.70603111,2.89609069 4.89189387,7.71022793 C1.3713543,11.2307675 0.437137779,16.3484597 2.06482035,20.7281993 L2.05435293,20.7281993 L2.15379335,20.9820341 L2.20525812,21.113749 L11.1688519,44.0984412 L11.1758302,44.0984412 C11.5561462,45.0736551 12.4990855,45.7671211 13.6095035,45.7671211 C14.7190492,45.7671211 15.6619885,45.0736551 16.0431768,44.0984412 L16.0492828,44.0984412 L25.0128766,21.1163658 L25.0669582,20.9776726 L25.1637818,20.7281993 L25.1541867,20.7281993 C26.7818692,16.3484597 25.8476527,11.2307675 22.3271131,7.71022793 M13.6095035,50.6946553 C11.012713,50.6946553 8.90701866,52.7994774 8.90701866,55.3962679 C8.90701866,57.9939306 11.012713,60.099625 13.6095035,60.099625 C16.206294,60.099625 18.3119883,57.9939306 18.3119883,55.3962679 C18.3119883,52.7994774 16.206294,50.6946553 13.6095035,50.6946553' id='F' stroke='%23FFFFFF' fill='%23BB00FF'%3E%3C/path%3E%3C/g%3E%3C/svg%3E";

  function addMarker(map, lat, lng) {
    const marker = new google.maps.Marker({
      map: map,
      position: {
        lat: lat,
        lng: lng
      },
      icon:  markerSVG
    });
  }

  function addOrigMarker() {
    const edit = window.wfes.g.edit();
        
    // only on location edits
    if (edit.what.location) {
      if (undefined === typeof(google)) {
        setTimeout(addOrigMarker, 200);
        return;
      }
      // get the map - thx tehstone ;-)
      const gmap = document.querySelector("app-select-location-edit nia-map");
      const mapCtx = gmap.__ngContext__.at(-1);
      const map = mapCtx.componentRef.map;
      const pageData = window.wfes.g.reviewPageData();
      addMarker(map, pageData.lat, pageData.lng);
    }
  }

  window.addEventListener("WFESReviewPageEditLoaded", () => { setTimeout(addOrigMarker, 200);} );

  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();
