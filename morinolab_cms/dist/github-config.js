"use strict";
// GitHub OAuth設定（セキュア版）
// 暗号化された設定ファイルまたは環境変数から認証情報を取得
Object.defineProperty(exports, "__esModule", { value: true });
exports.showGitHubSetupGuide = exports.getDefaultGitHubConfig = exports.isGitHubConfigured = exports.validateGitHubConfig = exports.saveGitHubOAuthConfig = exports.getGitHubOAuthConfig = void 0;
const config_manager_1 = require("./config-manager");
// セキュアな設定管理のインスタンス
const secureConfig = new config_manager_1.SecureGitHubConfig();
/**
 * セキュアなGitHub OAuth設定の取得
 * 優先順位:
 * 1. 暗号化された設定ファイル
 * 2. 環境変数
 * 3. フォールバック（開発用のデフォルト値）
 */
const getGitHubOAuthConfig = async () => {
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
    }
    catch (error) {
        console.error('Failed to get GitHub OAuth config:', error);
        return null;
    }
};
exports.getGitHubOAuthConfig = getGitHubOAuthConfig;
/**
 * GitHub OAuth設定を保存（セキュア）
 */
const saveGitHubOAuthConfig = async (clientId, clientSecret) => {
    await secureConfig.saveGitHubOAuthConfig(clientId, clientSecret);
};
exports.saveGitHubOAuthConfig = saveGitHubOAuthConfig;
/**
 * 設定の検証
 */
const validateGitHubConfig = (config) => {
    return secureConfig.validateConfig(config);
};
exports.validateGitHubConfig = validateGitHubConfig;
/**
 * 設定が利用可能かチェック
 */
const isGitHubConfigured = async () => {
    return await secureConfig.isConfigured();
};
exports.isGitHubConfigured = isGitHubConfigured;
/**
 * 初回セットアップ用のデフォルト設定
 * 本番環境では必ずsaveGitHubOAuthConfigで実際の認証情報を設定してください
 */
const getDefaultGitHubConfig = () => {
    return {
        clientId: 'Ov23ctlbBnAjnisOSCrm',
        clientSecret: '', // 空文字列：実際の値は手動設定が必要
    };
};
exports.getDefaultGitHubConfig = getDefaultGitHubConfig;
/**
 * GitHub設定のセットアップガイド表示
 */
const showGitHubSetupGuide = () => {
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
exports.showGitHubSetupGuide = showGitHubSetupGuide;
