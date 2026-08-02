import chalk from "chalk";
import { git, isGitRepo, currentBranch } from "../utils/git.js";

export async function log(options) {
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

  const count = options.number || "10";
  const args = options.graph
    ? ["log", "--oneline", "--decorate", "--graph", "-n", String(count)]
    : ["log", "--oneline", "--decorate", "-n", String(count)];

  const output = await git(args);
  if (!output) {
    console.log(chalk.green("No commits yet."));
    return;
  }

  const branch = await currentBranch();
  console.log(chalk.bold(`Last ${count} commits on ${chalk.cyan(branch)}:`));

  for (const line of output.split("\n")) {
    if (!line) continue;

    // With --graph the left side is ASCII graph art, so pass lines through
    // as-is rather than trying to re-parse columns.
    if (options.graph) {
      console.log(`  ${line}`);
      continue;
    }

    const space = line.indexOf(" ");
    const hash = line.slice(0, space);
    const subject = line.slice(space + 1);
    const coloredSubject = subject.replace(
      /\(([^)]*)\)/g,
      (match, inner) => chalk.green(`(${inner})`)
    );
    console.log(`  ${chalk.yellow(hash)} ${coloredSubject}`);
  }
}
