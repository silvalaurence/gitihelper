import chalk from "chalk";
import { git, isGitRepo, currentBranch, isDetachedHead, hasUncommittedChanges, hasMergeInProgress } from "../utils/git.js";

export async function sync() {
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

  if (await isDetachedHead()) {
    console.error(chalk.red("You're on a detached HEAD — nothing to sync."));
    console.log(chalk.gray('Checkout a branch first: gt switch <branch>'));
    process.exitCode = 1;
    return;
  }

  if (await hasUncommittedChanges()) {
    console.error(
      chalk.red("You have uncommitted changes. Commit or stash them before syncing.")
    );
    console.log(chalk.gray('Tip: run "gt save \\"wip\\"" first, or "git stash".'));
    process.exitCode = 1;
    return;
  }

  if (await hasMergeInProgress()) {
    console.error(chalk.red("A merge or rebase is already in progress."));
    console.log(
      chalk.gray("Resolve the conflicts first, then run: git rebase --continue")
    );
    console.log(chalk.gray("Or abort with: git rebase --abort / git merge --abort"));
    process.exitCode = 1;
    return;
  }

  const branch = await currentBranch();
  console.log(chalk.cyan(`Fetching latest for ${branch}...`));
  await git(["fetch", "origin"]);

  console.log(chalk.cyan(`Rebasing ${branch} onto origin/${branch}...`));
  try {
    await git(["rebase", `origin/${branch}`]);
    console.log(chalk.green("Sync complete — up to date with origin."));
  } catch (err) {
    console.error(chalk.red("Rebase hit a conflict."));
    console.log(
      chalk.gray("Resolve conflicts, then run: git rebase --continue")
    );
    console.log(chalk.gray("Or abort with: git rebase --abort"));
    process.exitCode = 1;
  }
}
