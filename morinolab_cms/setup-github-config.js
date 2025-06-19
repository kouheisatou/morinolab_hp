#!/usr/bin/env node

/**
 * GitHub OAuth設定スクリプト
 * 
 * ビルド前にGitHub Client IDとClient Secretを設定するためのスクリプト
 * セキュリティのため、認証情報は暗号化されて保存される
 * 
 * 使用方法:
 * node setup-github-config.js <CLIENT_ID> <CLIENT_SECRET>
 * 
 * または環境変数で:
 * GITHUB_CLIENT_ID=xxx GITHUB_CLIENT_SECRET=yyy node setup-github-config.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 暗号化された設定を生成する関数
function generateEncryptedConfig(clientId, clientSecret) {
  const config = {
    github: {
      clientId,
      clientSecret
    }
  };

  // ビルド時用の固定キー（本番環境ではより安全な方法を推奨）
  const key = crypto.scryptSync('morinolab-cms-build-key', 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(JSON.stringify(config), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    data: encrypted,
    timestamp: Date.now(),
    version: '1.0'
  };
}

// 設定ファイルを作成
function createConfigFile(clientId, clientSecret) {
  try {
    const encryptedConfig = generateEncryptedConfig(clientId, clientSecret);
    
    // 設定をビルド用ディレクトリに保存
    const configDir = path.join(__dirname, 'config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    const configPath = path.join(configDir, 'github-oauth.enc');
    fs.writeFileSync(configPath, JSON.stringify(encryptedConfig, null, 2));
    
    console.log('✅ GitHub OAuth設定が暗号化されて保存されました');
    console.log(`📁 設定ファイル: ${configPath}`);
    console.log('🔒 Client Secretは暗号化されています');
    
    // 設定の検証
    validateConfig(clientId, clientSecret);
    
  } catch (error) {
    console.error('❌ 設定ファイルの作成に失敗しました:', error.message);
    process.exit(1);
  }
}

// 設定の検証
function validateConfig(clientId, clientSecret) {
  const validations = [
    { 
      check: clientId && clientId.length > 10, 
      message: 'Client IDが無効です（10文字以上必要）' 
    },
    { 
      check: clientSecret && clientSecret.length > 10, 
      message: 'Client Secretが無効です（10文字以上必要）' 
    },
    { 
      check: !clientId.includes('YOUR_'), 
      message: 'Client IDにプレースホルダーが含まれています' 
    },
    { 
      check: !clientSecret.includes('YOUR_'), 
      message: 'Client Secretにプレースホルダーが含まれています' 
    }
  ];

  for (const validation of validations) {
    if (!validation.check) {
      console.error(`❌ ${validation.message}`);
      process.exit(1);
    }
  }
  
  console.log('✅ 設定の検証が完了しました');
}

// セットアップガイドの表示
function showSetupGuide() {
  console.log(`
🚀 GitHub OAuth アプリケーションの設定

このスクリプトを実行する前に、GitHubでOAuthアプリケーションを作成してください:

1. GitHub Settings > Developer settings > OAuth Apps
2. "New OAuth App" をクリック
3. 以下の情報を入力:
   - Application name: Morinolab CMS
   - Homepage URL: https://github.com/your-org/morinolab_hp
   - Authorization callback URL: http://localhost:3000/auth/callback

4. 作成後、Client IDとClient Secretをコピー

5. このスクリプトを実行:
   npm run setup-github <CLIENT_ID> <CLIENT_SECRET>

⚠️  セキュリティ上の注意:
- Client Secretは機密情報です
- このスクリプトでは認証情報を暗号化して保存します
- コマンド履歴に残る可能性があるため、実行後は履歴をクリアしてください
`);
}

// メイン処理
function main() {
  const args = process.argv.slice(2);
  
  // 引数またはヘルプの確認
  if (args.includes('--help') || args.includes('-h')) {
    showSetupGuide();
    return;
  }
  
  // コマンドライン引数から取得（直接指定のみ）
  if (args.length < 2) {
    console.error('❌ Client IDとClient Secretが必要です\n');
    showSetupGuide();
    process.exit(1);
  }
  
  const clientId = args[0];
  const clientSecret = args[1];
  
  console.log('🔧 GitHub OAuth設定を開始します...');
  console.log(`📋 Client ID: ${clientId.substring(0, 8)}...`);
  console.log(`🔑 Client Secret: ${'*'.repeat(clientSecret.length)}`);
  
  createConfigFile(clientId, clientSecret);
}

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
  main();
}

module.exports = {
  generateEncryptedConfig,
  createConfigFile,
  validateConfig
}; 