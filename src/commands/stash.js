import chalk from "chalk";
import { git, isGitRepo } from "../utils/git.js";

export async function stash(action) {
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

  if (action === "pop") {
    const list = await git(["stash", "list"], { raw: true }).catch(() => "");
    if (!list.trim()) {
      console.log(chalk.yellow("No stashes to pop."));
      return;
    }

    await git(["stash", "pop"]).catch((err) => {
      console.error(chalk.red(err.message));
      console.log(chalk.yellow("If you hit conflicts, resolve them, then drop the stash with: git stash drop"));
      process.exitCode = 1;
      return;
    });
    console.log(chalk.green("Stash popped. Changes restored."));
    return;
  }

  if (action && action !== "push") {
    console.error(chalk.red(`Unknown action "${action}". Use: gt stash or gt stash pop`));
    process.exitCode = 1;
    return;
  }

  await git(["stash", "push", "-u"]);
  console.log(chalk.green("Work stashed (including untracked files)."));
}
