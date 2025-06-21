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
// @ts-ignore – isomorphic-git provides its own types but ESLint may not resolve before install
const git = __importStar(require("isomorphic-git"));
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
            onProgress?.('クローンを開始...', 1);
            await git.clone({
                fs: node_fs_1.default,
                http: node_1.default,
                dir: this.dir,
                url: repoUrl,
                singleBranch: true,
                onAuth: () => ({ username: this.config.token, password: '' }),
                onProgress: (p) => {
                    const percent = toPercent(p.loaded, p.total);
                    onProgress?.('クローン中...', percent);
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
            return { success: true };
        }
        catch (err) {
            console.error('Pull failed:', err);
            return { success: false, error: err.message };
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
            // stage all changed files
            const statusMatrix = await git.statusMatrix({ fs: node_fs_1.default, dir: this.dir });
            let hasChanges = false;
            for (const row of statusMatrix) {
                const [filepath, , worktreeStatus, stageStatus] = row;
                if (worktreeStatus !== stageStatus) {
                    await git.add({ fs: node_fs_1.default, dir: this.dir, filepath });
                    hasChanges = true;
                }
            }
            // commit if changes exist
            if (hasChanges) {
                onProgress?.('コミットを作成中...', 40);
                const finalMsg = message.startsWith('[MorinolabCMS]') ? message : `[MorinolabCMS] ${message}`;
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
            onProgress?.('アップロードに失敗しました', 0);
            return { success: false, error: err.message };
        }
    }
    // ------------------------------------
    // Status / log / conflict helpers
    // ------------------------------------
    async getRepositoryStatus() {
        if (!this.config)
            return null;
        const matrix = await git.statusMatrix({ fs: node_fs_1.default, dir: this.dir });
        return {
            files: matrix.map((row) => {
                const filepath = row[0];
                const head = row[1];
                const workdir = row[2];
                const stage = row[3];
                return { path: filepath, status: { head, workdir, stage } };
            }),
        };
    }
    async getCommitLog(limit = 20) {
        if (!this.config)
            throw new Error('Repository configuration required');
        const commits = await git.log({ fs: node_fs_1.default, dir: this.dir, depth: limit });
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
        const matrix = await git.statusMatrix({ fs: node_fs_1.default, dir: this.dir });
        return matrix
            .filter((row) => row[3] === 3)
            .map((row) => row[0]);
    }
    async getConflictContent(filePath) {
        if (!this.config)
            return null;
        const fullPath = node_path_1.default.join(this.dir, filePath);
        return node_fs_1.default.existsSync(fullPath) ? node_fs_1.default.readFileSync(fullPath, 'utf8') : null;
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
        const conflicts = await this.getConflictFiles();
        return conflicts.length === 0;
    }
    async completeMerge(message = 'Resolve merge conflicts') {
        if (!this.config)
            return false;
        if (!(await this.areAllConflictsResolved()))
            return false;
        try {
            await git.commit({ fs: node_fs_1.default, dir: this.dir, message, author: this.author });
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
