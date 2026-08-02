<div align="center">

# 🐙 gt — a friendly git helper CLI

**Common git workflows, collapsed into single commands.**

Save, sync, inspect, and clean up your repos without remembering long chains of `git` flags.

---

**`save` · `sync` · `status` · `log` · `undo` · `cleanup`**

</div>

---

## What it does

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

## Install

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

## Usage

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
gt cleanup                       # delete merged local branches
```

### A note about `gt save`

- It stages **all** changes (`git add -A`), so the message should describe the whole change set.
- Files matched by `.gitignore` (e.g. `node_modules/`) are never staged.
- Pass `--no-push` to commit locally without pushing.

## 🗂 Project structure

```
gt-cli/
├── bin/
│   └── gt.js              # entry point — wires up commander
├── src/
│   ├── commands/          # init · save · sync · status · log · undo · cleanup
│   └── utils/
│       └── git.js         # shared helpers for running git commands
├── test/                  # node:test unit tests
├── .gitignore
└── package.json
```

## 🧪 Tests

```bash
npm test
```

## 🛣 Roadmap (v3)

- `gt branch <name>` — create + checkout a branch following a naming convention
- Config file (`.gtrc`) to customize defaults like push-on-save behavior
- Auto-detect and warn about merge conflicts before attempting `sync`

## 🤝 Contributing

Found a bug or have an idea for a command? Open an issue or a pull request — contributions are welcome.

## 📄 License

[MIT](./LICENSE)

