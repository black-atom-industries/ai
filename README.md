# Black Atom Industries — AI Configuration

Org-wide AI coding tool configuration for [Black Atom Industries](https://github.com/black-atom-industries).

## What This Does

This repo is the single source of truth for AI agent configuration across all Black Atom repositories. It syncs:

- **Org context** — Architecture overview, conventions, and workflow docs injected into each repo's `CLAUDE.md`
- **Skills** — Interactive workflows (e.g., commit conventions) distributed to each repo's `.claude/skills/`

## Structure

```
src/                    # Platform-agnostic source content
├── org-context.md      # Org section injected into CLAUDE.md
├── skills/             # Shared skills
└── instructions/       # Reference docs (commit conventions, etc.)

platforms/              # Platform-specific transform configs
└── claude/             # Claude Code: maps src → .claude/ structure

sync/                   # Sync engine
├── mod.ts              # One-shot sync (used by CI)
└── dev.ts              # Watch mode with cleanup (local dev)
```

## Usage

### Local Development

```bash
# One-shot sync to all sibling repos
deno task sync

# Watch mode — syncs on change, restores files on Ctrl+C
deno task dev
```

### Release Flow

Pushing to `main` triggers release-please. Merging the release PR creates a GitHub release, which triggers the sync workflow to open PRs in all org repos.

## Adding Content

- **Skills:** Add `.md` files to `src/skills/`. They'll be synced as `bai-<name>.md` to avoid collisions with repo-local skills.
- **Org context:** Edit `src/org-context.md`. Content is injected between `<!-- BAI:ORG START -->` and `<!-- BAI:ORG END -->` markers in each repo's `CLAUDE.md`.
