## What is it?
Userscripts/Tools for [NIANTIC WAYFARER](https://wayfarer.nianticlabs.com/)
> Userscript manager such as [Tampermonkey](https://tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/) required!

---

## How to install / use?
Install [WFES Base](wfes-Base.user.js) first!
> **It's required for all other scripts to work.**

---

## List of scripts
* [Nomination Notify](wfes-NominationNotify.user.js)
    - show nomination status updates
* [ImageMod](wfes-ImageMod.user.js)
    - open fullsize images in "named" tabs
* [Translation tools](en/translations.html)
    - adds tools to translate text associated with a wayspot
* [Wayfarer Stats](wfes-WayfarerStats.user.js)
    - saves some personal statistics in local browser storage, migrated from [OPR Stats](https://gitlab.com/fotofreund0815/opr-stats/)
* [Dupes Scroll](wfes-dupesScroll.user.js)
    - use mouse wheel to scroll the dupes filmstrip
* [Showcase](wfes-Showcase.user.js)
    - add's an icon for the game used for submitting the featured wayspot
* [Add Orig Location](wfes-reviewAddOrigLocation.user.js)
    - add marker for original location on location edits
* [Store Appeal Information](wfes-AppealData.user.js)
    - saves your appeal statement in browser storage for future review
* [Expire Timer](wfes-ExpireTimer.user.js)
    - Adds a simple timer to the top of the screen showing how much time you have left on the current review.
* [URLify](wfes-URLify.user.js)
    - detect URLs in supporting text and create links
* [AutoHold](wfes-AutoHold.user.js)
    - searches for '#hold' in supporting statement and puts nomination on hold ([documentation](en/autohold.html))

### Unsupported scripts / scripts in beta state
Some of these scripts are a quick migration from MrJPGames' Wayfarer Toolkit Scripts. They
may work or not. If you are a developer, have a look at it and fix bugs. :-)

Other scripts are new, untested or still in development.

* [Nomination page StreetView](wfes-NominationsStreetView.user.js)
    - Adds the streetview view a reviewer will see on your own nominations!
* [Nomination Details](wfes-NominationDetail.user.js)
    - adds long text description for rejection criteria
    - shows reject reasons for appealed nominations
* [Show version](wfes-showWFVersion.user.js)
    - show current Wayfarer version
* [Review Improve CSS](en/reviewImproveCSS.html)
    - increases height for images and titel/description cards
    - removes padding and description text

### obsolete ore outdated scripts
These scripts are outdated and will not be developed further. The functionality is no longer needed because Wayfarer has changed or bugs have been fixed.

* [Add Street Address](wfes-reviewAddStreetAddress.user.js) - obsolete because Wayfarer shows the address again
     - fixes missing street address from WF5.2
* [Open In](wfes-OpenIn.user.js)
    - add "Open In" for maps - discontinued - use tehstone's "Open In" instead

---

## Bugs and known problems

Report bugs and/or feature requests in the [Issue Tracker](https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues).

You may also use the Wayfarer Discord for questions around Wayfarer and the tools.
It's linked at [wayfarer.tools](https://wayfarer.tools/), where you can find more UserScripts for Wayfarer.

## License and copyright

Copyright {{CURRENT_YEAR}} AlterTobi

Wayfarer Extension Scripts are free software: you can redistribute and/or modify
them under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Wayfarer Extension Scripts are distributed in the hope that they will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
[GNU General Public License](LICENSE.txt) for more details.
