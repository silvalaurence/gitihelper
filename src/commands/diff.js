import chalk from "chalk";
import { git, isGitRepo } from "../utils/git.js";

export async function diff(options) {
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

  const args = ["diff", "--color=always"];
  if (options.stat) args.push("--stat");
  if (options.staged) args.push("--staged");

  const output = await git(args, { raw: true }).catch((err) => {
    console.error(chalk.red(err.message));
    process.exitCode = 1;
    return null;
  });
  if (output === null) return;

  if (!output) {
    console.log(chalk.green("No changes to show."));
    return;
  }

  console.log(output);
}
