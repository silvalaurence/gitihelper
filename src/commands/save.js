import chalk from "chalk";
import { git, isGitRepo, currentBranch } from "../utils/git.js";
import { loadConfig } from "../utils/config.js";

export async function save(message, options) {
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
    console.error(chalk.red('Please provide a commit message: gt save "your message"'));
    process.exitCode = 1;
    return;
  }

  const branch = await currentBranch();
  const config = loadConfig();
  const shouldPush = config.pushOnSave !== false && options.push !== false;

  console.log(chalk.cyan("Staging changes..."));
  await git(["add", "-A"]);

  console.log(chalk.cyan(`Committing to ${chalk.bold(branch)}...`));
  let committed = true;
  try {
    await git(["commit", "-m", message]);
  } catch (err) {
    // git exits non-zero both when there is genuinely nothing to commit
    // AND when the commit really failed (hooks, bad message, ...). Only
    // treat the "nothing to commit" case as a no-op; surface everything else.
    if (/nothing to commit|nothing added to commit/i.test(err.message)) {
      console.log(chalk.yellow("Nothing to commit — working tree clean."));
      committed = false;
    } else {
      console.error(chalk.red(`Commit failed: ${err.message}`));
      process.exitCode = 1;
      return;
    }
  }

  if (shouldPush) {
    if (!committed) {
      console.log(chalk.gray("Skipping push — nothing to commit."));
    } else {
      console.log(chalk.cyan(`Pushing to origin/${branch}...`));
      try {
        await git(["push", "origin", branch]);
      } catch (err) {
        // Only fall back to `-u` when the branch genuinely has no upstream;
        // any other push failure should stop loudly instead of retrying.
        if (/no upstream|has no upstream branch|does not have a tracking branch/i.test(err.message)) {
          console.log(chalk.yellow("No upstream set — pushing with -u..."));
          await git(["push", "-u", "origin", branch]);
        } else {
          console.error(chalk.red(`Push failed: ${err.message}`));
          process.exitCode = 1;
          return;
        }
      }
    }
  } else if (config.pushOnSave === false && options.push !== false) {
    console.log(chalk.gray("pushOnSave is disabled in .gtrc — skipping push."));
  }

  console.log(chalk.green(`Done. Saved to ${branch}.`));
}
