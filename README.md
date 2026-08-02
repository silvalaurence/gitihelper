<div align="center">

# 🐙 gt — a friendly git helper CLI

**Common git workflows, collapsed into single commands.**

Save, sync, inspect, and clean up your repos without remembering long chains of `git` flags.

---

**`init` · `save` · `sync` · `status` · `log` · `undo` · `cleanup` · `branch`**

</div>

---

## ✨ What it does

Instead of typing several `git` commands to get one thing done, `gt` turns each small workflow into a single command:

| Command | What it does |
|---------|--------------|
| `gt init "msg" [url]` | Create a repo, make the first commit, and push (optionally set the remote) |
| `gt save "message"` | Stage **everything**, commit, and push — one command |
| `gt sync` | `fetch` + `rebase` your branch onto its remote |
| `gt status` | A clean, **colorized** status with staged / unstaged / untracked / conflict sections |
| `gt log` | Pretty-printed last N commits (optionally with the commit graph) |
| `gt undo` | Safely soft-reset your last commit (asks for confirmation first) |
| `gt cleanup` | Find and delete local branches already merged into `main`/`master` |
| `gt branch "name"` | Create and checkout a branch with a type prefix (default `feature/`) |

## 🚀 Install

```bash
# 1. Download the project
git clone https://github.com/<your-user>/gt-cli.git
cd gt-cli

# 2. Install dependencies
npm install

# 3. (optional) Make `gt` available globally on your machine
npm link
```

> Prefer not to `npm link`? Run it directly:
>
> ```bash
> node /path/to/gt-cli/bin/gt.js <command>
> ```

## 🧑‍💻 Usage

```bash
# Start a brand-new project (creates repo, first commit, push)
gt init "first initialization" "https://github.com/you/gt-cli.git"
gt init "local start" --no-push          # init + commit only (no remote)

# Save work
gt save "fixed login bug"        # stage all + commit + push
gt save "wip" --no-push          # commit only, skip the push

# Keep in sync with the remote
gt sync

# Inspect state
gt status
gt log                           # last 10 commits
gt log -n 20 --graph             # 20 commits, with the graph

# Fix mistakes
gt undo                          # undo last commit, keep changes staged

# Housekeeping
gt branch login                # create + checkout feature/login
gt branch login --type fix     # create + checkout fix/login
gt cleanup                     # delete merged local branches
```

### A note about `gt save`

- It stages **all** changes (`git add -A`), so the message should describe the whole change set.
- Files matched by `.gitignore` (e.g. `node_modules/`) are never staged.
- Pass `--no-push` to commit locally without pushing.

### `gt sync` safety

`gt sync` now refuses to run if a merge, rebase, or cherry-pick is already in progress — it will tell you to resolve or abort first instead of blindly rebasing on top of conflicts.

## ⚙️ Configuration (`.gtrc`)

`gt` reads an optional JSON config to customize its defaults. Precedence (highest wins):

1. `<project>/.gtrc` — project-local
2. `~/.gtrc` — your home folder
3. built-in defaults

```json
{ "pushOnSave": false, "defaultBranch": "main" }
```

| Key | Default | What it does |
|-----|---------|--------------|
| `pushOnSave` | `true` | When `false`, `gt save` / `gt init` skip pushing by default |
| `defaultBranch` | `main` | Branch name used by `gt init` |

## 🗂 Project structure

```
gt-cli/
├── bin/
│   └── gt.js              # entry point — wires up commander
├── src/
│   ├── commands/          # init · save · sync · status · log · undo · cleanup · branch
│   └── utils/
│       ├── git.js         # shared helpers for running git commands
│       └── config.js      # loads .gtrc settings
├── test/                  # node:test unit tests
├── .gitignore
└── package.json
```

## 🧪 Tests

```bash
npm test
```

## 🗺 Roadmap

### ✅ Core (v1.0) — shipped
`gt init` · `gt save` · `gt sync` · `gt status` · `gt log` · `gt undo` · `gt cleanup` · `gt branch`, plus `.gtrc` config and merge-conflict protection in `sync`.

### 🔜 v1.1 — Daily workflow helpers
- `gt amend "new message"` — rewrite your last commit's message
- `gt squash <n> "message"` — combine the last N commits into one
- `gt diff [--stat]` — colorized diff of pending changes
- `gt stash` / `gt stash pop` — quickly stash & restore work
- `gt switch <branch>` — move between existing branches

### 🛡 v1.2 — Safety & reliability
- **Main-branch protection** — confirm before `gt save` pushes to `main`/`master`
- `--no-verify` on `save`/`init` to skip pre-commit hooks
- Warn when working on a detached `HEAD` before `save`/`sync`
- Consistent exit codes + a test for every command

### ⚙️ v1.3 — Config & developer experience
- More `.gtrc` keys (default branch type, remote name, log length)
- `gt config get/set` — view & edit settings from the CLI
- `gt alias` — print shell aliases for your terminal profile

### 🚀 v2.0 — Publishing & polish
- Publish to npm (`npm i -g @you/gt-cli`) — add `files`/`engines` fields
- GitHub Actions CI running `npm test` on every push/PR
- Terminal spinners + richer progress output
- (optional) TypeScript migration

### Want to help shape it?
Pick any unchecked item above — open an issue or PR, or just ask and I'll build it with you.

## 🤝 Contributing

Found a bug or have an idea for a command? Open an issue or a pull request — contributions are welcome.

## 📄 License

[MIT](./LICENSE)

