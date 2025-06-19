import { Octokit } from '@octokit/rest';
import simpleGit, { SimpleGit } from 'simple-git';
import { shell } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';

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
      const redirectUri = 'http://localhost:3000/auth/callback';
      const scope = 'repo,user';
      const state = Math.random().toString(36).substring(7);

      // ローカルサーバーを起動してコールバックを受信
      const server = createServer((req, res) => {
        const url = new URL(req.url!, 'http://localhost:3000');

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

      server.listen(3000, () => {
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
        shell.openExternal(authUrl);
      });

      // タイムアウト設定
      setTimeout(() => {
        server.close();
        resolve({ success: false, error: 'Authentication timeout' });
      }, 300000); // 5分でタイムアウト
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
  async commitAndPush(message: string): Promise<boolean> {
    if (!this.git || !this.config) {
      throw new Error('Git configuration required');
    }

    try {
      // ステータス確認
      const status = await this.git.status();

      if (!status.files.length) {
        console.log('No changes to commit');
        return true;
      }

      // 全ての変更をステージング
      await this.git.add('.');

      // コミット
      await this.git.commit(message);

      // プッシュ
      await this.git.push('origin', 'main');

      console.log('Changes committed and pushed successfully');
      return true;
    } catch (error) {
      console.error('Commit and push failed:', error);
      return false;
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
   * 最新の変更をプル
   */
  async pullLatest(): Promise<boolean> {
    if (!this.git) {
      throw new Error('Git configuration required');
    }

    try {
      await this.git.pull('origin', 'main');
      console.log('Latest changes pulled successfully');
      return true;
    } catch (error) {
      console.error('Pull failed:', error);
      return false;
    }
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
    return this.config !== null && this.git !== null;
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
