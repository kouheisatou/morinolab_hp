// GitHub OAuth設定（セキュア版）
// 暗号化された設定ファイルまたは環境変数から認証情報を取得

import { SecureGitHubConfig } from './config-manager';
import { GitHubOAuthConfig } from '@/types/common';

// セキュアな設定管理のインスタンス
const secureConfig = new SecureGitHubConfig();

/**
 * セキュアなGitHub OAuth設定の取得
 * 優先順位:
 * 1. 暗号化された設定ファイル
 * 2. 環境変数
 * 3. フォールバック（開発用のデフォルト値）
 */
export const getGitHubOAuthConfig = async (): Promise<GitHubOAuthConfig | null> => {
  try {
    // セキュアな設定から取得
    const config = await secureConfig.getGitHubOAuthConfig();
    if (config) {
      return config;
    }

    // フォールバック: 開発用デフォルト値（実際のClient Secretは設定されていない）
    console.warn('No secure GitHub config found. Using development fallback.');

    return {
      clientId: 'Ov23ctlbBnAjnisOSCrm', // 開発用Client ID
      clientSecret: '', // 実際のSecretは設定されていない
    };
  } catch (error) {
    console.error('Failed to get GitHub OAuth config:', error);
    return null;
  }
};

/**
 * GitHub OAuth設定を保存（セキュア）
 */
export const saveGitHubOAuthConfig = async (
  clientId: string,
  clientSecret: string,
): Promise<void> => {
  await secureConfig.saveGitHubOAuthConfig(clientId, clientSecret);
};

/**
 * 設定の検証
 */
export const validateGitHubConfig = (config: GitHubOAuthConfig): boolean => {
  return secureConfig.validateConfig(config);
};

/**
 * 設定が利用可能かチェック
 */
export const isGitHubConfigured = async (): Promise<boolean> => {
  return await secureConfig.isConfigured();
};

/**
 * 初回セットアップ用のデフォルト設定
 * 本番環境では必ずsaveGitHubOAuthConfigで実際の認証情報を設定してください
 */
export const getDefaultGitHubConfig = (): GitHubOAuthConfig => {
  return {
    clientId: 'Ov23ctlbBnAjnisOSCrm',
    clientSecret: '', // 空文字列：実際の値は手動設定が必要
  };
};

/**
 * GitHub設定のセットアップガイド表示
 */
export const showGitHubSetupGuide = (): string => {
  return `
GitHub OAuth アプリケーションの設定が必要です:

1. GitHub Settings > Developer settings > OAuth Apps
2. "New OAuth App" をクリック
3. 以下の情報を入力:
   - Application name: Morinolab CMS
   - Homepage URL: https://github.com/your-org/morinolab_hp
   - Authorization callback URL: http://localhost:3000/auth/callback
4. 取得したClient IDとClient Secretをアプリで設定

セキュリティ上の理由により、Client Secretは暗号化されて保存されます。
  `;
};
