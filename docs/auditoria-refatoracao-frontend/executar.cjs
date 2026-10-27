const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { createHash } = require("node:crypto");
const root = path.resolve(__dirname, "../..");
const results = [];
const commands = [
  ["tipos", "npm.cmd run typecheck"],
  ["backend", "npm.cmd run test:backend"],
  ["frontend", "npm.cmd run test:frontend"],
  ["build", "npm.cmd run build --workspace @sistema-ats/frontend"],
  ["verify", "node .agents/skills/onp-spec-driven/scripts/onp-spec.mjs verify refatoracao-frontend"],
  ["audit", "node .agents/skills/onp-spec-driven/scripts/onp-spec.mjs audit --ci"],
];
for (const [name, command] of commands) {
  const startedAt = new Date().toISOString();
  const result = spawnSync("cmd.exe", ["/d", "/s", "/c", command], {
    cwd: root, encoding: "utf8", windowsHide: true, timeout: 180000,
    maxBuffer: 10 * 1024 * 1024,
  });
  const output = (result.stdout || "") + (result.stderr || "");
  fs.writeFileSync(path.join(__dirname, name + ".log"), output);
  const row = { name, command, startedAt, finishedAt: new Date().toISOString(), exitCode: result.status, error: result.error?.message ?? null };
  results.push(row);
  fs.writeFileSync(path.join(__dirname, "resultados.json"), JSON.stringify(results, null, 2));
  console.log(`${name}: exit ${result.status}`);
  if (name === "audit" || name === "verify") console.log(output);
}
const hashes = {};
function collect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(file);
    else hashes[path.relative(root, file).replaceAll("\\", "/")] = createHash("sha256").update(fs.readFileSync(file)).digest("hex");
  }
}
collect(path.join(root, "frontend/src"));
collect(path.join(root, "frontend/tests"));
for (const relative of ["onpspec.config.json", "docs/plano-refatoracao-frontend.md", "frontend/package.json", "package.json", "package-lock.json"]) {
  hashes[relative] = createHash("sha256").update(fs.readFileSync(path.join(root, relative))).digest("hex");
}
fs.writeFileSync(path.join(__dirname, "sha256.json"), JSON.stringify(hashes, null, 2));
