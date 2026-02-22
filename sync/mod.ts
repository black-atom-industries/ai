import { resolve } from "@std/path";
import { parseArgs } from "@std/cli";
import { config } from "../platforms/claude/mod.ts";
import { discoverLocalRepos } from "./discover.ts";
import { applySync, type SyncResult } from "./apply.ts";

const aiRoot = resolve(new URL(".", import.meta.url).pathname, "..");

const args = parseArgs(Deno.args, {
    string: ["repo"],
});

let repos: string[];

if (args.repo) {
    // Single repo mode (used by CI)
    repos = [resolve(args.repo)];
    console.log(`Syncing to: ${repos[0]}\n`);
} else {
    // Discovery mode (local dev)
    console.log("Discovering local repos...");
    repos = await discoverLocalRepos(aiRoot);
    console.log(`Found ${repos.length} repos\n`);
}

const results: SyncResult[] = [];

for (const repo of repos) {
    const result = await applySync(repo, config, aiRoot);
    results.push(result);

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

const totalCreated = results.reduce((sum, r) => sum + r.created.length, 0);
const totalModified = results.reduce((sum, r) => sum + r.modified.length, 0);
const totalUnchanged = results.reduce((sum, r) => sum + r.unchanged.length, 0);

console.log(
    `\nDone: ${totalCreated} created, ${totalModified} modified, ${totalUnchanged} unchanged`,
);
