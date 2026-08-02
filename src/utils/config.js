import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const DEFAULTS = {
  pushOnSave: true,
  defaultBranch: "main",
};

function tryRead(file) {
  try {
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

/**
 * Loads the gt configuration by merging defaults with any user config.
 *
 * Precedence (highest wins):
 *   1. `<cwd>/.gtrc`   — project-local
 *   2. `~/.gtrc`        — user/home level
 *   3. built-in defaults
 */
export function loadConfig() {
  const local = tryRead(path.join(process.cwd(), ".gtrc"));
  const home = tryRead(path.join(os.homedir(), ".gtrc"));
  return { ...DEFAULTS, ...home, ...local };
}
