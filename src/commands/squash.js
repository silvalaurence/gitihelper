import chalk from "chalk";
import inquirer from "inquirer";
import { git, isGitRepo, currentBranch } from "../utils/git.js";

/**
 * Resolves the commit to reset back to when squashing the last N commits.
 * Returns { base, isRoot } where isRoot is true when HEAD~N doesn't exist
 * (e.g. squashing every commit in a fresh repo) and the squash must replace
 * the root commit itself.
 */
async function squashBase(n) {
  try {
    return { base: await git(["rev-parse", `HEAD~${n}`]), isRoot: false };
  } catch {
    return { base: await git(["rev-list", "--max-parents=0", "HEAD"]), isRoot: true };
  }
}

export async function squash(count, message, options) {
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

  const n = Number(count);
  if (!Number.isInteger(n) || n < 2) {
    console.error(chalk.red("Please provide a count of at least 2: gt squash <n> \"message\""));
    process.exitCode = 1;
    return;
  }

  if (!message) {
    console.error(chalk.red("Please provide a message: gt squash <n> \"message\""));
    process.exitCode = 1;
    return;
  }

  const branch = await currentBranch();

  const commits = await git(["log", `-${n}`, "--oneline"]).catch(() => null);
  if (!commits || commits.split("\n").filter(Boolean).length < n) {
    console.log(chalk.yellow(`Only ${commits ? commits.split("\n").filter(Boolean).length : 0} commit(s) exist — nothing to squash.`));
    return;
  }

  console.log(chalk.cyan(`Combining the last ${n} commits on ${chalk.bold(branch)}:`));
  for (const line of commits.split("\n")) {
    if (line) console.log(`  ${line}`);
  }

  const { confirmed } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmed",
      message: `Squash them into one commit: "${message}"? (rewrites history)`,
      default: false,
    },
  ]);

  if (!confirmed) {
    console.log(chalk.yellow("Cancelled — nothing changed."));
    return;
  }

  const { base, isRoot } = await squashBase(n);
  await git(["reset", "--soft", base]);

  // When resetting past the root commit, the new commit must replace it.
  const commitArgs = isRoot ? ["commit", "--amend", "-m", message] : ["commit", "-m", message];
  if (options?.noVerify) commitArgs.push("--no-verify");
  await git(commitArgs);

  console.log(chalk.green(`Squashed ${n} commits into one: "${message}".`));
}
