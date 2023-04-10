// @name         review Debug
// @version      1.0.0
// @description  show some debugging info
// @author       AlterTobi

(function() {
  "use strict";
  const mainContentSelector = "app-wayfarer > div > mat-sidenav-container > mat-sidenav-content";
  const myID = "wfes-debugOverlay";
  const myCssId = "wfes-debugCSS";
  const myStyle = `.wfes-debug {
    position : absolute;
    top : 10px;
    right : 10px;
    background-Color : #d9d9d9;
    padding : 5px;
    border : 1px solid black;
    max-width : 20%;
    box-shadow: 7px 7px 5px grey;
  }
  .wfes-debug > hr {
    background-Color : #828282;
    margin-top: 1em;
    margin-bottom: 1em;
    height: 2px;
  }
  .wfes-red { color: red; }
    `;

  const skipNamesAll = ["description", "imageUrl", "title"];

  let overlay = null;

  function reviewInfobox(lskips) {
    const skipNames = [...new Set(skipNamesAll.concat(lskips))];
    skipNames.sort();

    const skipped = [];

    window.wfes.f.addCSS(myCssId, myStyle);
    const candidate = window.wfes.g.reviewPageData();

    overlay = document.createElement("div");
    overlay.setAttribute("class", "wfes-debug");
    overlay.setAttribute("id", myID);

    let content = "";
    for (const key in candidate) {
      if (skipNames.includes(key)) {
        skipped.push(key);
        continue;
      }
      switch(key) {
      case "expires": {
        const date = new Date(candidate[key]);
        const dateStr = date.toLocaleString();
        content += `<p><strong>${key}:</strong> ${dateStr}</p>`;
        break;
      }
      case "t1": {
        if (0.5 === candidate[key]) {
          content += `<p><strong>${key}:</strong> ${candidate[key]}</p>`;
        } else {
          content += `<p class="wfes-red"><strong>${key}:</strong> ${candidate[key]}</p>`;
        }
        break;
      }
      default:
        content += `<p><strong>${key}:</strong> ${candidate[key]}</p>`;
      }
    }

    skipped.sort();

    content += "<hr/><strong>skipped entries:</strong><br/>";
    content += `<p>${skipped.join(", ")}</p>`;
    const missing = skipNames.filter(x => !skipped.includes(x));
    if (missing.length > 0) {
      missing.sort();
      content += "<hr/><strong>missing entries:</strong><br/>";
      content += `<p>${missing.join(", ")}</p>`;
    }

    overlay.innerHTML = content;

    const mainContent = document.querySelector(mainContentSelector);
    mainContent.appendChild(overlay);
  }

  function removeInfobox() {
    // remove the overlay
    if (overlay && document.getElementById(myID)) {
      overlay.parentNode.removeChild(overlay);
      overlay = null;
    }
  }

  function reviewNew() {
    const lskips = ["categoryIds", "nearbyPortals", "statement", "streetAddress", "supportingImageUrl"];
    reviewInfobox(lskips);
  }
  function newPhoto() {
    const lskips = ["newPhotos"];
    reviewInfobox(lskips);
  }
  function reviewEdit() {
    const lskips = [];
    const edits = window.wfes.g.edit();
    if (edits.what.location) {
      lskips.push("locationEdits");
    }
    if (edits.what.description) {
      lskips.push("descriptionEdits");
    }
    if (edits.what.title) {
      lskips.push("titleEdits");
    }
    reviewInfobox(lskips);
  }

  // display debug ooverlay
  window.addEventListener("WFESReviewPageNewLoaded", reviewNew);
  window.addEventListener("WFESReviewPageEditLoaded", reviewEdit);
  window.addEventListener("WFESReviewPagePhotoLoaded", newPhoto);

  // remove debug ooverlay
  window.addEventListener("WFESReviewDecisionSent", removeInfobox);

  /* we are done :-) */
  console.log("Script loaded:", GM_info.script.name, "v" + GM_info.script.version);
})();