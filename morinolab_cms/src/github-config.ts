// GitHub OAuth設定
// セキュリティのため、この情報はメインプロセスでのみ使用される

export interface GitHubOAuthConfig {
  clientId: string;
  clientSecret: string;
}

// 本番環境では環境変数から取得することを推奨
export const getGitHubOAuthConfig = (): GitHubOAuthConfig => {
  // 環境変数から取得を試行
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (clientId && clientSecret) {
    return {
      clientId,
      clientSecret,
    };
  }

  // フォールバック: 開発用ハードコード
  // 本番環境では必ず環境変数を使用してください
  //
  // GitHub OAuth App設定手順:
  // 1. https://github.com/settings/developers にアクセス
  // 2. "OAuth Apps" → "New OAuth App"
  // 3. Authorization callback URL: http://localhost:3000/auth/callback
  // 4. 取得したClient IDとClient Secretを下記に設定
  return {
    clientId: 'Ov23ctlbBnAjnisOSCrm', // ここに実際のClient IDを設定
    clientSecret: 'YOUR_GITHUB_CLIENT_SECRET', // ここに実際のClient Secretを設定
  };
};

// 設定の検証
export const validateGitHubConfig = (config: GitHubOAuthConfig): boolean => {
  return Boolean(
    config.clientId &&
      config.clientId !== 'YOUR_GITHUB_CLIENT_ID' &&
      config.clientSecret &&
      config.clientSecret !== 'YOUR_GITHUB_CLIENT_SECRET' &&
      config.clientId.length > 10 &&
      config.clientSecret.length > 10,
  );
};
