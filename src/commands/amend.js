import chalk from "chalk";
import inquirer from "inquirer";
import { git, isGitRepo, currentBranch } from "../utils/git.js";

export async function amend(message, options) {
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

  if (!message) {
    console.error(chalk.red("Please provide a message: gt amend \"new message\""));
    process.exitCode = 1;
    return;
  }

  const branch = await currentBranch();

  const lastCommit = await git(["log", "-1", "--oneline"]).catch(() => null);
  if (!lastCommit) {
    console.log(chalk.yellow("No commits yet — nothing to amend."));
    return;
  }

  console.log(chalk.cyan(`Last commit on ${chalk.bold(branch)}:`));
  console.log(`  ${lastCommit}`);

  const { confirmed } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmed",
      message: `Amend it to: "${message}"? (rewrites history)`,
      default: false,
    },
  ]);

  if (!confirmed) {
    console.log(chalk.yellow("Cancelled — nothing changed."));
    return;
  }

  const args = ["commit", "--amend", "-m", message];
  if (options?.noVerify) args.push("--no-verify");
  await git(args);
  console.log(chalk.green(`Amended. Last commit is now "${message}".`));
}
