import { execa } from "execa";

function formatGitError(error) {
  if (!error) return "An unknown Git error occurred.";

  if (error.code === "ENOENT") {
    return "Git is not installed or not available on PATH.";
  }

  if (error.stderr) {
    return error.stderr.trim() || error.message;
  }

  return error.message;
}

/**
 * Runs a git command and returns trimmed stdout.
 * Throws if the command fails (execa default behavior).
 */
export async function git(args, options = {}) {
  const { raw = false, ...execaOptions } = options;
  try {
    const { stdout } = await execa("git", args, execaOptions);
    // For output like `git status --porcelain`, leading spaces on each
    // line are meaningful — a plain .trim() would eat the first line's
    // leading space and misalign column parsing. `raw` preserves lines
    // as-is aside from a trailing newline.
    return raw ? stdout.replace(/\n+$/, "") : stdout.trim();
  } catch (error) {
    throw new Error(formatGitError(error));
  }
}

/** Returns true if we're inside a git repository. */
export async function isGitRepo() {
  try {
    await git(["rev-parse", "--is-inside-work-tree"]);
    return true;
  } catch (error) {
    if (error instanceof Error && /Git is not installed|not available|ENOENT/i.test(error.message)) {
      throw error;
    }
    return false;
  }
}

/** Returns the current branch name. */
export async function currentBranch() {
  // `symbolic-ref --short` works even on an unborn branch (no commits yet),
  // unlike `rev-parse --abbrev-ref` which fails with "ambiguous HEAD".
  try {
    return await git(["symbolic-ref", "--short", "HEAD"]);
  } catch {
    // Detached HEAD or unusual state — fall back to the configured default.
    const fallback = await git(["config", "--get", "init.defaultBranch"]).catch(() => "");
    return fallback || "main";
  }
}

/** Returns true if a git remote with the given name exists. */
export async function hasRemote(name = "origin") {
  try {
    const output = await git(["remote"]);
    return output.split("\n").map((s) => s.trim()).includes(name);
  } catch {
    return false;
  }
}

/** Returns true if there are uncommitted changes (staged or unstaged). */
export async function hasUncommittedChanges() {
  const output = await git(["status", "--porcelain"], { raw: true });
  return output.length > 0;
}

/** Returns the default branch (main or master), guessing sensibly. */
export async function defaultBranch() {
  try {
    // Works if origin/HEAD is set locally
    const ref = await git(["symbolic-ref", "refs/remotes/origin/HEAD"]);
    return ref.replace("refs/remotes/origin/", "");
  } catch {
    // Fallback: check which of main/master exists
    const branches = await git(["branch", "--list", "main", "master"]);
    if (branches.includes("main")) return "main";
    if (branches.includes("master")) return "master";
    return "main"; // last resort default
  }
}

/** Returns list of local branches already merged into the given base branch. */
export async function mergedBranches(base) {
  const output = await git(["branch", "--merged", base]);
  return output
    .split("\n")
    .map((line) => line.replace("*", "").trim())
    .filter((name) => name && name !== base);
}

/** Returns ahead/behind counts relative to the branch's upstream. */
export async function aheadBehind() {
  try {
    const output = await git([
      "rev-list",
      "--left-right",
      "--count",
      "HEAD...@{u}",
    ]);
    const [ahead, behind] = output.split(/\s+/).map(Number);
    return { ahead, behind };
  } catch {
    // No upstream configured
    return { ahead: 0, behind: 0, noUpstream: true };
  }
}
