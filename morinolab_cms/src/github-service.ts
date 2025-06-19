import { Octokit } from '@octokit/rest';
import simpleGit, { SimpleGit } from 'simple-git';
import { shell, BrowserWindow, app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import { AddressInfo } from 'node:net';

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  localPath: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  clone_url: string;
  html_url: string;
  default_branch: string;
  permissions?: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
}

/**
 * 利用可能なポートを見つける
 */
function findAvailablePort(startPort: number = 3000): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();

    server.listen(startPort, () => {
      const port = (server.address() as AddressInfo).port;
      server.close(() => {
        resolve(port);
      });
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        // ポートが使用中の場合、次のポートを試す
        findAvailablePort(startPort + 1)
          .then(resolve)
          .catch(reject);
      } else {
        reject(err);
      }
    });
  });
}

export class GitHubService {
  private octokit: Octokit | null = null;
  private git: SimpleGit | null = null;
  private config: GitHubConfig | null = null;

  constructor() {}

  /**
   * ブラウザベースOAuth認証
   */
  async authenticateWithOAuth(
    clientId: string,
    clientSecret: string,
  ): Promise<{ success: boolean; token?: string; error?: string }> {
    return new Promise((resolve) => {
      (async () => {
        try {
          // 利用可能なポートを動的に見つける
          const port = await findAvailablePort(3000);
          const redirectUri = `http://localhost:${port}/auth/callback`;
          const scope = 'repo,user';
          const state = Math.random().toString(36).substring(7);

          console.log(`Starting OAuth server on port ${port}`);

          // ローカルサーバーを起動してコールバックを受信
          const server = createServer((req, res) => {
            const url = new URL(req.url!, `http://localhost:${port}`);

            if (url.pathname === '/auth/callback') {
              const code = url.searchParams.get('code');
              const returnedState = url.searchParams.get('state');

              if (returnedState !== state) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end('<h1>認証エラー</h1><p>不正なリクエストです。</p>');
                server.close();
                resolve({ success: false, error: 'Invalid state parameter' });
                return;
              }

              if (code) {
                // アクセストークンを取得
                this.exchangeCodeForToken(code, clientId, clientSecret, redirectUri)
                  .then((token) => {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(
                      '<h1>認証完了</h1><p>アプリケーションに戻ってください。</p><script>window.close();</script>',
                    );
                    server.close();
                    resolve({ success: true, token });
                  })
                  .catch((error) => {
                    res.writeHead(400, { 'Content-Type': 'text/html' });
                    res.end('<h1>認証エラー</h1><p>トークンの取得に失敗しました。</p>');
                    server.close();
                    resolve({ success: false, error: error.message });
                  });
              } else {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end('<h1>認証エラー</h1><p>認証コードが取得できませんでした。</p>');
                server.close();
                resolve({ success: false, error: 'No authorization code received' });
              }
            }
          });

          // エラーハンドリングを追加
          server.on('error', (err) => {
            console.error('Server error:', err);
            server.close();
            resolve({ success: false, error: `Server error: ${err.message}` });
          });

          let authWin: BrowserWindow | null = null;

          server.listen(port, () => {
            console.log(`OAuth server listening on port ${port}`);
            const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;

            if (app.isPackaged) {
              // 本番ビルドではデフォルトブラウザで開く
              shell.openExternal(authUrl);
            } else {
              // 開発時は Electron ウィンドウで開き、自動では閉じない
              authWin = new BrowserWindow({
                width: 960,
                height: 900,
                webPreferences: { nodeIntegration: false },
              });
              authWin.loadURL(authUrl);
            }
          });

          // 認証完了時に、パッケージ版のみウィンドウを閉じる
          const closeAuthWindow = () => {
            if (authWin && app.isPackaged) {
              authWin.close();
              authWin = null;
            }
          };

          // タイムアウト設定
          setTimeout(() => {
            console.log('OAuth authentication timeout');
            server.close();
            closeAuthWindow();
            resolve({ success: false, error: 'Authentication timeout' });
          }, 300000); // 5分でタイムアウト
        } catch (error) {
          console.error('Failed to find available port:', error);
          resolve({
            success: false,
            error: `Failed to start OAuth server: ${(error as Error).message}`,
          });
        }
      })(); // immediately invoked async function to keep executor sync
    });
  }

  /**
   * 認証コードをアクセストークンに交換
   */
  private async exchangeCodeForToken(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string,
  ): Promise<string> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error_description || data.error);
    }

    return data.access_token;
  }

  /**
   * GitHub認証を設定
   */
  async authenticate(token: string): Promise<boolean> {
    try {
      this.octokit = new Octokit({ auth: token });

      // 認証テスト
      await this.octokit.rest.users.getAuthenticated();
      console.log('GitHub authentication successful');
      return true;
    } catch (error) {
      console.error('GitHub authentication failed:', error);
      this.octokit = null;
      return false;
    }
  }

  /**
   * リポジトリ設定
   */
  setRepositoryConfig(owner: string, repo: string, localPath: string, token: string) {
    if (!this.octokit) {
      throw new Error('GitHub authentication required');
    }

    this.config = {
      token: token,
      owner,
      repo,
      localPath,
    };

    this.git = simpleGit(localPath);
  }

  /**
   * リポジトリクローン
   */
  async cloneRepository(): Promise<boolean> {
    if (!this.config || !this.octokit) {
      throw new Error('Repository configuration required');
    }

    try {
      const repoUrl = `https://github.com/${this.config.owner}/${this.config.repo}.git`;

      // ローカルディレクトリが存在する場合は削除
      if (fs.existsSync(this.config.localPath)) {
        fs.rmSync(this.config.localPath, { recursive: true, force: true });
      }

      // 親ディレクトリを作成
      const parentDir = path.dirname(this.config.localPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }

      // クローン実行
      await simpleGit().clone(repoUrl, this.config.localPath);

      // Git設定
      this.git = simpleGit(this.config.localPath);

      console.log(`Repository cloned successfully to ${this.config.localPath}`);
      return true;
    } catch (error) {
      console.error('Clone failed:', error);
      return false;
    }
  }

  /**
   * 変更をコミット&プッシュ
   */
  async commitAndPush(
    message: string,
    onProgress?: (message: string, percent: number) => void,
  ): Promise<{
    success: boolean;
    hasConflicts?: boolean;
    conflicts?: string[];
    error?: string;
  }> {
    if (!this.git || !this.config) {
      throw new Error('Git configuration required');
    }

    try {
      // プッシュ用にトークン入り URL を常にセット
      const authRepoUrl = `https://${this.config.token}@github.com/${this.config.owner}/${this.config.repo}.git`;
      await this.git.remote(['set-url', 'origin', authRepoUrl]);

      onProgress?.('リモートの変更を取得中...', 5);
      await this.git.fetch('origin', 'main');

      onProgress?.('マージ中...', 15);
      try {
        await this.git.pull('origin', 'main', { '--no-rebase': null });
      } catch (pullError: unknown) {
        console.error('Pull during commit-push failed:', pullError);

        // コンフリクト判定
        const errMsg = pullError instanceof Error ? pullError.message : String(pullError);
        if (errMsg.includes('CONFLICT')) {
          const conflicts = await this.getConflictFiles();
          onProgress?.('マージコンフリクトが発生しました', 0);
          return { success: false, hasConflicts: true, conflicts, error: errMsg };
        }

        // pull 失敗だがコンフリクトでない
        onProgress?.('プルに失敗しました', 0);
        return { success: false, error: errMsg };
      }

      // ステータス確認して変更があればコミット
      const status = await this.git.status();

      if (status.files.length) {
        onProgress?.('変更をステージング...', 30);
        await this.git.add('.');

        onProgress?.('コミットを作成中...', 40);
        const finalMsg = message.startsWith('[MorinolabCMS]')
          ? message
          : `[MorinolabCMS] ${message}`;
        await this.git.commit(finalMsg);
      } else {
        onProgress?.('コミットする変更はありません', 40);
      }

      onProgress?.('プッシュを開始...', 60);

      // 型定義に progress メソッドが含まれていないため、progress を持つ型としてアサート
      const gitWithProgress = this.git as unknown as {
        progress: (cb: (evt: { method: string; stage: string; progress: number }) => void) => void;
      };

      if (typeof gitWithProgress.progress === 'function') {
        gitWithProgress.progress((evt) => {
          const { method, stage, progress } = evt;
          if (method === 'push') {
            const percent = 60 + progress / 2; // 60-100%
            onProgress?.(`プッシュ中 (${stage})`, Math.min(99, percent));
          }
        });
      } else {
        onProgress?.('プッシュ中...', 75);
      }

      await this.git.push('origin', 'main');

      onProgress?.('アップロード完了', 100);
      console.log('Changes committed and pushed successfully');
      return { success: true };
    } catch (error: unknown) {
      console.error('Commit and push failed:', error);
      const errMsg = error instanceof Error ? error.message : String(error);
      onProgress?.('アップロードに失敗しました', 0);
      return { success: false, error: errMsg };
    }
  }

  /**
   * リポジトリステータス取得
   */
  async getRepositoryStatus() {
    if (!this.git) {
      return null;
    }

    try {
      const status = await this.git.status();
      return {
        current: status.current,
        tracking: status.tracking,
        ahead: status.ahead,
        behind: status.behind,
        files: status.files.map((file) => ({
          path: file.path,
          index: file.index,
          working_dir: file.working_dir,
        })),
      };
    } catch (error) {
      console.error('Failed to get repository status:', error);
      return null;
    }
  }

  /**
   * 最新の変更をプル（マージコンフリクト対応）
   */
  async pullLatest(): Promise<{
    success: boolean;
    hasConflicts?: boolean;
    conflicts?: string[];
    error?: string;
  }> {
    if (!this.git) {
      throw new Error('Git configuration required');
    }

    try {
      // まず、リモートの変更をフェッチ
      await this.git.fetch('origin', 'main');

      // 現在のブランチの状況を確認
      const status = await this.git.status();

      // ローカルに変更がある場合は、まずコミット
      if (status.files.length > 0) {
        await this.git.add('.');
        await this.git.commit('Auto-commit before pull');
      }

      // プルを実行
      await this.git.pull('origin', 'main');
      console.log('Latest changes pulled successfully');
      return { success: true };
    } catch (error: unknown) {
      console.error('Pull failed:', error);

      // マージコンフリクトの検出
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('CONFLICTS')) {
        const conflicts = await this.getConflictFiles();
        return {
          success: false,
          hasConflicts: true,
          conflicts,
          error: 'マージコンフリクトが発生しました',
        };
      }

      return { success: false, error: errorMessage || 'プルに失敗しました' };
    }
  }

  /**
   * コンフリクトが発生しているファイルを取得
   */
  async getConflictFiles(): Promise<string[]> {
    if (!this.git) {
      return [];
    }

    try {
      const status = await this.git.status();
      return status.conflicted || [];
    } catch (error) {
      console.error('Failed to get conflict files:', error);
      return [];
    }
  }

  /**
   * コンフリクトファイルの内容を取得
   */
  async getConflictContent(filePath: string): Promise<string | null> {
    if (!this.config) {
      return null;
    }

    try {
      const fullPath = path.join(this.config.localPath, filePath);
      if (fs.existsSync(fullPath)) {
        return fs.readFileSync(fullPath, 'utf8');
      }
      return null;
    } catch (error) {
      console.error('Failed to read conflict file:', error);
      return null;
    }
  }

  /**
   * コンフリクトを解決（指定された内容で上書き）
   */
  async resolveConflict(filePath: string, resolvedContent: string): Promise<boolean> {
    if (!this.config || !this.git) {
      return false;
    }

    try {
      const fullPath = path.join(this.config.localPath, filePath);
      fs.writeFileSync(fullPath, resolvedContent, 'utf8');
      await this.git.add(filePath);
      console.log(`Conflict resolved for ${filePath}`);
      return true;
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      return false;
    }
  }

  /**
   * すべてのコンフリクトが解決されたかチェック
   */
  async areAllConflictsResolved(): Promise<boolean> {
    const conflicts = await this.getConflictFiles();
    return conflicts.length === 0;
  }

  /**
   * マージを完了
   */
  async completeMerge(message: string = 'Resolve merge conflicts'): Promise<boolean> {
    if (!this.git) {
      return false;
    }

    try {
      const allResolved = await this.areAllConflictsResolved();
      if (!allResolved) {
        throw new Error('すべてのコンフリクトを解決してください');
      }

      const finalMsg = message.startsWith('[MorinolabCMS]') ? message : `[MorinolabCMS] ${message}`;
      await this.git.commit(finalMsg);
      console.log('Merge completed successfully');
      return true;
    } catch (error) {
      console.error('Failed to complete merge:', error);
      return false;
    }
  }

  /**
   * 最新のコミットログを取得
   */
  async getCommitLog(
    limit: number = 20,
  ): Promise<{ hash: string; message: string; date: string; author: string }[]> {
    if (!this.git) throw new Error('Git not initialized');

    const log = await this.git.log(['-n', String(limit)]);
    return log.all.map((l) => ({
      hash: l.hash,
      message: l.message,
      date: l.date,
      author: l.author_name,
    }));
  }

  /**
   * リポジトリ情報取得
   */
  async getRepositoryInfo() {
    if (!this.config || !this.octokit) {
      return null;
    }

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
    } catch (error) {
      console.error('Failed to get repository info:', error);
      return null;
    }
  }

  /**
   * 認証状態確認
   */
  isAuthenticated(): boolean {
    return this.octokit !== null;
  }

  /**
   * 設定状態確認
   */
  isConfigured(): boolean {
    return this.config !== null && this.git !== null && fs.existsSync(this.config.localPath);
  }

  /**
   * 設定情報取得
   */
  getConfig(): GitHubConfig | null {
    return this.config;
  }

  /**
   * ユーザーのリポジトリ一覧を取得
   */
  async getUserRepositories(): Promise<GitHubRepository[]> {
    if (!this.octokit) {
      throw new Error('GitHub authentication required');
    }

    try {
      const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100,
        affiliation: 'owner,collaborator',
      });

      return data.map((repo) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        private: repo.private,
        clone_url: repo.clone_url,
        html_url: repo.html_url,
        default_branch: repo.default_branch,
        permissions: repo.permissions,
      }));
    } catch (error) {
      console.error('Failed to get repositories:', error);
      throw error;
    }
  }

  /**
   * プログレス付きクローン
   */
  async cloneRepositoryWithProgress(
    onProgress?: (message: string, percent: number) => void,
  ): Promise<boolean> {
    if (!this.config || !this.octokit) {
      throw new Error('Repository configuration required');
    }

    try {
      const repoUrl = `https://github.com/${this.config.owner}/${this.config.repo}.git`;

      onProgress?.('クローン準備中...', 10);

      // ローカルディレクトリが存在する場合は削除
      if (fs.existsSync(this.config.localPath)) {
        onProgress?.('既存ディレクトリを削除中...', 20);
        fs.rmSync(this.config.localPath, { recursive: true, force: true });
      }

      // 親ディレクトリを作成
      const parentDir = path.dirname(this.config.localPath);
      if (!fs.existsSync(parentDir)) {
        onProgress?.('ディレクトリを作成中...', 30);
        fs.mkdirSync(parentDir, { recursive: true });
      }

      onProgress?.('リポジトリをクローン中...', 50);

      // クローン実行
      await simpleGit().clone(repoUrl, this.config.localPath);

      onProgress?.('Git設定を更新中...', 80);

      // Git設定
      this.git = simpleGit(this.config.localPath);

      onProgress?.('クローン完了', 100);

      console.log(`Repository cloned successfully to ${this.config.localPath}`);
      return true;
    } catch (error) {
      console.error('Clone failed:', error);
      onProgress?.('クローンに失敗しました', 0);
      return false;
    }
  }
}
