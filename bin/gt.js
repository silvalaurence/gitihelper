#!/usr/bin/env node
import { Command } from "commander";
import { save } from "../src/commands/save.js";
import { sync } from "../src/commands/sync.js";
import { status } from "../src/commands/status.js";
import { init } from "../src/commands/init.js";
import { cleanup } from "../src/commands/cleanup.js";
import { log } from "../src/commands/log.js";
import { undo } from "../src/commands/undo.js";
import { branch } from "../src/commands/branch.js";

const program = new Command();

program
  .name("gt")
  .description("A friendly CLI that wraps common git workflows into single commands.")
  .version("0.1.0");

program
  .command("init <message> [url]")
  .description("Initialize a repo, make the first commit, and push")
  .option("--no-push", "commit only, skip the push")
  .action((message, url, options) => init(message, url, options));

program
  .command("save <message>")
  .description("Stage all changes, commit with a message, and push")
  .option("--no-push", "commit only, skip the push")
  .action((message, options) => save(message, options));

program
  .command("sync")
  .description("Fetch and rebase your current branch onto its remote counterpart")
  .action(sync);

program
  .command("status")
  .description("Show a clean, colorized git status")
  .action(status);

program
  .command("cleanup")
  .description("Delete local branches already merged into main/master")
  .action(cleanup);

program
  .command("log")
  .description("Show a clean, colorized git log")
  .option("-n, --number <count>", "number of commits to show", "10")
  .option("--graph", "show the commit graph", false)
  .action(log);

program
  .command("undo")
  .description("Soft-reset the last commit (changes stay staged)")
  .action(undo);

program
  .command("branch <name>")
  .description("Create and checkout a branch using a naming convention")
  .option("--type <type>", "branch type prefix (default: feature)", "feature")
  .action((name, options) => branch(name, options));

if (process.argv.length <= 2) {
  program.help();
} else {
  program.parseAsync().catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  });
}
