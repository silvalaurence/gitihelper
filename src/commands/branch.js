import chalk from "chalk";
import { git, isGitRepo, currentBranch } from "../utils/git.js";

export async function branch(name, options) {
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
    console.error(chalk.red('Please provide a branch name: gt branch <name>'));
    process.exitCode = 1;
    return;
  }

  const type = options.type || "feature";
  const branchName = `${type}/${name}`;

  const current = await currentBranch();
  console.log(chalk.cyan(`Creating ${chalk.bold(branchName)} from ${chalk.bold(current)}...`));
  try {
    await git(["checkout", "-b", branchName]);
  } catch (err) {
    console.error(chalk.red(`Could not create branch ${branchName}: ${err.message}`));
    process.exitCode = 1;
    return;
  }

  console.log(chalk.green(`On branch ${branchName}.`));
}
