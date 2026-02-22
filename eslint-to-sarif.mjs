import { readFileSync, writeFileSync } from "fs";
import process from "node:process";

try {
  const input = readFileSync(0, "utf8");

  if (!input) {
    console.error("Keine Daten von ESLint empfangen.");
    process.exit(1);
  }

  const eslintJson = JSON.parse(input);

  // Zählen, wie viele echte Meldungen wir haben
  const totalMessages = eslintJson.reduce((sum, file) => sum + file.messages.length, 0);
  console.log(`Gefundene ESLint-Meldungen: ${totalMessages}`);

  const sarifOutput = {
    $schema: "https://www.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [{
      tool: {
        driver: {
          name: "ESLint",
          informationUri: "https://eslint.org"
        }
      },
      results: eslintJson.flatMap(file => file.messages.map(msg => ({
        ruleId: msg.ruleId || "generic",
        level: 2 === msg.severity ? "error" : "note",
        message: { text: msg.message },
        locations: [{
          physicalLocation: {
            artifactLocation: {
              uri: file.filePath.replace(process.cwd() + "/", "")
            },
            region: {
              startLine: msg.line || 1,
              startColumn: msg.column || 1
            }
          }
        }]
      })))
    }]
  };

  writeFileSync("results.sarif", JSON.stringify(sarifOutput, null, 2));
  if (totalMessages > 0) {
    console.log("✅ results.sarif mit Ergebnissen erstellt.");
  } else {
    console.log("ℹ️ Keine Fehler gefunden. results.sarif ist leer (planmäßig).");
  }
} catch (err) {
  console.error("Fehler:", err.message);
  process.exit(1);
}
