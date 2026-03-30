# Black Atom Industries

A collection of cohesive dark/light themes for developer tools. Themes are defined once in `core` and generated for each platform via adapters.

## Architecture

- **core** — Single source of truth for all theme definitions (Deno/TypeScript)
- **Adapters** — Platform-specific repos (nvim, ghostty, zed, wezterm, tmux, etc.) that consume core definitions
- Each adapter has a `black-atom-adapter.json` and Eta templates
- Core CLI (`black-atom-core generate`) processes templates into platform-specific files

## Theme Structure

Themes are organized into **collections** (`default`, `stations`, `jpn`, `terra`, `mnml`), each containing variants with dark/light appearances.

Each theme defines:

- **Primaries** — Base color ranges (dark d10-d40, mid m10-m40, light l10-l40)
- **Palette** — 16-color terminal palette (ANSI colors)
- **UI** — Interface colors derived from primaries (backgrounds, foregrounds, accents)
- **Syntax** — Syntax highlighting colors derived from primaries

**Adapters must never use primaries directly.** Always use UI, syntax, or palette colors:

- `<%= theme.ui.bg.default %>` — not `<%= theme.primaries.d10 %>`
- `<%= theme.palette.red %>` — not hardcoded hex values

## Development Workflow

1. Theme changes happen in `core/src/themes/`
2. Generate adapter output: `deno task adapters:gen` (from core)
3. Test generated themes in target applications
4. Commit with conventional commits (see commit conventions)

## Issue Tracking

All work is tracked in [GitHub Issues](https://github.com/orgs/black-atom-industries/projects). Reference issues in commits: `feat: add feature #123`

## Code Style

- **TypeScript**: 4 spaces, 100 char width, double quotes, semicolons
- **Naming**: camelCase for variables/functions, PascalCase for types/interfaces
- **Lua**: Follow stylua, snake_case
