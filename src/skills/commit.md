---
name: bai-commit
description: Use when committing changes in any Black Atom repository. Ensures conventional commit format for release-please, includes GitHub issue references, and follows org conventions.
disable-model-invocation: true
allowed-tools: Bash, Read, Grep, Glob
---

# Black Atom Commit

Create a well-formed conventional commit for the current changes. This skill ensures commits follow Black Atom conventions and are compatible with release-please.

**Arguments:** $ARGUMENTS (optional: commit type override or additional context)

## Process

### 1. Analyze Changes

Run these commands to understand what changed:

```bash
git status
git diff --staged
git diff
```

If nothing is staged, identify the relevant changed files and present them to the user for selective staging.

### 2. Check for GitHub Issue Context

Look for a linked issue in this order:

1. Current branch name (pattern: `feature/NNN-*` or `fix/NNN-*`)
2. Recent conversation context mentioning a GitHub issue number
3. If no issue found, proceed without one — don't ask unless the user mentioned one

Extract the issue number (e.g., `#123`).

### 3. Determine Commit Type

Based on the nature of changes:

| Type       | When to use                                      |
| ---------- | ------------------------------------------------ |
| `feat`     | New functionality, theme, collection, or feature |
| `fix`      | Bug fix, color correction                        |
| `refactor` | Structural change, no behavior change            |
| `style`    | Formatting, whitespace, minor styling            |
| `docs`     | Documentation only                               |
| `chore`    | Maintenance (deps, CI config)                    |
| `test`     | Adding or updating tests                         |
| `perf`     | Performance improvement                          |
| `ci`       | CI/CD changes                                    |

If $ARGUMENTS includes a type (e.g., "fix" or "feat"), use it.

### 4. Determine Scope

Optional but encouraged. Derive from the changed file paths:

- `themes/default`, `themes/jpn`, `themes/mnml`, etc. for collection changes
- `cli` for CLI tool changes
- `adapters` for adapter system changes
- `sync` for sync engine changes
- Omit scope for broad changes touching many areas

### 5. Propose the Commit

Present the proposed commit to the user:

```
Proposed commit:
  Type: feat
  Scope: themes/mnml
  Message: add cyan dark variant
  Issue: #245
  Files to stage: src/themes/mnml/cyan-dark.ts, src/themes/mnml/mod.ts

  Full message: feat(themes/mnml): add cyan dark variant #245
```

Wait for user approval or modifications.

### 6. Execute the Commit

On approval:

1. Check if `deno.json` exists in the repo root. If so, run `deno task format` first.
2. Stage the specific files (never `git add -A` or `git add .`):
   ```bash
   git add <file1> <file2> ...
   ```
3. Commit using HEREDOC for proper formatting:
   ```bash
   git commit -m "$(cat <<'EOF'
   feat(themes/mnml): add cyan dark variant #245
   EOF
   )"
   ```
4. Show the result with `git log -1 --oneline`.

## Rules

- **Never** use `git add -A` or `git add .`
- **Never** add co-author credits or AI tool references
- **Never** push unless explicitly asked
- **Always** use imperative mood: "add feature" not "added feature"
- **Always** use HEREDOC for commit messages
- Keep first line under 72 characters
- Use `!` after type for breaking changes: `feat!:` or `fix!:`
