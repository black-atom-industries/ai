import { config } from "../platforms/claude/mod.ts";
import { discoverLocalRepos } from "./discover.ts";
import { applySync, type FileSnapshot, restoreFromSnapshot, snapshotFiles } from "./apply.ts";

const aiRoot = new URL(".", import.meta.url).pathname.replace("/sync/", "");

console.log("Discovering local repos...");
const repos = await discoverLocalRepos(aiRoot);
console.log(`Found ${repos.length} repos\n`);

// Snapshot files before first sync
const snapshot: FileSnapshot = { files: new Map() };

for (const repo of repos) {
    await snapshotFiles(repo, config, aiRoot, snapshot);
}
console.log(`Captured ${snapshot.files.size} file snapshots\n`);

// Register cleanup handler
let cleaning = false;
Deno.addSignalListener("SIGINT", async () => {
    if (cleaning) return;
    cleaning = true;

    console.log("\n\nCleaning up...");
    const restored = await restoreFromSnapshot(snapshot);
    for (const entry of restored) {
        console.log(`  ${entry}`);
    }
    console.log(`\nRestored ${restored.length} files. Goodbye.`);
    Deno.exit(0);
});

// Initial sync
async function syncAll(): Promise<void> {
    for (const repo of repos) {
        const result = await applySync(repo, config, aiRoot);
        const repoName = repo.split("/").pop()!;
        const changes = result.created.length + result.modified.length;

        if (changes > 0) {
            console.log(
                `  ${repoName}: ${result.created.length} created, ${result.modified.length} modified`,
            );
        } else {
            console.log(`  ${repoName}: up to date`);
        }
    }
}

console.log("Running initial sync...");
await syncAll();
console.log("\nWatching for changes... (Ctrl+C to stop and restore files)\n");

// Watch for changes
const watchDirs = ["src", "platforms"].map((dir) => `${aiRoot}/${dir}`);
const watcher = Deno.watchFs(watchDirs);

let debounceTimer: number | undefined;

for await (const event of watcher) {
    if (event.kind === "access") continue;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
        const paths = event.paths.map((p) => p.replace(aiRoot + "/", "")).join(", ");
        console.log(`Change detected: ${paths}`);
        console.log("Re-syncing...");
        await syncAll();
        console.log("");
    }, 300);
}
