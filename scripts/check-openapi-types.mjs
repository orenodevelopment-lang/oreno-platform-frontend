import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const directory = mkdtempSync(join(tmpdir(), "oreno-openapi-"));
const output = join(directory, "schema.d.ts");
const cli = resolve("node_modules/openapi-typescript/bin/cli.js");

try {
  execFileSync(process.execPath, [cli, "openapi/openapi.json", "-o", output], { stdio: "pipe" });
  const expected = readFileSync("lib/api/schema.d.ts", "utf8").replaceAll("\r\n", "\n");
  const actual = readFileSync(output, "utf8").replaceAll("\r\n", "\n");
  if (actual !== expected) {
    console.error("Generated API types have drifted. Run npm run api:generate and commit the result.");
    process.exitCode = 1;
  } else {
    console.log("Generated API types match openapi/openapi.json.");
  }
} finally {
  rmSync(directory, { recursive: true, force: true });
}
