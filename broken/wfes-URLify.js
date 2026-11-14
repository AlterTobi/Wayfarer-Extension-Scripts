// @name URLify
// @version 1.4.99
// @description detect links in supporting information

(function() {
  "use strict";


  const BASE_MIN_VERSION = "3.0.0";
  const SESSION_VAR_MISS = "warnBase";
  const SCRIPT_NAME = GM_info?.script?.name ?? "WFES - Script";
  const SCRIPT_VERSION = GM_info?.script?.version ?? "unknown";

  // === Basis-Prüfung & Logger (Standard für alle Skripte) =====
  if (typeof window.wfes === "undefined") {
    if (sessionStorage.getItem(SESSION_VAR_MISS) === null) {
      sessionStorage.setItem(SESSION_VAR_MISS, "1");
      const msg = `${SCRIPT_NAME}: Missing WFES Base. Please install from https://altertobi.github.io/Wayfarer-Extension-Scripts/`;
      alert(msg);
      console.error(msg);
    }
    return;
  }

  // Ab hier existiert wfes garantiert -> Logger ist überall verfügbar
  const logger = new window.UserScriptLogger(SCRIPT_NAME, true);

  if (!window.wfes.f.hasMinVersion(BASE_MIN_VERSION)) {
    const msg = `${SCRIPT_NAME}: Need at least wfes-Base version ${BASE_MIN_VERSION}. Please upgrade.`;
    logger.warn(msg);
    window.wfes.f.createNotification(msg, "red", { autoclose: 60 });
    return;
  }

  // === Skript-spezifische Konfiguration & Logik ===============

  const CSS_ID = "wfes-urlifyCSS";
  const CSS_STYLE = `.wfes-extLnkBtn{
        border: 2pt solid white;
        border-radius: 2pt;
        width: 17pt;
        height: 17pt;
        font-size: 14px;
        background-color: white;
        color: black;
        display: inline-block;
        box-shadow: 0 0 2px grey;
      }
  `;

  const myReg = /((https?:\/\/)[-\w@:%_+.~#?,&/=!]+)/g;
  // const supStmtSel = "app-supporting-info-b > wf-review-card-b > div.wf-review-card__body > div > div.mt-2.bg-gray-200.px-4.py-2.ng-star-inserted";
  const supStmtSel = "#root > div > div > div > div > main > section > div > div:nth-child(1) > div.grid.grid-cols-1.gap-4.lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_minmax(0,3fr)] > div:nth-child(3) > div > div.wf-review-card__body.flex.w-full.min-w-0.flex-1.overflow-y-auto > div > div > div.rounded-2xl.bg-wf-surface-contrast.p-5.text-base.leading-6.font-medium.text-wf-text-on-contrast";
  // Button setzen
  function setSmallButton(url, elem) {
    const wfesExtLnkBtn = document.createElement("a");
    wfesExtLnkBtn.setAttribute("target", "_blank");
    wfesExtLnkBtn.setAttribute("class", "wfes-extLnkBtn");
    wfesExtLnkBtn.setAttribute("title", encodeURI(url));
    wfesExtLnkBtn.href = encodeURI(url);
    wfesExtLnkBtn.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'><path fill-rule='evenodd' d='M10.604 1h4.146a.25.25 0 01.25.25v4.146a.25.25 0 01-.427.177L13.03 4.03 9.28 7.78a.75.75 0 01-1.06-1.06l3.75-3.75-1.543-1.543A.25.25 0 0110.604 1zM3.75 2A1.75 1.75 0 002 3.75v8.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 12.25v-3.5a.75.75 0 00-1.5 0v3.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-8.5a.25.25 0 01.25-.25h3.5a.75.75 0 000-1.5h-3.5z'/></svg>";
    elem.appendChild(wfesExtLnkBtn);
  }

  function detectURL() {
    const candidate = window.wfes.g.reviewPageData();
    window.wfes.f.addCSS(CSS_ID, CSS_STYLE);

    if (candidate.statement !== "undefined") {
      const urls = candidate.statement.match(myReg);
      if (urls !== null) {
        window.wfes.f.waitForElem(supStmtSel)
          .then(elem => {
            urls.forEach(function(url) {
              setSmallButton(url, elem);
            });
          })
          .catch((e) => {console.warn(GM_info.script.name, ": ", e);});
      }
    }
  }

  const init = ()=> {
    window.addEventListener("WFESReviewPageNewLoaded", detectURL);
  };

  // === Start ==================================================
  init();
  logger.info(`Script loaded: version: ${SCRIPT_VERSION}`);

})();