export interface SkillsConfig {
    /** Source directory containing skill .md files (relative to ai repo root) */
    sourceDir: string;
    /** Target directory in each repo where skills are placed */
    targetDir: string;
    /** Prefix added to skill filenames to avoid collisions with repo-local skills */
    prefix: string;
}

export interface ContextConfig {
    /** Source file containing org context (relative to ai repo root) */
    sourceFile: string;
    /** Target file in each repo where org context is merged */
    targetFile: string;
    /** Marker indicating start of org-managed section */
    startMarker: string;
    /** Marker indicating end of org-managed section */
    endMarker: string;
}

export interface PlatformConfig {
    /** Platform identifier */
    name: string;
    /** How skills are mapped from source to target repos */
    skills: SkillsConfig;
    /** How org context is merged into each repo's instruction file */
    context: ContextConfig;
}
