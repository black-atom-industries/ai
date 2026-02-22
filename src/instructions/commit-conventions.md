# Commit Conventions

Black Atom uses [Conventional Commits](https://www.conventionalcommits.org/) to drive automated releases via release-please.

## Format

```
<type>(<scope>): <description> [<issue-ref>]

<optional body>
```

## Types

| Type       | When to use                                    | Release impact |
| ---------- | ---------------------------------------------- | -------------- |
| `feat`     | New functionality (theme, collection, feature) | Minor bump     |
| `fix`      | Bug fix, color correction                      | Patch bump     |
| `refactor` | Structural change, no behavior change          | No release     |
| `style`    | Formatting, whitespace, minor styling          | No release     |
| `docs`     | Documentation only                             | No release     |
| `chore`    | Maintenance (deps, CI config)                  | No release     |
| `test`     | Adding or updating tests                       | No release     |
| `perf`     | Performance improvement                        | No release     |
| `ci`       | CI/CD changes                                  | No release     |

## Breaking Changes

Add `!` after the type to trigger a **major** version bump:

```
feat!: rename all theme keys to use kebab-case
fix!: change palette structure from array to object
```

## Scope

Optional but encouraged. Maps to the area of change:

- `themes/default`, `themes/jpn`, `themes/mnml` — theme collection changes
- `cli` — CLI tool changes
- `adapters` — adapter system changes
- `sync` — sync engine changes (ai repo)

## Issue References

Append Linear issue ID in brackets when a task is linked:

```
feat(themes/mnml): add blue variant [DEV-245]
fix: correct contrast ratio in light themes [DEV-250]
```

## Rules

- Keep the description concise (under 72 chars for first line)
- Use imperative mood: "add feature" not "added feature"
- No co-author credits or AI tool references
- Stage specific files (`git add <file>`), never `git add -A`
- Run `deno task format` before committing (if deno.json exists in repo)
- Use HEREDOC for multi-line commit messages

## Examples

```bash
# Good
feat(themes/mnml): add cyan dark variant [DEV-245]
fix: correct ANSI color mapping for dark themes
refactor(cli): simplify template processing pipeline
docs: update adapter development guide
chore: update deno dependencies

# Bad
update stuff                          # no type, vague
feat: Add new theme.                  # capitalized, period
fix(themes): fix the thing            # "fix the thing" is meaningless
FEAT: add feature                     # uppercase type
```
