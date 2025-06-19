import { contextBridge, ipcRenderer } from 'electron';

// Define proper types for GitHub API responses
interface GitHubResponse {
  success: boolean;
  error: string | null;
}

interface GitHubStatusResponse extends GitHubResponse {
  data: {
    ahead: number;
    behind: number;
    current: string;
    tracking: string;
    files: Array<{
      path: string;
      index: string;
      working_dir: string;
    }>;
  } | null;
}

interface GitHubInfoResponse extends GitHubResponse {
  data: {
    owner: string;
    repo: string;
    localPath: string;
    isCloned: boolean;
    lastSync?: string;
  } | null;
}

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  clone_url: string;
  default_branch: string;
}

interface GitHubConfig {
  clientId?: string;
  clientSecret?: string;
  owner?: string;
  repo?: string;
  localPath?: string;
  token?: string;
}

contextBridge.exposeInMainWorld('api', {
  getContentTypes: (): Promise<string[]> => ipcRenderer.invoke('get-content-types'),
  getItems: (type: string): Promise<Array<{ id: string; title: string }>> =>
    ipcRenderer.invoke('get-items', type),
  createItem: (type: string): Promise<{ id: string; title: string }> =>
    ipcRenderer.invoke('create-item', type),
  deleteItem: (type: string, id: string): Promise<void> =>
    ipcRenderer.invoke('delete-item', type, id),
  loadContent: (type: string, id: string): Promise<string> =>
    ipcRenderer.invoke('load-content', type, id),
  saveContent: (type: string, id: string, content: string): void =>
    ipcRenderer.send('save-content', type, id, content),
  saveImage: (
    type: string,
    id: string,
    sourcePath: string,
    fileName: string,
  ): Promise<string | null> => ipcRenderer.invoke('save-image', type, id, sourcePath, fileName),
  getTableData: (type: string): Promise<{ header: string[]; rows: Record<string, string>[] }> =>
    ipcRenderer.invoke('get-table-data', type),
  updateCell: (type: string, id: string, column: string, value: string): Promise<void> =>
    ipcRenderer.invoke('update-cell', type, id, column, value),
  selectThumbnail: (type: string, id: string): Promise<string | null> =>
    ipcRenderer.invoke('select-thumbnail', type, id),
  resolvePath: (type: string, rel: string): Promise<string> =>
    ipcRenderer.invoke('resolve-path', type, rel),
  getFontURL: (): Promise<string | null> => ipcRenderer.invoke('get-font-url'),
  updateContentRoot: (): Promise<{ success: boolean; contentRoot?: string; error?: string }> =>
    ipcRenderer.invoke('update-content-root'),

  // GitHub API functions
  githubAuthenticate: (token: string): Promise<GitHubResponse> =>
    ipcRenderer.invoke('github-authenticate', token),
  githubSetRepository: (
    owner: string,
    repo: string,
    localPath: string,
    token: string,
  ): Promise<GitHubResponse> =>
    ipcRenderer.invoke('github-set-repository', owner, repo, localPath, token),
  githubCloneRepository: (): Promise<GitHubResponse> =>
    ipcRenderer.invoke('github-clone-repository'),
  githubCommitPush: (message: string): Promise<GitHubResponse> =>
    ipcRenderer.invoke('github-commit-push', message),
  githubGetStatus: (): Promise<GitHubStatusResponse> => ipcRenderer.invoke('github-get-status'),
  githubPullLatest: (): Promise<GitHubResponse> => ipcRenderer.invoke('github-pull-latest'),
  githubGetInfo: (): Promise<GitHubInfoResponse> => ipcRenderer.invoke('github-get-info'),
  githubIsAuthenticated: (): Promise<boolean> => ipcRenderer.invoke('github-is-authenticated'),
  githubIsConfigured: (): Promise<boolean> => ipcRenderer.invoke('github-is-configured'),
  githubGetConfig: (): Promise<GitHubConfig> => ipcRenderer.invoke('github-get-config'),

  // OAuth認証
  githubOAuthAuthenticate: (): Promise<{ success: boolean; token?: string; error?: string }> =>
    ipcRenderer.invoke('github-oauth-authenticate'),
  githubGetUserRepositories: (): Promise<{
    success: boolean;
    data: GitHubRepository[];
    error: string | null;
  }> => ipcRenderer.invoke('github-get-user-repositories'),
  githubCloneWithProgress: (): Promise<GitHubResponse> =>
    ipcRenderer.invoke('github-clone-with-progress'),

  // OAuth設定管理
  githubSaveOAuthConfig: (clientId: string, clientSecret: string): Promise<GitHubResponse> =>
    ipcRenderer.invoke('github-save-oauth-config', clientId, clientSecret),
  githubCheckConfigStatus: (): Promise<{
    success: boolean;
    configured: boolean;
    setupGuide?: string;
    error?: string;
  }> => ipcRenderer.invoke('github-check-config-status'),
  githubGetOAuthConfig: (): Promise<{
    success: boolean;
    data: { clientId: string; hasClientSecret: boolean } | null;
    error?: string;
  }> => ipcRenderer.invoke('github-get-oauth-config'),

  // GitHub設定の復元
  githubRestoreConfig: (configData: {
    owner: string;
    repo: string;
    localPath: string;
    token: string;
  }): Promise<GitHubResponse> => ipcRenderer.invoke('github-restore-config', configData),

  // プログレスイベントのリスナー
  onGitHubCloneProgress: (callback: (data: { message: string; percent: number }) => void) => {
    ipcRenderer.on('github-clone-progress', (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('github-clone-progress');
  },
});

declare global {
  interface Window {
    api: {
      getContentTypes(): Promise<string[]>;
      getItems(type: string): Promise<Array<{ id: string; title: string }>>;
      createItem(type: string): Promise<{ id: string; title: string }>;
      deleteItem(type: string, id: string): Promise<void>;
      loadContent(type: string, id: string): Promise<string>;
      saveContent(type: string, id: string, content: string): void;
      saveImage(
        type: string,
        id: string,
        sourcePath: string,
        fileName: string,
      ): Promise<string | null>;
      getTableData(type: string): Promise<{ header: string[]; rows: Record<string, string>[] }>;
      updateCell(type: string, id: string, column: string, value: string): Promise<void>;
      selectThumbnail(type: string, id: string): Promise<string | null>;
      resolvePath(type: string, rel: string): Promise<string>;
      getFontURL(): Promise<string | null>;
      updateContentRoot(): Promise<{ success: boolean; contentRoot?: string; error?: string }>;

      // GitHub API function types
      githubAuthenticate(token: string): Promise<GitHubResponse>;
      githubSetRepository(
        owner: string,
        repo: string,
        localPath: string,
        token: string,
      ): Promise<GitHubResponse>;
      githubCloneRepository(): Promise<GitHubResponse>;
      githubCommitPush(message: string): Promise<GitHubResponse>;
      githubGetStatus(): Promise<GitHubStatusResponse>;
      githubPullLatest(): Promise<GitHubResponse>;
      githubGetInfo(): Promise<GitHubInfoResponse>;
      githubIsAuthenticated(): Promise<boolean>;
      githubIsConfigured(): Promise<boolean>;
      githubGetConfig(): Promise<GitHubConfig>;

      // OAuth認証関数の型定義
      githubOAuthAuthenticate(): Promise<{ success: boolean; token?: string; error?: string }>;
      githubGetUserRepositories(): Promise<{
        success: boolean;
        data: GitHubRepository[];
        error: string | null;
      }>;
      githubCloneWithProgress(): Promise<GitHubResponse>;

      // OAuth設定管理の型定義
      githubSaveOAuthConfig(clientId: string, clientSecret: string): Promise<GitHubResponse>;
      githubCheckConfigStatus(): Promise<{
        success: boolean;
        configured: boolean;
        setupGuide?: string;
        error?: string;
      }>;
      githubGetOAuthConfig(): Promise<{
        success: boolean;
        data: { clientId: string; hasClientSecret: boolean } | null;
        error?: string;
      }>;

      onGitHubCloneProgress(
        callback: (data: { message: string; percent: number }) => void,
      ): () => void;
    };
  }
}
