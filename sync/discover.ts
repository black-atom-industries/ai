import { join } from "jsr:@std/path@1";

const SELF_REPO = "ai";

/**
 * Discover Black Atom repos by scanning sibling directories.
 * Returns absolute paths to repos that contain a .git directory.
 */
export async function discoverLocalRepos(aiRoot: string): Promise<string[]> {
    const parentDir = join(aiRoot, "..");
    const repos: string[] = [];

    for await (const entry of Deno.readDir(parentDir)) {
        if (!entry.isDirectory || entry.name === SELF_REPO || entry.name.startsWith(".")) {
            continue;
        }

        const repoPath = join(parentDir, entry.name);
        try {
            const gitStat = await Deno.stat(join(repoPath, ".git"));
            if (gitStat.isDirectory) {
                repos.push(repoPath);
            }
        } catch {
            // Not a git repo, skip
        }
    }

    return repos.sort();
}

/**
 * Discover Black Atom repos via GitHub API.
 * Returns repo names (not full paths) for CI use.
 * Filters out archived repos and the ai repo itself.
 */
export async function discoverGitHubRepos(org: string): Promise<string[]> {
    const command = new Deno.Command("gh", {
        args: [
            "api",
            `orgs/${org}/repos`,
            "--paginate",
            "--jq",
            `.[] | select(.archived == false) | select(.name != "${SELF_REPO}") | .name`,
        ],
        stdout: "piped",
        stderr: "piped",
    });

    const { code, stdout, stderr } = await command.output();
    if (code !== 0) {
        const error = new TextDecoder().decode(stderr);
        throw new Error(`Failed to list GitHub repos: ${error}`);
    }

    const output = new TextDecoder().decode(stdout).trim();
    if (!output) return [];

    return output.split("\n").sort();
}
