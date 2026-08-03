import chalk from "chalk";
import { git, isGitRepo, hasUncommittedChanges } from "../utils/git.js";

export async function switchBranch(name) {
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

  if (!name) {
    const branches = await git(["branch"], { raw: true });
    console.log(chalk.cyan("Available branches:"));
    console.log(branches || chalk.yellow("  (no branches yet)"));
    return;
  }

  const exists = await git(["branch", "--list", name]);
  if (!exists) {
    console.error(chalk.red(`Branch "${name}" does not exist. Use gt branch <name> to create it.`));
    process.exitCode = 1;
    return;
  }

  const dirty = await hasUncommittedChanges();
  if (dirty) {
    console.log(chalk.yellow("Note: you have uncommitted changes that may carry over."));
  }

  try {
    await git(["checkout", name]);
  } catch (err) {
    console.error(chalk.red(`Could not switch to ${name}: ${err.message}`));
    process.exitCode = 1;
    return;
  }

  console.log(chalk.green(`On branch ${name}.`));
}
