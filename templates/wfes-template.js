// @name         Template
// @version      1.0.0
// @description  Template 
// @author       AlterTobi

(function() {
    'use strict';

    const myCssId = 'templateCSS';
    const myStyle = `body {
        display: none;
    `;

    function myTemplate() {
        window.wfes.f.addCSS(myCssId,myStyle);
        // YOUR CODE HERE
    }

    window.addEventListener("WFESHomePageLoaded", myTemplate);

    /* we are done :-) */
    console.log("Script loaded:", GM_info.script.name, 'v' + GM_info.script.version);
})();