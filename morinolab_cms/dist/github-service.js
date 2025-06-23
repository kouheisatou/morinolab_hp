"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubService = void 0;
const rest_1 = require("@octokit/rest");
// Electron import removed (no longer needed)
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – isomorphic-git may not have types until installed
const git = __importStar(require("isomorphic-git"));
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – sub-path types resolution handled after install
const node_1 = __importDefault(require("isomorphic-git/http/node"));
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore – this helper has no official types
const electron_oauth_github_1 = require("@electron-utils/electron-oauth-github");
const electron_1 = require("electron");
// -----------------------------------------------------------------------------
// Helper
// -----------------------------------------------------------------------------
function ensureDir(dir) {
    if (!node_fs_1.default.existsSync(dir)) {
        node_fs_1.default.mkdirSync(dir, { recursive: true });
    }
}
function toPercent(done, total) {
    if (!total)
        return 0;
    return Math.min(100, Math.round((done / total) * 100));
}
// -----------------------------------------------------------------------------
// GitHubService – 100 % pure isomorphic-git implementation
// -----------------------------------------------------------------------------
class GitHubService {
    octokit = null;
    config = null;
    authUser = null;
    lastConflictFiles = [];
    // ------------------------------------
    // Authentication & basic configuration
    // ------------------------------------
    async authenticate(token) {
        try {
            this.octokit = new rest_1.Octokit({ auth: token });
            const { data } = await this.octokit.rest.users.getAuthenticated();
            this.authUser = {
                login: data.login,
                name: data.name,
                email: data.email ?? null,
            };
            return true;
        }
        catch (err) {
            console.error('GitHub authentication failed:', err);
            this.octokit = null;
            return false;
        }
    }
    setRepositoryConfig(owner, repo, localPath, token) {
        if (!this.octokit)
            throw new Error('GitHub authentication required');
        this.config = { owner, repo, localPath, token };
    }
    // Convenience getter – throws if not configured
    get dir() {
        if (!this.config)
            throw new Error('Repository configuration required');
        return this.config.localPath;
    }
    // Convenience getter for author
    get author() {
        const name = this.authUser?.name || this.authUser?.login || 'MorinolabCMS';
        const email = this.authUser?.email || `${this.authUser?.login ?? 'unknown'}@users.noreply.github.com`;
        return { name, email };
    }
    // ------------------------------------
    // Repository operations – clone / pull / push
    // ------------------------------------
    async cloneRepository() {
        if (!this.config)
            throw new Error('Repository configuration required');
        try {
            const repoUrl = `https://github.com/${this.config.owner}/${this.config.repo}.git`;
            // fresh clone – remove existing directory if any
            if (node_fs_1.default.existsSync(this.dir)) {
                node_fs_1.default.rmSync(this.dir, { recursive: true, force: true });
            }
            ensureDir(node_path_1.default.dirname(this.dir));
            await git.clone({
                fs: node_fs_1.default,
                http: node_1.default,
                dir: this.dir,
                url: repoUrl,
                singleBranch: true,
                onAuth: () => ({ username: this.config.token, password: '' }),
            });
            // Store tokenised remote URL for later push / fetch
            const tokenisedUrl = `https://${this.config.token}@github.com/${this.config.owner}/${this.config.repo}.git`;
            await git.setConfig({ fs: node_fs_1.default, dir: this.dir, path: 'remote.origin.url', value: tokenisedUrl });
            return true;
        }
        catch (err) {
            console.error('Clone failed:', err);
            return false;
        }
    }
    async cloneRepositoryWithProgress(onProgress) {
        if (!this.config)
            throw new Error('Repository configuration required');
        try {
            const repoUrl = `https://github.com/${this.config.owner}/${this.config.repo}.git`;
            if (node_fs_1.default.existsSync(this.dir))
                node_fs_1.default.rmSync(this.dir, { recursive: true, force: true });
            ensureDir(node_path_1.default.dirname(this.dir));
            let lastPercent = 0;
            onProgress?.('クローンを開始...', 0);
            await git.clone({
                fs: node_fs_1.default,
                http: node_1.default,
                dir: this.dir,
                url: repoUrl,
                singleBranch: true,
                onAuth: () => ({ username: this.config.token, password: '' }),
                onProgress: (p) => {
                    const current = toPercent(p.loaded, p.total);
                    if (current > lastPercent) {
                        lastPercent = current;
                        onProgress?.('クローン中...', current);
                    }
                },
            });
            onProgress?.('クローン完了', 100);
            return true;
        }
        catch (err) {
            console.error('Clone (with progress) failed:', err);
            onProgress?.('クローンに失敗しました', 0);
            return false;
        }
    }
    async pullLatest() {
        if (!this.config)
            throw new Error('Repository configuration required');
        try {
            await git.pull({
                fs: node_fs_1.default,
                http: node_1.default,
                dir: this.dir,
                ref: 'main',
                singleBranch: true,
                fastForwardOnly: false,
                onAuth: () => ({ username: this.config.token, password: '' }),
                author: this.author,
            });
            // Check for conflicts after successful pull
            const conflicts = await this.getConflictFiles();
            if (conflicts.length > 0) {
                return {
                    success: false,
                    error: `マージコンフリクトが発生しました (${conflicts.length}個のファイル)`,
                    hasConflicts: true,
                    conflicts: conflicts,
                };
            }
            return { success: true };
        }
        catch (err) {
            console.error('Pull failed:', err);
            const error = err;
            // Check if this is a MergeConflictError or CheckoutConflictError from isomorphic-git
            if ((error.code === 'MergeConflictError' || error.code === 'CheckoutConflictError') &&
                error.data &&
                error.data.filepaths) {
                const conflicts = error.data.filepaths;
                console.log(`Detected ${error.code}:`, conflicts);
                // Store conflict files for later retrieval
                this.lastConflictFiles = conflicts;
                const errorMessage = error.code === 'CheckoutConflictError'
                    ? `ローカルの変更がリモートの変更と競合しています (${conflicts.length}個のファイル)`
                    : `マージコンフリクトが発生しました (${conflicts.length}個のファイル)`;
                return {
                    success: false,
                    error: errorMessage,
                    hasConflicts: true,
                    conflicts: conflicts,
                };
            }
            // Fallback: Check for conflicts using statusMatrix
            try {
                const conflicts = await this.getConflictFiles();
                if (conflicts.length > 0) {
                    return {
                        success: false,
                        error: `マージコンフリクトが発生しました (${conflicts.length}個のファイル)`,
                        hasConflicts: true,
                        conflicts: conflicts,
                    };
                }
            }
            catch (statusErr) {
                console.warn('Failed to check conflicts via statusMatrix:', statusErr);
            }
            return { success: false, error: error.message };
        }
    }
    async commitAndPush(message, onProgress) {
        if (!this.config)
            throw new Error('Repository configuration required');
        try {
            // fetch & merge latest changes first
            onProgress?.('リモートの変更を取得中...', 5);
            await git.pull({
                fs: node_fs_1.default,
                http: node_1.default,
                dir: this.dir,
                ref: 'main',
                singleBranch: true,
                fastForwardOnly: false,
                onAuth: () => ({ username: this.config.token, password: '' }),
                author: this.author,
            });
            // stage all changed files (add modified/new, remove deleted)
            const statusMatrix = (await git.statusMatrix({ fs: node_fs_1.default, dir: this.dir }));
            let hasChanges = false;
            for (const row of statusMatrix) {
                // row structure: [filepath, HEAD, workdir, stage]
                const [filepath /* headStatus */, , workdirStatus, stageStatus] = row;
                // If workdir differs from stage, we need to update the index
                if (workdirStatus !== stageStatus) {
                    if (workdirStatus === 0) {
                        // File no longer exists in workdir → stage deletion
                        await git.remove({ fs: node_fs_1.default, dir: this.dir, filepath });
                    }
                    else {
                        // File exists/modified → stage addition or modification
                        await git.add({ fs: node_fs_1.default, dir: this.dir, filepath });
                    }
                    hasChanges = true;
                }
            }
            // commit if changes exist
            if (hasChanges) {
                onProgress?.('コミットを作成中...', 40);
                const finalMsg = message.startsWith('[MorinolabCMS]')
                    ? message
                    : `[MorinolabCMS] ${message}`;
                await git.commit({ fs: node_fs_1.default, dir: this.dir, message: finalMsg, author: this.author });
            }
            else {
                onProgress?.('コミットする変更はありません', 40);
            }
            // push
            onProgress?.('プッシュを開始...', 60);
            await git.push({
                fs: node_fs_1.default,
                http: node_1.default,
                dir: this.dir,
                remote: 'origin',
                ref: 'main',
                onAuth: () => ({ username: this.config.token, password: '' }),
                onProgress: (p) => {
                    const percent = 60 + toPercent(p.loaded, p.total) * 0.4;
                    onProgress?.('プッシュ中...', percent);
                },
            });
            onProgress?.('アップロード完了', 100);
            return { success: true };
        }
        catch (err) {
            console.error('Commit & Push failed:', err);
            const error = err;
            onProgress?.('アップロードに失敗しました', 0);
            // Handle merge conflicts (from git.pull)
            if (error.name === 'MergeConflictError' || error.code === 'MergeConflictError') {
                console.log('MergeConflictError detected during commit and push');
                let conflictFiles = [];
                // Get conflict files from error data
                if (error.data && error.data.filepaths) {
                    conflictFiles = error.data.filepaths;
                    console.log('Conflict files from error:', conflictFiles);
                }
                // Store conflict files for later retrieval
                this.lastConflictFiles = conflictFiles;
                return {
                    success: false,
                    error: error.message,
                    hasConflicts: true,
                    conflicts: conflictFiles,
                };
            }
            // Handle checkout conflicts (when local changes conflict with incoming changes)
            if (error.name === 'CheckoutConflictError' || error.code === 'CheckoutConflictError') {
                console.log('CheckoutConflictError detected during commit and push');
                let conflictFiles = [];
                // Get conflict files from error data
                if (error.data && error.data.filepaths) {
                    conflictFiles = error.data.filepaths;
                    console.log('Checkout conflict files from error:', conflictFiles);
                }
                // Also check status matrix for conflict patterns
                try {
                    const matrix = (await git.statusMatrix({ fs: node_fs_1.default, dir: this.dir }));
                    for (const [filepath, head, workdir, stage] of matrix) {
                        // Pattern for CheckoutConflictError: HEAD=1, workdir=2, stage=3
                        if (head === 1 && workdir === 2 && stage === 3) {
                            if (!conflictFiles.includes(filepath)) {
                                conflictFiles.push(filepath);
                            }
                        }
                    }
                }
                catch (statusErr) {
                    console.warn('Failed to check conflicts via statusMatrix:', statusErr);
                }
                // Store conflict files for later retrieval
                this.lastConflictFiles = conflictFiles;
                return {
                    success: false,
                    error: error.message,
                    hasConflicts: true,
                    conflicts: conflictFiles,
                };
            }
            return { success: false, error: error.message };
        }
    }
    // ------------------------------------
    // Status / log / conflict helpers
    // ------------------------------------
    async getRepositoryStatus() {
        if (!this.config)
            return null;
        const matrix = (await git.statusMatrix({ fs: node_fs_1.default, dir: this.dir }));
        return {
            files: matrix.map(([filepath, head, workdir, stage]) => ({
                path: filepath,
                status: { head, workdir, stage },
            })),
        };
    }
    async getCommitLog(limit = 20) {
        if (!this.config)
            throw new Error('Repository configuration required');
        const commits = (await git.log({ fs: node_fs_1.default, dir: this.dir, depth: limit }));
        return commits.map((c) => ({
            hash: c.oid,
            message: c.commit.message,
            date: new Date(c.commit.committer.timestamp * 1000).toISOString(),
            author: c.commit.author.name,
        }));
    }
    // ------------------ Conflict helpers (basic) ------------------
    async getConflictFiles() {
        if (!this.config)
            return [];
        // If we have conflict files from the last MergeConflictError, check if they still have conflicts
        if (this.lastConflictFiles.length > 0) {
            console.log('Checking stored conflict files:', this.lastConflictFiles);
            const stillConflicted = [];
            for (const filepath of this.lastConflictFiles) {
                try {
                    const content = await this.getConflictContent(filepath);
                    if (content && (content.includes('<<<<<<<') || content.includes('>>>>>>>'))) {
                        stillConflicted.push(filepath);
                    }
                }
                catch (err) {
                    console.warn(`Failed to check conflict markers in ${filepath}:`, err);
                    // If we can't read the file, assume it's still conflicted
                    stillConflicted.push(filepath);
                }
            }
            // If no conflicts remain, clear the stored list
            if (stillConflicted.length === 0) {
                this.lastConflictFiles = [];
            }
            console.log('Still conflicted files:', stillConflicted);
            return stillConflicted;
        }
        // Fallback to status matrix method
        try {
            const matrix = (await git.statusMatrix({ fs: node_fs_1.default, dir: this.dir }));
            console.log('Status matrix for conflict detection:', matrix);
            // Check for various conflict patterns
            // In isomorphic-git status matrix: [filepath, HEAD, workdir, stage]
            const conflicts = [];
            for (const [filepath, head, workdir, stage] of matrix) {
                // Check for conflict patterns:
                // 1. Traditional merge conflicts with markers
                // 2. CheckoutConflictError pattern: [1, 2, 3] (HEAD exists, workdir modified, staged)
                if (head !== workdir || stage !== workdir || stage !== head) {
                    // Pattern for CheckoutConflictError: HEAD=1, workdir=2, stage=3
                    if (head === 1 && workdir === 2 && stage === 3) {
                        console.log(`Detected checkout conflict pattern in ${filepath}: [${head}, ${workdir}, ${stage}]`);
                        conflicts.push(filepath);
                        continue;
                    }
                    // Check for traditional conflict markers
                    try {
                        const content = await this.getConflictContent(filepath);
                        if (content && (content.includes('<<<<<<<') || content.includes('>>>>>>>'))) {
                            conflicts.push(filepath);
                        }
                    }
                    catch (err) {
                        console.warn(`Failed to check conflict markers in ${filepath}:`, err);
                    }
                }
            }
            console.log('Detected conflict files via status matrix:', conflicts);
            return conflicts;
        }
        catch (err) {
            console.error('Failed to get conflict files:', err);
            return [];
        }
    }
    async getConflictContent(filePath) {
        if (!this.config)
            return null;
        const fullPath = node_path_1.default.join(this.dir, filePath);
        return node_fs_1.default.existsSync(fullPath) ? node_fs_1.default.readFileSync(fullPath, 'utf8') : null;
    }
    async getConflictVersions(filePath) {
        if (!this.config)
            return { current: null, incoming: null, base: null };
        try {
            // First, try to fetch the latest from remote to ensure we have the remote refs
            try {
                await git.fetch({
                    fs: node_fs_1.default,
                    http: node_1.default,
                    dir: this.dir,
                    remote: 'origin',
                    ref: 'main',
                    onAuth: () => ({ username: this.config.token, password: '' }),
                });
                console.log('Successfully fetched latest remote changes');
            }
            catch (err) {
                console.warn('Could not fetch remote changes:', err);
            }
            // Get current version from working directory (local changes)
            let current = null;
            try {
                const fullPath = node_path_1.default.join(this.dir, filePath);
                if (node_fs_1.default.existsSync(fullPath)) {
                    current = node_fs_1.default.readFileSync(fullPath, 'utf8');
                }
            }
            catch (err) {
                console.warn(`Could not read working directory version of ${filePath}:`, err);
            }
            // Get HEAD version
            let headVersion = null;
            try {
                const headBlob = await git.readBlob({
                    fs: node_fs_1.default,
                    dir: this.dir,
                    oid: 'HEAD',
                    filepath: filePath,
                });
                headVersion = new TextDecoder().decode(headBlob.blob);
            }
            catch (err) {
                console.warn(`Could not read HEAD version of ${filePath}:`, err);
            }
            // Get incoming version (remote)
            let incoming = null;
            try {
                // Try multiple remote reference formats
                let remoteOid = null;
                // List available refs for debugging
                try {
                    const refs = await git.listBranches({ fs: node_fs_1.default, dir: this.dir, remote: 'origin' });
                    console.log('Available remote branches:', refs);
                }
                catch (err) {
                    console.warn('Could not list remote branches:', err);
                }
                // Try to get the remote reference
                const refFormats = ['refs/remotes/origin/main', 'origin/main', 'refs/heads/main', 'main'];
                for (const refFormat of refFormats) {
                    try {
                        remoteOid = await git.resolveRef({ fs: node_fs_1.default, dir: this.dir, ref: refFormat });
                        console.log(`Successfully resolved ${refFormat} to ${remoteOid}`);
                        break;
                    }
                    catch (err) {
                        console.log(`Failed to resolve ${refFormat}:`, err.message);
                    }
                }
                if (!remoteOid) {
                    console.warn('Could not resolve any remote main branch reference');
                }
                if (remoteOid) {
                    const incomingBlob = await git.readBlob({
                        fs: node_fs_1.default,
                        dir: this.dir,
                        oid: remoteOid,
                        filepath: filePath,
                    });
                    incoming = new TextDecoder().decode(incomingBlob.blob);
                    console.log(`Successfully read incoming version from ${remoteOid} for ${filePath}`);
                }
            }
            catch (err) {
                console.warn(`Could not read incoming version of ${filePath}:`, err);
            }
            // For CheckoutConflictError, current is the working directory version
            // For MergeConflictError, we might want to use HEAD version
            // We'll prioritize working directory changes as "current"
            return {
                current: current || headVersion,
                incoming,
                base: headVersion, // Use HEAD as base for comparison
            };
        }
        catch (err) {
            console.error(`Failed to get conflict versions for ${filePath}:`, err);
            return { current: null, incoming: null, base: null };
        }
    }
    async resolveConflict(filePath, resolvedContent) {
        if (!this.config)
            return false;
        try {
            const fullPath = node_path_1.default.join(this.dir, filePath);
            node_fs_1.default.writeFileSync(fullPath, resolvedContent, 'utf8');
            await git.add({ fs: node_fs_1.default, dir: this.dir, filepath: filePath });
            return true;
        }
        catch (err) {
            console.error('Failed to resolve conflict:', err);
            return false;
        }
    }
    async areAllConflictsResolved() {
        if (!this.config)
            return false;
        try {
            // Check if we have any stored conflict files that need resolution
            if (this.lastConflictFiles.length === 0) {
                console.log('No conflict files stored, considering resolved');
                return true;
            }
            // Check if all stored conflict files have been staged (resolved)
            const statusMatrix = (await git.statusMatrix({ fs: node_fs_1.default, dir: this.dir }));
            console.log('Checking resolution status for conflicts:', this.lastConflictFiles);
            for (const conflictFile of this.lastConflictFiles) {
                const fileStatus = statusMatrix.find(([filepath]) => filepath === conflictFile);
                if (!fileStatus) {
                    console.log(`Conflict file ${conflictFile} not found in status matrix`);
                    continue;
                }
                const [, head, workdir, stage] = fileStatus;
                console.log(`Status for ${conflictFile}: [${head}, ${workdir}, ${stage}]`);
                // If the file is not staged (stage === head) and workdir is modified, it's not resolved
                if (stage === head && workdir !== head) {
                    console.log(`Conflict file ${conflictFile} is not resolved (not staged)`);
                    return false;
                }
            }
            console.log('All conflict files appear to be resolved');
            return true;
        }
        catch (err) {
            console.error('Failed to check if conflicts are resolved:', err);
            return false;
        }
    }
    async completeMerge(message = 'Resolve merge conflicts') {
        if (!this.config)
            return false;
        if (!(await this.areAllConflictsResolved()))
            return false;
        try {
            // Create merge commit
            await git.commit({ fs: node_fs_1.default, dir: this.dir, message, author: this.author });
            // Before pushing, fetch latest changes to ensure we're up to date
            try {
                await git.fetch({
                    fs: node_fs_1.default,
                    http: node_1.default,
                    dir: this.dir,
                    remote: 'origin',
                    ref: 'main',
                    onAuth: () => ({ username: this.config.token, password: '' }),
                });
            }
            catch (fetchErr) {
                console.warn('Fetch failed during merge completion, continuing with push:', fetchErr);
            }
            // Try to push the merge commit
            try {
                await git.push({
                    fs: node_fs_1.default,
                    http: node_1.default,
                    dir: this.dir,
                    remote: 'origin',
                    ref: 'main',
                    onAuth: () => ({ username: this.config.token, password: '' }),
                });
            }
            catch (pushErr) {
                const pushError = pushErr;
                // If push fails due to non-fast-forward, try to pull and merge again
                if (pushError.code === 'GitPushError' &&
                    pushError.data?.prettyDetails?.includes('cannot lock ref')) {
                    console.log('Push failed due to remote changes, attempting to pull and retry...');
                    try {
                        // Pull latest changes
                        await git.pull({
                            fs: node_fs_1.default,
                            http: node_1.default,
                            dir: this.dir,
                            remote: 'origin',
                            ref: 'main',
                            author: this.author,
                            onAuth: () => ({ username: this.config.token, password: '' }),
                        });
                        // Retry push
                        await git.push({
                            fs: node_fs_1.default,
                            http: node_1.default,
                            dir: this.dir,
                            remote: 'origin',
                            ref: 'main',
                            onAuth: () => ({ username: this.config.token, password: '' }),
                        });
                    }
                    catch (retryErr) {
                        console.error('Failed to pull and retry push:', retryErr);
                        throw retryErr;
                    }
                }
                else {
                    throw pushError;
                }
            }
            // Clear stored conflict files since merge is complete
            this.lastConflictFiles = [];
            return true;
        }
        catch (err) {
            console.error('Failed to complete merge:', err);
            return false;
        }
    }
    // ------------------------------------
    // Lightweight Octokit wrappers
    // ------------------------------------
    async getRepositoryInfo() {
        if (!this.config || !this.octokit)
            return null;
        try {
            const { data } = await this.octokit.rest.repos.get({
                owner: this.config.owner,
                repo: this.config.repo,
            });
            return {
                name: data.name,
                full_name: data.full_name,
                description: data.description,
                private: data.private,
                clone_url: data.clone_url,
                html_url: data.html_url,
                default_branch: data.default_branch,
            };
        }
        catch (err) {
            console.error('Failed to get repo info:', err);
            return null;
        }
    }
    isAuthenticated() {
        return this.octokit !== null;
    }
    isConfigured() {
        return this.config !== null && node_fs_1.default.existsSync(node_path_1.default.join(this.dir, '.git'));
    }
    getConfig() {
        return this.config;
    }
    async getUserRepositories() {
        if (!this.octokit)
            throw new Error('GitHub authentication required');
        const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
            sort: 'updated',
            per_page: 100,
            affiliation: 'owner,collaborator',
        });
        return data.map((r) => ({
            id: r.id,
            name: r.name,
            full_name: r.full_name,
            description: r.description,
            private: r.private,
            clone_url: r.clone_url,
            html_url: r.html_url,
            default_branch: r.default_branch,
            permissions: r.permissions,
        }));
    }
    // ------------------------------------
    // OAuth helpers (copied from original implementation)
    // ------------------------------------
    async authenticateWithOAuthWindow(clientId, clientSecret, scope = 'repo,user') {
        try {
            const { access_token } = (await (0, electron_oauth_github_1.getAccessToken)({
                clientId,
                clientSecret,
                redirectUri: 'http://localhost',
                scope,
            }));
            if (!access_token) {
                return { success: false, error: 'アクセストークンを取得できませんでした' };
            }
            const ok = await this.authenticate(access_token);
            if (!ok)
                return { success: false, error: 'GitHub認証に失敗しました' };
            return { success: true, token: access_token };
        }
        catch (err) {
            console.error('OAuth authentication failed:', err);
            return { success: false, error: err.message };
        }
    }
    // ------------------------------------
    // Device Flow authentication (no client secret required)
    // ------------------------------------
    async authenticateWithDeviceFlow(clientId, scope = 'repo,user') {
        try {
            // 1. Get device code
            const deviceCodeRes = await fetch('https://github.com/login/device/code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Accept: 'application/json',
                },
                body: new URLSearchParams({ client_id: clientId, scope }).toString(),
            });
            const deviceData = (await deviceCodeRes.json());
            if (deviceData.error) {
                return { success: false, error: deviceData.error_description || deviceData.error };
            }
            const { device_code: deviceCode, user_code: userCode, verification_uri: verificationUri, verification_uri_complete: verificationUriComplete, expires_in: expiresIn, interval, } = deviceData;
            // Open browser for user authorization
            electron_1.shell.openExternal(verificationUriComplete || verificationUri);
            try {
                electron_1.clipboard.writeText(userCode);
            }
            catch {
                /* ignore */
            }
            await electron_1.dialog.showMessageBox({
                type: 'info',
                buttons: ['OK'],
                title: 'GitHub Device Flow',
                message: 'ブラウザに表示された入力欄に以下のコードを貼り付けてください。',
                detail: `認証コード: ${userCode}\n(コードはクリップボードへコピーされています)`,
                noLink: true,
            });
            // 2. Poll for access token
            const started = Date.now();
            let pollingMs = interval * 1000;
            while (Date.now() - started < expiresIn * 1000) {
                await new Promise((r) => setTimeout(r, pollingMs));
                const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Accept: 'application/json',
                    },
                    body: new URLSearchParams({
                        client_id: clientId,
                        device_code: deviceCode,
                        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
                    }).toString(),
                });
                const tokenData = (await tokenRes.json());
                if (tokenData.access_token) {
                    const ok = await this.authenticate(tokenData.access_token);
                    return ok
                        ? { success: true, token: tokenData.access_token }
                        : { success: false, error: 'GitHub認証に失敗しました' };
                }
                if (tokenData.error === 'authorization_pending')
                    continue;
                if (tokenData.error === 'slow_down') {
                    pollingMs += 5000;
                    continue;
                }
                if (tokenData.error) {
                    return { success: false, error: tokenData.error_description || tokenData.error };
                }
            }
            return { success: false, error: 'Device code expired or timeout' };
        }
        catch (err) {
            console.error('Device Flow authentication failed:', err);
            return { success: false, error: err.message };
        }
    }
}
exports.GitHubService = GitHubService;
