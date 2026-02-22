import type { PlatformConfig } from "./types.ts";

export const config: PlatformConfig = {
    name: "claude",
    skills: {
        sourceDir: "src/skills",
        targetDir: ".claude/skills",
        prefix: "bai-",
    },
    context: {
        sourceFile: "src/org-context.md",
        targetFile: "CLAUDE.md",
        startMarker: "<!-- BAI:ORG START -->",
        endMarker: "<!-- BAI:ORG END -->",
    },
};
