import chalk from "chalk";
import inquirer from "inquirer";
import { git, isGitRepo, currentBranch } from "../utils/git.js";

export async function undo() {
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

  // Make sure there is at least one commit to undo.
  const lastCommit = await git(["log", "-1", "--oneline"]).catch(() => null);
  if (!lastCommit) {
    console.log(chalk.yellow("No commits yet — nothing to undo."));
    return;
  }

  console.log(chalk.cyan(`Last commit on ${chalk.bold(branch)}:`));
  console.log(`  ${lastCommit}`);

  const { confirmed } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmed",
      message: "Soft-reset this commit (changes stay staged)?",
      default: false,
    },
  ]);

  if (!confirmed) {
    console.log(chalk.yellow("Cancelled — nothing changed."));
    return;
  }

  await git(["reset", "--soft", "HEAD~1"]);
  console.log(chalk.green(`Undone. Changes from "${lastCommit}" are now staged.`));
}
