import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

interface EncryptedConfig {
  github: {
    clientId: string;
    clientSecret: string;
  };
}

export class ConfigManager {
  private readonly configPath: string;
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyDerivation = 'pbkdf2';

  constructor() {
    // アプリケーション固有のディレクトリに設定を保存
    const userDataPath = app.getPath('userData');
    this.configPath = path.join(userDataPath, 'app-config.enc');
  }

  /**
   * アプリケーション固有の暗号化キーを生成
   * 注意: 本番環境では、より安全なキー管理システムを使用することを推奨
   */
  private generateEncryptionKey(): Buffer {
    // アプリケーション固有の情報からキーを生成
    const appInfo = [
      app.getName(),
      app.getVersion(),
      process.platform,
      process.arch,
      // アプリケーション固有の固定文字列（変更しないこと）
      'morinolab-cms-secret-key-v1',
    ].join('|');

    // PBKDF2を使用してキーを導出
    return crypto.pbkdf2Sync(appInfo, 'salt-morinolab-cms', 100000, 32, 'sha256');
  }

  /**
   * 設定を暗号化して保存
   */
  async saveConfig(config: EncryptedConfig): Promise<void> {
    try {
      const key = this.generateEncryptionKey();
      const iv = crypto.randomBytes(16);

      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      let encrypted = cipher.update(JSON.stringify(config), 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      const encryptedData = {
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        data: encrypted,
      };

      await fs.promises.writeFile(this.configPath, JSON.stringify(encryptedData), 'utf8');
      console.log('Config saved securely');
    } catch (error) {
      console.error('Failed to save config:', error);
      throw error;
    }
  }

  /**
   * 設定を復号化して読み込み
   */
  async loadConfig(): Promise<EncryptedConfig | null> {
    try {
      if (!fs.existsSync(this.configPath)) {
        return null;
      }

      const encryptedDataStr = await fs.promises.readFile(this.configPath, 'utf8');
      const encryptedData = JSON.parse(encryptedDataStr);

      const key = this.generateEncryptionKey();
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);

      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

      let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to load config:', error);
      return null;
    }
  }

  /**
   * 設定の存在確認
   */
  configExists(): boolean {
    return fs.existsSync(this.configPath);
  }

  /**
   * 設定を削除
   */
  async deleteConfig(): Promise<void> {
    try {
      if (fs.existsSync(this.configPath)) {
        await fs.promises.unlink(this.configPath);
        console.log('Config deleted');
      }
    } catch (error) {
      console.error('Failed to delete config:', error);
      throw error;
    }
  }
}

// 設定の初期化とフォールバック処理
export class SecureGitHubConfig {
  private configManager: ConfigManager;

  constructor() {
    this.configManager = new ConfigManager();
  }

  /**
   * GitHubのOAuth設定を取得（セキュアな方法）
   */
  async getGitHubOAuthConfig(): Promise<{ clientId: string; clientSecret: string } | null> {
    try {
      // 1. 暗号化された設定ファイルから取得を試行
      const config = await this.configManager.loadConfig();
      if (config && config.github) {
        return config.github;
      }

      // 2. ビルド時設定ファイルから取得を試行
      const buildConfig = await this.loadBuildTimeConfig();
      if (buildConfig && buildConfig.github) {
        // ビルド時設定が見つかった場合は、ユーザー設定として保存
        await this.configManager.saveConfig(buildConfig);
        return buildConfig.github;
      }

      // 3. 環境変数から取得を試行
      const clientId = process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;

      if (clientId && clientSecret) {
        // 環境変数が利用可能な場合は、暗号化して保存
        const configToSave: EncryptedConfig = {
          github: { clientId, clientSecret },
        };
        await this.configManager.saveConfig(configToSave);
        return { clientId, clientSecret };
      }

      return null;
    } catch (error) {
      console.error('Failed to get GitHub OAuth config:', error);
      return null;
    }
  }

  /**
   * ビルド時に作成された暗号化設定を読み込み
   */
  private async loadBuildTimeConfig(): Promise<EncryptedConfig | null> {
    try {
      // アプリのパッケージ内の設定ファイルをチェック
      const configPath = path.join(__dirname, '..', 'config', 'github-oauth.enc');

      if (!fs.existsSync(configPath)) {
        return null;
      }

      const encryptedDataStr = await fs.promises.readFile(configPath, 'utf8');
      const encryptedData = JSON.parse(encryptedDataStr);

      // ビルド時用の復号化
      const key = crypto.scryptSync('morinolab-cms-build-key', 'salt', 32);
      const iv = Buffer.from(encryptedData.iv, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);

      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

      let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      const config = JSON.parse(decrypted);
      console.log('Build-time GitHub config loaded successfully');

      return config;
    } catch (error) {
      console.warn(
        'No build-time config found or failed to load:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      return null;
    }
  }

  /**
   * GitHub OAuth設定を保存
   */
  async saveGitHubOAuthConfig(clientId: string, clientSecret: string): Promise<void> {
    const config: EncryptedConfig = {
      github: { clientId, clientSecret },
    };
    await this.configManager.saveConfig(config);
  }

  /**
   * 設定の検証
   */
  validateConfig(config: { clientId: string; clientSecret: string }): boolean {
    return Boolean(
      config.clientId &&
        config.clientId !== 'YOUR_GITHUB_CLIENT_ID' &&
        config.clientSecret &&
        config.clientSecret !== 'YOUR_GITHUB_CLIENT_SECRET' &&
        config.clientId.length > 10 &&
        config.clientSecret.length > 10,
    );
  }

  /**
   * 設定が利用可能かチェック
   */
  async isConfigured(): Promise<boolean> {
    const config = await this.getGitHubOAuthConfig();
    return config !== null && this.validateConfig(config);
  }
}
