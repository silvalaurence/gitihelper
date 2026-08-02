import chalk from "chalk";
import { git, isGitRepo, currentBranch, hasRemote } from "../utils/git.js";
import { loadConfig } from "../utils/config.js";

export async function init(message, url, options) {
  const config = loadConfig();
  const defaultBranchName = config.defaultBranch || "main";

  // 1. Initialize the repo if we're not already inside one.
  let alreadyRepo;
  try {
    alreadyRepo = await isGitRepo();
  } catch (error) {
    console.error(chalk.red(error.message));
    process.exitCode = 1;
    return;
  }

  if (!alreadyRepo) {
    console.log(chalk.cyan("Initializing git repository..."));
    await git(["init", "-b", defaultBranchName]);
  } else {
    console.log(chalk.cyan("Already inside a git repository — skipping init."));
  }

  const branch = await currentBranch();

  // 2. Point a remote at the given URL, if one was provided.
  if (url) {
    console.log(chalk.cyan(`Setting origin to ${url}...`));
    try {
      await git(["remote", "remove", "origin"]);
    } catch {
      // No existing origin — nothing to remove.
    }
    await git(["remote", "add", "origin", url]);
  }

  // 3. Stage and make the first commit.
  console.log(chalk.cyan("Staging changes..."));
  await git(["add", "-A"]);

  console.log(chalk.cyan(`Committing to ${chalk.bold(branch)}...`));
  let committed = true;
  try {
    await git(["commit", "-m", message]);
  } catch (err) {
    if (/nothing to commit|nothing added to commit/i.test(err.message)) {
      console.log(chalk.yellow("Nothing to commit — working tree clean."));
      committed = false;
    } else {
      console.error(chalk.red(`Commit failed: ${err.message}`));
      process.exitCode = 1;
      return;
    }
  }

  // 4. Push (respect --no-push / pushOnSave, and skip if no remote is set).
  const shouldPush = config.pushOnSave !== false && options.push !== false;
  if (shouldPush) {
    if (!committed) {
      console.log(chalk.gray("Skipping push — nothing to commit."));
    } else if (!(await hasRemote("origin"))) {
      console.log(
        chalk.yellow(
          'No remote set — skipping push. Add one with: gt init "<message>" <repo-url>'
        )
      );
    } else {
      console.log(chalk.cyan(`Pushing to origin/${branch}...`));
      try {
        await git(["push", "-u", "origin", branch]);
      } catch (err) {
        console.error(chalk.red(`Push failed: ${err.message}`));
        process.exitCode = 1;
        return;
      }
    }
  } else if (config.pushOnSave === false && options.push !== false) {
    console.log(chalk.gray("pushOnSave is disabled in .gtrc — skipping push."));
  }

  console.log(chalk.green(`Done. Initialized and saved to ${branch}.`));
}
