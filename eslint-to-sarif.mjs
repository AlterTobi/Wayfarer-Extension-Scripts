import { readFileSync, writeFileSync } from "fs";
import process from "node:process";

try {
  // Liest den JSON-Output direkt aus der Pipe
  const input = readFileSync(0, "utf8");
  if (!input) {
    console.error("Keine Daten von ESLint empfangen.");
    process.exit(1);
  }

  const eslintJson = JSON.parse(input);

  const sarifOutput = {
    $schema: "https://json.schemastore.org",
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
  console.log("✅ results.sarif wurde erstellt.");
} catch (err) {
  console.error("Fehler bei der SARIF-Konvertierung:", err.message);
  process.exit(1);
}
