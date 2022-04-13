// @name         show Wayfarer version
// @version      1.0.0
// @description  show current Wayfarer version
// @author       AlterTobi

(function() {
    'use strict';

    const versionDivID = 'wfVersionDiv';
    const myCssId = 'wfVersionCSS';
    const myStyle = `.wfVersionCSS {
                position: absolute;
                z-index: 9999;
                left: 15px;
                top: 10px;
                background-color: white;
                border: 2px solid red;
                padding: 5px; box-shadow: 7px 7px 5px grey;}
                `;

    function showVersion() {
        let wfVersion = window.wfes.g.wfVersion();
        window.wfes.f.addCSS(myCssId,myStyle);
        if (null === document.getElementById(versionDivID)) {
            let bodyElem = document.getElementsByTagName("body")[0];
            let versionDiv = document.createElement("div");
            versionDiv.setAttribute('class','wfVersionCSS');
            versionDiv.innerText = 'version: ' + wfVersion;
            bodyElem.appendChild(versionDiv);
        } else {
            let versionDiv = document.getElementById(versionDivID);
            versionDiv.innerText = 'version: ' + wfVersion;
        }
    }

    window.addEventListener("WFESVersionChanged", showVersion);

    /* we are done :-) */
    console.log("Script loaded:", GM_info.script.name, 'v' + GM_info.script.version);
})();