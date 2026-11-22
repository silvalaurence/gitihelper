<img src="site/logo.svg" alt="gitihelper" width="370">

gitihelper is a small CLI called `gt` that collapses common git workflows into single commands: save, sync, inspect, and clean up repos without remembering long chains of `git` flags.

## Run

1. `git clone https://github.com/silvalaurence/gitihelper.git && cd gitihelper`
2. `npm install`
3. `npm link` to use `gt` anywhere, or run `node /path/to/gitihelper/bin/gt.js <command>` directly.
4. Start a project with `gt init "first commit" <remote-url>` (or `--no-push` for a local-only start).
5. Save work with `gt save "message"` — it stages all changes, commits, and pushes. Use `--no-push` to skip the push and `--no-verify` to skip pre-commit hooks.
6. Keep in sync with `gt sync` (fetch + rebase). Inspect with `gt status`, `gt log [-n N] [--graph]`, and `gt diff [--stat] [--staged]`.
7. Fix and rework: `gt undo` (soft-reset the last commit), `gt amend "msg"`, `gt squash <n> "msg"`, `gt stash` / `gt stash pop`, `gt switch [name]`, `gt branch name [--type fix]`, `gt cleanup` (delete merged branches).

`gt save` stages **all** changes, so the message should describe the whole set; pushing to `main`/`master` asks for confirmation first. `gt sync` refuses to run during a merge, rebase, or cherry-pick, and on a detached `HEAD`. Settings come from an optional JSON `.gtrc` in the project or home folder, e.g. `{"pushOnSave": false, "defaultBranch": "main"}`; project settings win. Run `npm test` for the unit tests.

## Files

- `bin/gt.js` — CLI entry point
- `src/commands/` — one file per command
- `src/utils/git.js` — helpers for running git commands
- `src/utils/config.js` — `.gtrc` loading
- `test/` — node:test unit tests
- `package.json` — npm metadata and scripts
- `site/logo.svg` — README logo

MIT licensed. Contributions are welcome — open an issue or a pull request.
