"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('api', {
    getContentTypes: () => electron_1.ipcRenderer.invoke('get-content-types'),
    getItems: (type) => electron_1.ipcRenderer.invoke('get-items', type),
    createItem: (type) => electron_1.ipcRenderer.invoke('create-item', type),
    deleteItem: (type, id) => electron_1.ipcRenderer.invoke('delete-item', type, id),
    loadContent: (type, id) => electron_1.ipcRenderer.invoke('load-content', type, id),
    saveContent: (type, id, content) => electron_1.ipcRenderer.send('save-content', type, id, content),
    saveImage: (type, id, sourcePath, fileName) => electron_1.ipcRenderer.invoke('save-image', type, id, sourcePath, fileName),
    getTableData: (type) => electron_1.ipcRenderer.invoke('get-table-data', type),
    updateCell: (type, id, column, value) => electron_1.ipcRenderer.invoke('update-cell', type, id, column, value),
    selectThumbnail: (type, id) => electron_1.ipcRenderer.invoke('select-thumbnail', type, id),
    resolvePath: (type, rel) => electron_1.ipcRenderer.invoke('resolve-path', type, rel),
    getFontURL: () => electron_1.ipcRenderer.invoke('get-font-url'),
    updateContentRoot: () => electron_1.ipcRenderer.invoke('update-content-root'),
    // GitHub API functions
    githubAuthenticate: (token) => electron_1.ipcRenderer.invoke('github-authenticate', token),
    githubSetRepository: (owner, repo, localPath, token) => electron_1.ipcRenderer.invoke('github-set-repository', owner, repo, localPath, token),
    githubCloneRepository: () => electron_1.ipcRenderer.invoke('github-clone-repository'),
    githubCommitPush: (message) => electron_1.ipcRenderer.invoke('github-commit-push', message),
    githubGetStatus: () => electron_1.ipcRenderer.invoke('github-get-status'),
    githubPullLatest: () => electron_1.ipcRenderer.invoke('github-pull-latest'),
    githubGetInfo: () => electron_1.ipcRenderer.invoke('github-get-info'),
    githubIsAuthenticated: () => electron_1.ipcRenderer.invoke('github-is-authenticated'),
    githubIsConfigured: () => electron_1.ipcRenderer.invoke('github-is-configured'),
    githubGetConfig: () => electron_1.ipcRenderer.invoke('github-get-config'),
    // OAuth認証
    githubOAuthAuthenticate: () => electron_1.ipcRenderer.invoke('github-oauth-authenticate'),
    githubGetUserRepositories: () => electron_1.ipcRenderer.invoke('github-get-user-repositories'),
    githubCloneWithProgress: () => electron_1.ipcRenderer.invoke('github-clone-with-progress'),
    // OAuth設定管理
    githubSaveOAuthConfig: (clientId, clientSecret) => electron_1.ipcRenderer.invoke('github-save-oauth-config', clientId, clientSecret),
    githubCheckConfigStatus: () => electron_1.ipcRenderer.invoke('github-check-config-status'),
    githubGetOAuthConfig: () => electron_1.ipcRenderer.invoke('github-get-oauth-config'),
    // GitHub設定の復元
    githubRestoreConfig: (configData) => electron_1.ipcRenderer.invoke('github-restore-config', configData),
    // プログレスイベントのリスナー
    onGitHubCloneProgress: (callback) => {
        electron_1.ipcRenderer.on('github-clone-progress', (_, data) => callback(data));
        return () => electron_1.ipcRenderer.removeAllListeners('github-clone-progress');
    },
});
