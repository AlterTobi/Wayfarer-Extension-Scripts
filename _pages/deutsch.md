## Was ist das hier?
Userscripts/Tools für [NIANTIC WAYFARER](https://wayfarer.nianticlabs.com/)
> ein Userscript Manager wie z.B. [Tampermonkey](https://tampermonkey.net/) oder [Violentmonkey](https://violentmonkey.github.io/) ist erforderlich!

---

# Installation
Zuerst [WFES Base](wfes-Base.user.js) installieren!
> **Dieses Skript ist erforderlich, damit alle anderen funktionieren.**

---

## Liste der Skripte
* [Nomination Notify](wfes-NominationNotify.user.js)
    - erkennt und zeigt Änderungen des Status eigener Einreichungen
* [ImageMod](wfes-ImageMod.user.js)
    - öffne Originalfotos in "benannten" Tabs
* [Übersetzungstools](de/translations.html)
    - fügt Möglichkeiten zum Übersetzen der Texte hinzu
* [Wayfarer Stats](wfes-WayfarerStats.user.js)
    - speichert persönliche Statistiken im Browser Local Storage
* [Dupes Scroll](wfes-dupesScroll.user.js)
    - Nutze das Mausrad zum Scrollen in der Dupes-Liste
* [Showcase](wfes-Showcase.user.js)
    - zeigt, über welches Spiel der Wayspot eingereicht wurde 
* [Add Orig Location](wfes-reviewAddOrigLocation.user.js)
    - zeigt bei Standortbearbeitung einen Marker für den Originalstandort 
* [Store Appeal Information](wfes-AppealData.user.js)
    - eigene Appealtexte im Browser speichern
* [Expire Timer](wfes-ExpireTimer.user.js)
    - Countdown der verbleibenden Zeit für die aktuelle Bewertung 
* [URLify](wfes-URLify.user.js)
    - erkennt URLs im Zusatztext und macht Links daraus
* [AutoHold](wfes-AutoHold.user.js)
    - erkennt '#hold' im Zusatztext und stellt Nominierung zurück ([Dokumentation](de/autohold.html))

### Nichtunterstützte Skripte / Skripte in Entwicklung
Manche dieser Skripte sind eine schnelle Migration von MrJPGames' Wayfarer Toolkit. Es ist nicht garantiert, dass sie funktionieren. Wenn du ein Entwickler bist, schau sie dir an und behebe Fehler. :-)
Andere Skripte sind neu, ungetestet, noch in Entwicklung oder veraltet.
 
* [Nomination page StreetView](wfes-NominationsStreetView.user.js)
    - Fügt bei den eigenen Nominierungen eine Streetview-Ansicht hinzu, wie es die Bewerter sehen würden
* [Nomination Details](wfes-NominationDetail.user.js)
    - ergänzt die Ablehngründe um den Langtext
    - Zeigt die Ablehngründe auch bei Einsprüchen an
* [Show version](wfes-showWFVersion.user.js)
    - zeigt die aktuelle Wayfarer-Version an
* [Open In](wfes-OpenIn.user.js)
    - fügt "Open In" für Karten hinzu - wird nicht weiterentwickelt - nutze stattdessen tehstones "Open In"
* [Add Street Address](wfes-reviewAddStreetAddress.user.js)
     - fügt die seit Version 5.2 fehlende Adresse wieder hinzu
* [Review Improve CSS](de/reviewImproveCSS.html)
    - Verschiedene Layout-Änderungen für Bewertungen am Desktop

---

## Fehler und bekannte Probleme

Eine Liste bekannter Probleme findet sich im [Issue Tracker](https://github.com/AlterTobi/Wayfarer-Extension-Scripts/issues).
Dort könnt ihr auch neue Probleme oder Erweiterungswünsche melden.

## Weitere Tools und Kontaktmöglichkeiten

Eine Kontaktmöglichkeit für Fragen rund um Wayfarer und die Tools ist der Wayfarer Discord (englisch).
Den Link findet ihr auf [wayfarer.tools](https://wayfarer.tools/), wo es auch weitere Skripte zu Wayfarer gibt.

Des weiteren gibt es auch einen [deutschsprachigen Discord](https://discord.gg/9m2WvAC8N9) und eine [Telegram-Gruppe](https://t.me/wayfarerdach), wo sich mit anderen Usern ausgetauscht werden kann.

## Lizenz und Copyright

Copyright {{CURRENT_YEAR}} AlterTobi

Wayfarer Extension Scripts sind Freie Software: Sie können sie unter den Bedingungen
der GNU General Public License, wie von der Free Software Foundation,
Version 3 der Lizenz oder (nach Ihrer Wahl) jeder neueren
veröffentlichten Version, weiter verteilen und/oder modifizieren.

Wayfarer Extension Scripts werden in der Hoffnung, dass sie nützlich sein werden, aber
OHNE JEDE GEWÄHRLEISTUNG, bereitgestellt; sogar ohne die implizite
Gewährleistung der MARKTFÄHIGKEIT oder EIGNUNG FÜR EINEN BESTIMMTEN ZWECK.
Siehe die [GNU General Public License](LICENSE.txt) für weitere Details.
