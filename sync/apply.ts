import { join, basename } from "jsr:@std/path@1";
import { ensureDir } from "jsr:@std/fs@1";
import type { PlatformConfig } from "../platforms/claude/types.ts";

export interface SyncResult {
    repo: string;
    created: string[];
    modified: string[];
    unchanged: string[];
}

/** Snapshot of files before sync, for cleanup purposes */
export interface FileSnapshot {
    /** Map of absolute file path → original content (null if file didn't exist) */
    files: Map<string, string | null>;
}

/**
 * Capture the current state of files that would be modified by sync.
 * Only snapshots files that haven't been captured yet.
 */
export async function snapshotFiles(
    repoPath: string,
    config: PlatformConfig,
    aiRoot: string,
    existing: FileSnapshot,
): Promise<void> {
    // Snapshot skill target files
    const sourceDir = join(aiRoot, config.skills.sourceDir);
    try {
        for await (const entry of Deno.readDir(sourceDir)) {
            if (!entry.isFile || !entry.name.endsWith(".md")) continue;
            const targetName = `${config.skills.prefix}${entry.name}`;
            const targetPath = join(repoPath, config.skills.targetDir, targetName);

            if (!existing.files.has(targetPath)) {
                try {
                    existing.files.set(targetPath, await Deno.readTextFile(targetPath));
                } catch {
                    existing.files.set(targetPath, null);
                }
            }
        }
    } catch {
        // Source dir doesn't exist yet
    }

    // Snapshot context target file
    const contextTarget = join(repoPath, config.context.targetFile);
    if (!existing.files.has(contextTarget)) {
        try {
            existing.files.set(contextTarget, await Deno.readTextFile(contextTarget));
        } catch {
            existing.files.set(contextTarget, null);
        }
    }
}

/**
 * Restore files from snapshot. Deletes files that didn't exist before.
 */
export async function restoreFromSnapshot(snapshot: FileSnapshot): Promise<string[]> {
    const restored: string[] = [];

    for (const [path, original] of snapshot.files) {
        try {
            if (original === null) {
                await Deno.remove(path);
                restored.push(`deleted: ${path}`);
            } else {
                await Deno.writeTextFile(path, original);
                restored.push(`restored: ${path}`);
            }
        } catch {
            // File may already be gone, that's fine
        }
    }

    return restored;
}

/**
 * Apply sync for a single repo: copy skills and merge org context.
 */
export async function applySync(
    repoPath: string,
    config: PlatformConfig,
    aiRoot: string,
): Promise<SyncResult> {
    const result: SyncResult = {
        repo: repoPath,
        created: [],
        modified: [],
        unchanged: [],
    };

    // --- Sync skills ---
    const sourceDir = join(aiRoot, config.skills.sourceDir);
    const targetDir = join(repoPath, config.skills.targetDir);

    await ensureDir(targetDir);

    try {
        for await (const entry of Deno.readDir(sourceDir)) {
            if (!entry.isFile || !entry.name.endsWith(".md")) continue;

            const sourceContent = await Deno.readTextFile(join(sourceDir, entry.name));
            const targetName = `${config.skills.prefix}${entry.name}`;
            const targetPath = join(targetDir, targetName);

            let existingContent: string | null = null;
            try {
                existingContent = await Deno.readTextFile(targetPath);
            } catch {
                // File doesn't exist yet
            }

            if (existingContent === sourceContent) {
                result.unchanged.push(targetPath);
            } else {
                await Deno.writeTextFile(targetPath, sourceContent);
                if (existingContent === null) {
                    result.created.push(targetPath);
                } else {
                    result.modified.push(targetPath);
                }
            }
        }
    } catch {
        // Source dir doesn't exist
    }

    // --- Merge org context ---
    const contextSource = join(aiRoot, config.context.sourceFile);
    const contextTarget = join(repoPath, config.context.targetFile);

    let orgContent: string;
    try {
        orgContent = await Deno.readTextFile(contextSource);
    } catch {
        // No org context file, skip
        return result;
    }

    const markedContent = [
        config.context.startMarker,
        orgContent.trim(),
        config.context.endMarker,
    ].join("\n");

    let existingTarget: string;
    try {
        existingTarget = await Deno.readTextFile(contextTarget);
    } catch {
        // No existing file — create with just the org section
        await Deno.writeTextFile(contextTarget, markedContent + "\n");
        result.created.push(contextTarget);
        return result;
    }

    const startIdx = existingTarget.indexOf(config.context.startMarker);
    const endIdx = existingTarget.indexOf(config.context.endMarker);

    let newContent: string;
    if (startIdx !== -1 && endIdx !== -1) {
        // Replace between markers
        const before = existingTarget.substring(0, startIdx);
        const after = existingTarget.substring(endIdx + config.context.endMarker.length);
        newContent = before + markedContent + after;
    } else {
        // No markers — prepend org section
        newContent = markedContent + "\n\n" + existingTarget;
    }

    if (newContent === existingTarget) {
        result.unchanged.push(contextTarget);
    } else {
        await Deno.writeTextFile(contextTarget, newContent);
        result.modified.push(contextTarget);
    }

    return result;
}
