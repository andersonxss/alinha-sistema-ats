const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const command = "npm.cmd test --workspace @sistema-ats/frontend -- --config ../docs/auditoria-refatoracao-frontend/vitest.config.mts";
const result = spawnSync("cmd.exe", ["/d", "/s", "/c", command], {
  cwd: path.resolve(__dirname, "../.."), encoding: "utf8", windowsHide: true,
});
const output = (result.stdout || "") + (result.stderr || "");
fs.writeFileSync(path.join(__dirname, "dashboard-lento.log"), output);
fs.writeFileSync(path.join(__dirname, "dashboard-lento-resultado.json"), JSON.stringify({command,exitCode:result.status,checkedAt:new Date().toISOString()},null,2));
console.log(output);
process.exitCode = result.status ?? 1;
