import chalk from "chalk";
import { git, isGitRepo, currentBranch, aheadBehind } from "../utils/git.js";

const LABELS = {
  M: "modified",
  A: "added",
  D: "deleted",
  R: "renamed",
  C: "copied",
  T: "type changed",
  U: "unmerged",
};

/**
 * Parses one line of `git status --porcelain` (short format: "XY path")
 * and buckets it into staged / unstaged / untracked / unmerged.
 */
function parseLine(line) {
  const index = line[0];
  const worktree = line[1];
  const file = line.slice(3);

  if (index === "?" && worktree === "?") {
    return { group: "untracked", label: "untracked", color: chalk.gray, file };
  }

  if (index === "U" || worktree === "U") {
    return { group: "unmerged", label: "unmerged", color: chalk.red, file };
  }

  // A file can be both staged AND modified in the worktree (e.g. "MM") —
  // push it into both buckets, exactly like real `git status` does.
  const stagedLabel = LABELS[index] ? `staged ${LABELS[index]}` : null;
  const worktreeLabel = LABELS[worktree] ? LABELS[worktree] : null;

  if (stagedLabel || worktreeLabel) {
    const entries = [];
    if (stagedLabel) entries.push({ group: "staged", label: stagedLabel, color: chalk.green, file });
    if (worktreeLabel) entries.push({ group: "unstaged", label: worktreeLabel, color: chalk.yellow, file });
    return entries;
  }

  return [{ group: "other", label: `state ${index}${worktree}`, color: chalk.yellow, file }];
}

export async function status() {
  let isRepo;
  try {
    isRepo = await isGitRepo();
  } catch (error) {
    console.error(chalk.red(error.message));
    process.exitCode = 1;
    return;
  }

  if (!isRepo) {
    console.error(chalk.red("Not inside a git repository."));
    process.exitCode = 1;
    return;
  }

  const branch = await currentBranch();
  const { ahead, behind, noUpstream } = await aheadBehind();

  console.log(chalk.bold(`On branch ${chalk.cyan(branch)}`));

  if (noUpstream) {
    console.log(chalk.yellow("No upstream branch set."));
  } else if (ahead === 0 && behind === 0) {
    console.log(chalk.green("Up to date with origin."));
  } else {
    if (ahead > 0) console.log(chalk.yellow(`${ahead} commit(s) ahead of origin`));
    if (behind > 0) console.log(chalk.yellow(`${behind} commit(s) behind origin`));
  }

  const porcelain = await git(["status", "--porcelain"], { raw: true });
  if (!porcelain) {
    console.log(chalk.green("\nWorking tree clean."));
    return;
  }

  const buckets = { staged: [], unstaged: [], untracked: [], unmerged: [], other: [] };
  const lines = porcelain.split("\n");
  for (const line of lines) {
    if (!line) continue;
    const entries = parseLine(line);
    for (const entry of entries) {
      buckets[entry.group].push(entry);
    }
  }

  const section = (title, entries) => {
    if (entries.length === 0) return;
    console.log(chalk.bold(`\n${title}:`));
    for (const entry of entries) {
      console.log(`  ${entry.color(entry.label.padEnd(14))} ${entry.file}`);
    }
  };

  section("Changes to be committed", buckets.staged);
  section("Changes not staged for commit", buckets.unstaged);
  section("Untracked files", buckets.untracked);
  section("Unmerged paths (fix conflicts)", buckets.unmerged);
  section("Other", buckets.other);
}
