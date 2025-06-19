import { Octokit } from '@octokit/rest';
import simpleGit, { SimpleGit } from 'simple-git';
import { shell, clipboard, dialog } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

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

  /**
   * GitHub Device Flow 認証
   * Client Secret を必要とせず、デスクトップ/CLI アプリで安全に使用できる
   * 参考: https://docs.github.com/en/developers/apps/authorizing-oauth-apps#device-flow
   */
  async authenticateWithDeviceFlow(
    clientId: string,
    scope: string = 'repo,user',
  ): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      // 1. デバイスコードを取得
      const deviceCodeRes = await fetch('https://github.com/login/device/code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: new URLSearchParams({ client_id: clientId, scope }).toString(),
      });

      const deviceData = (await deviceCodeRes.json()) as {
        device_code: string;
        user_code: string;
        verification_uri: string;
        verification_uri_complete?: string;
        expires_in: number;
        interval: number;
        error?: string;
        error_description?: string;
      };

      if (deviceData.error) {
        return { success: false, error: deviceData.error_description || deviceData.error };
      }

      const {
        device_code: deviceCode,
        user_code: userCode,
        verification_uri: verificationUri,
        verification_uri_complete: verificationUriComplete,
        expires_in: expiresIn,
        interval,
      } = deviceData;

      // 2. ユーザーにブラウザで認証を促す
      const openUrl = verificationUriComplete || verificationUri;
      shell.openExternal(openUrl);

      // ユーザーコードをクリップボードにコピーし、ダイアログ表示
      try {
        clipboard.writeText(userCode);
      } catch {
        /* ignore */
      }
      await dialog.showMessageBox({
        type: 'info',
        buttons: ['OK'],
        title: 'GitHub Device Flow',
        message: 'ブラウザに表示された入力欄に以下のコードを貼り付けてください。',
        detail: `認証コード: ${userCode}\n(コードはクリップボードへコピーされています)`,
        noLink: true,
      });

      // 3. ポーリングでトークン取得を試みる
      const started = Date.now();
      let pollingIntervalMs = interval * 1000;
      while (Date.now() - started < expiresIn * 1000) {
        await new Promise((r) => setTimeout(r, pollingIntervalMs));

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

        const tokenData = (await tokenRes.json()) as {
          access_token?: string;
          token_type?: string;
          scope?: string;
          error?: string;
          error_description?: string;
          error_uri?: string;
        };

        if (tokenData.access_token) {
          console.log('GitHub Device Flow authentication successful');
          return { success: true, token: tokenData.access_token };
        }

        if (tokenData.error === 'authorization_pending') {
          // まだユーザーが認証していない → 継続
          continue;
        }
        if (tokenData.error === 'slow_down') {
          // ポーリング間隔を増やす
          pollingIntervalMs += 5000;
          continue;
        }
        if (tokenData.error) {
          return { success: false, error: tokenData.error_description || tokenData.error };
        }
      }

      return { success: false, error: 'Device code expired or timeout' };
    } catch (error) {
      console.error('GitHub Device Flow authentication failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }
}
