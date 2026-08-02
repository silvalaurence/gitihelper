import chalk from "chalk";
import inquirer from "inquirer";
import { git, isGitRepo, defaultBranch, mergedBranches, currentBranch } from "../utils/git.js";

export async function cleanup() {
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

  const base = await defaultBranch();
  const active = await currentBranch();
  console.log(chalk.cyan(`Checking for branches merged into ${chalk.bold(base)}...`));

  let candidates = await mergedBranches(base);
  candidates = candidates.filter((b) => b !== active);

  if (candidates.length === 0) {
    console.log(chalk.green("Nothing to clean up — no merged branches found."));
    return;
  }

  console.log(chalk.bold("\nMerged branches:"));
  candidates.forEach((b) => console.log(`  - ${b}`));

  const { confirmed } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmed",
      message: `Delete these ${candidates.length} branch(es)?`,
      default: false,
    },
  ]);

  if (!confirmed) {
    console.log(chalk.yellow("Cancelled — no branches deleted."));
    return;
  }

  for (const branch of candidates) {
    try {
      await git(["branch", "-d", branch]);
      console.log(chalk.green(`Deleted ${branch}`));
    } catch (err) {
      console.log(chalk.red(`Could not delete ${branch} (may have unmerged work).`));
    }
  }

  console.log(chalk.green("\nCleanup complete."));
}
