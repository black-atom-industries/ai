# BAI Skills — Integration Handoff

## Context

Black Atom Industries has 8 org-wide skills that were previously stored globally in `~/.agents/skills/`. They've been moved here for project-level discovery. This document outlines what's needed to make them fully functional from this repo.

## Skills Moved

All in `_standalone/` (temporary — not yet integrated with the sync engine):

| Skill | Purpose |
|---|---|
| bai-create | Create a new BAI issue |
| bai-create-project | Bootstrap a new BAI project |
| bai-ready | Show issues ready to work (no blockers) |
| bai-review | Review and clean up BAI issues |
| bai-status | Show my BAI issues |
| bai-update | Update issue status, labels, relations |
| bai-weekly | Weekly issue review — board health, staleness |
| about-black-atom-industries | BAI org context |

## Current State

The `ai/` repo has a working sync engine (`sync/mod.ts`) that:

1. Discovers sibling repos in `~/repos/black-atom-industries/`
2. Copies skills from `src/skills/` → each repo's `.claude/skills/` (with `bai-` prefix)
3. Merges org context from `src/org-context.md` → each repo's `CLAUDE.md`

Currently only `platforms/claude/mod.ts` is configured. Only one skill exists: `src/skills/commit.md`.

## What Needs to Happen

### 1. Add Pi Platform Config

Create `platforms/pi/mod.ts` that syncs to `.agents/skills/<name>/SKILL.md` instead of `.claude/skills/bai-<name>.md`:

```ts
import type { PlatformConfig } from "./types.ts";

export const config: PlatformConfig = {
    name: "pi",
    skills: {
        sourceDir: "src/skills-pi",
        targetDir: ".agents/skills",
        prefix: "", // Pi uses directory-based discovery (skill-name/SKILL.md)
    },
    context: {
        sourceFile: "src/org-context.md",
        targetFile: "AGENTS.md",
        startMarker: "<!-- BAI:ORG START -->",
        endMarker: "<!-- BAI:ORG END -->",
    },
};
```

The tricky part: Pi discovers skills as `skill-name/SKILL.md` files, not as flat `bai-<name>.md`. The sync engine's `prefix` approach won't work as-is for Pi. You may need to:
- Create a separate source dir (`src/skills-pi/`) with proper directory structure
- Or modify the sync engine to handle directory-based targets

### 2. Convert Skills to Sync Format

The skills in `_standalone/` use the standard Agent Skills format (frontmatter + SKILL.md). Sync expects plain markdown files. Decide:
- Keep frontmatter → files are self-contained but have 5 lines of YAML overhead
- Strip frontmatter → consistent with existing `src/skills/commit.md` style

### 3. Populate `src/` Directories

After deciding on format, either:
- Move to `src/skills/` (Claude Code format, flat files)
- Or create `src/skills-pi/` (Pi format, directory-based)

### 4. Run the Sync

```bash
cd ~/repos/black-atom-industries/ai
deno task sync
```

### 5. Remove from Global

After sync is verified, delete from `~/.agents/skills/` (should already be done if you're reading this).

### 6. Test

Open Pi in any BAI repo and verify `/skill:bai-create` etc. are available.

## Architecture Notes

Pi discovers `.agents/skills/` in the current repo root. Since each BAI subdirectory (core, livery, etc.) is its own git repo, skills need to be synced into each repo individually — there's no cross-repo discovery yet.

Long-term: the sync engine handles this automatically. Short-term: `deno task sync` after any skill change.
