// userscript-logger.js
// wegen der *monkey Sandboxen
const globalWindow = "undefined" === typeof unsafeWindow ? window : unsafeWindow;

globalWindow.UserScriptLogger = (function() {
  "use strict";

  class CustomLogBuilder {
    constructor(prefix) {
      this.formatStr = `%c${prefix}`;
      this.styles = ["color: #777; font-weight: bold;"]; // Prefix-Style

      // Hier speichern wir die Stile für das *aktuelle* Wort/Segment
      this.currentStyles = [];
    }

    // Interne Hilfsfunktion: Schließt das aktuelle Segment ab und wendet die gesammelten Styles an
    _pushSegment(msg) {
      this.formatStr += `%c${msg}`;

      // Wenn keine Styles für dieses Segment definiert wurden, nutzen wir den Browser-Standard
      if (0 === this.currentStyles.length) {
        this.styles.push("color: inherit; font-weight: normal; font-style: normal; background: transparent; padding: 0;");
      } else {
        this.styles.push(this.currentStyles.join(" "));
      }

      // Setzt die Stile für das nächste Segment wieder zurück
      this.currentStyles = [];
    }

    // --- AUSGABE / SEGMENT-ABSCHLUSS ---
    // Normaler Text (beendet das vorherige Styling)
    text(msg) {
      this._pushSegment(msg);
      return this;
    }

    // --- STIL-MODIFIKATOREN (Kombinierbar!) ---
    // Textfarben
    red() { this.currentStyles.push("color: #f44336;"); return this; }
    yellow() { this.currentStyles.push("color: #ff9800;"); return this; }
    green() { this.currentStyles.push("color: #4caf50;"); return this; }
    blue() { this.currentStyles.push("color: #00bcd4;"); return this; }
    white() { this.currentStyles.push("color: #ffffff;"); return this; }

    // Hintergrundfarben (inklusive etwas Padding für schönere Optik)
    bgRed() { this.currentStyles.push("background: #f44336; padding: 1px 4px; border-radius: 3px;"); return this; }
    bgYellow() { this.currentStyles.push("background: #ff9800; padding: 1px 4px; border-radius: 3px;"); return this; }
    bgGreen() { this.currentStyles.push("background: #4caf50; padding: 1px 4px; border-radius: 3px;"); return this; }
    bgBlue() { this.currentStyles.push("background: #00bcd4; padding: 1px 4px; border-radius: 3px;"); return this; }
    bgDark() { this.currentStyles.push("background: #222222; padding: 1px 4px; border-radius: 3px;"); return this; }

    // Formatierungen
    bold() { this.currentStyles.push("font-weight: bold;"); return this; }
    italic() { this.currentStyles.push("font-style: italic;"); return this; }

    // Gibt alles aus
    print(...optionalParams) {
      // Falls vor dem .print() noch ein gestylter Text steht, der noch nicht gepusht wurde:
      if (this.currentStyles.length > 0) {
        // Wenn direkt gedruckt wird, nehmen wir an, dass das letzte Segment leer war oder
        // wir pushen einfach einen leeren String mit den Styles (falls man am Ende stylen wollte)
        this._pushSegment("");
      }
      console.log(this.formatStr, ...this.styles, ...optionalParams);
    }
  }

  // Hauptloggerklasse
  return class Logger {
    constructor(scriptName, debugMode = true) {
      this.scriptName = scriptName;
      this.debugMode = debugMode;
      this.styles = {
        info:    "color: #00bcd4; font-weight: bold; background: #222; padding: 2px 6px; border-radius: 3px;",
        success: "color: #4caf50; font-weight: bold; background: #222; padding: 2px 6px; border-radius: 3px;",
        warn:    "color: #ff9800; font-weight: bold; background: #222; padding: 2px 6px; border-radius: 3px;",
        error:   "color: #f44336; font-weight: bold; background: #222; padding: 2px 6px; border-radius: 3px;",
        debug:   "color: #b0bec5; font-style: italic;"
      };
    }
    _baseLog(type, message, ...optionalParams) {
      if ("debug" === type && !this.debugMode) {return;}
      const style = this.styles[type] || "";
      const prefix = `[${this.scriptName}] [${type.toUpperCase()}]`;
      if (style) { console.log(`%c${prefix}`, style, message, ...optionalParams); } else { console.log(prefix, message, ...optionalParams); }
    }
    info(msg, ...args) { this._baseLog("info", msg, ...args); }
    success(msg, ...args) { this._baseLog("success", msg, ...args); }
    warn(msg, ...args) { this._baseLog("warn", msg, ...args); }
    error(msg, ...args) { this._baseLog("error", msg, ...args); }
    debug(msg, ...args) { this._baseLog("debug", msg, ...args); }

    custom() { return new CustomLogBuilder(`[${this.scriptName}] `); }
  };
})();
