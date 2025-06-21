"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showGitHubSetupGuide = exports.isGitHubConfigured = exports.saveGitHubOAuthConfig = exports.validateGitHubConfig = exports.getGitHubOAuthConfig = void 0;
Promise.resolve().then(() => __importStar(require('dotenv'))).then((dotenv) => dotenv.config());
const electron_1 = require("electron");
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_url_1 = require("node:url");
// legacy imports removed (gray-matter, papaparse)
const github_service_1 = require("./github-service");
const GitRepository_1 = require("./infrastructure/GitRepository");
const CloneRepository_1 = require("./application/usecases/CloneRepository");
const PullLatest_1 = require("./application/usecases/PullLatest");
const CommitAndPush_1 = require("./application/usecases/CommitAndPush");
const ContentRepository_1 = require("./infrastructure/local/ContentRepository");
const DEFAULT_CLIENT_ID = 'Ov23ctlbBnAjnisOSCrm';
const getGitHubOAuthConfig = async () => ({
    clientId: DEFAULT_CLIENT_ID,
});
exports.getGitHubOAuthConfig = getGitHubOAuthConfig;
const validateGitHubConfig = (config) => Boolean(config.clientId && config.clientId.trim().length > 0);
exports.validateGitHubConfig = validateGitHubConfig;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const saveGitHubOAuthConfig = async (_clientId, _clientSecret) => {
    // mark params as intentionally unused to satisfy eslint
    void _clientId;
    void _clientSecret;
    /* no-op – Device Flow only requires a public clientId */
};
exports.saveGitHubOAuthConfig = saveGitHubOAuthConfig;
const isGitHubConfigured = async () => true;
exports.isGitHubConfigured = isGitHubConfigured;
const showGitHubSetupGuide = () => `Morinolab CMS は GitHub Device Flow を使用して認証します。\n\n1. "GitHub でログイン" ボタンを押すとブラウザが開きます。\n2. 表示されたページの指示に従って認証コードを入力してください。\n3. 認証が完了すると、本アプリが自動的にログインを検知します。`;
exports.showGitHubSetupGuide = showGitHubSetupGuide;
// Image processing using renderer process
async function processImage(inputPath, outputPath, maxWidth = 1600, quality = 0.8) {
    try {
        const stats = node_fs_1.default.statSync(inputPath);
        // Check if file size is reasonable (less than 50MB for original)
        if (stats.size > 50 * 1024 * 1024) {
            console.warn('File too large, copying without processing:', inputPath);
            node_fs_1.default.copyFileSync(inputPath, outputPath);
            return;
        }
        // Use the main window to process the image in renderer context
        const mainWindow = electron_1.BrowserWindow.getAllWindows()[0];
        if (!mainWindow) {
            throw new Error('No window available for image processing');
        }
        // Send image processing request to renderer
        const result = await mainWindow.webContents.executeJavaScript(`
      (async () => {
        try {
          // Create image element
          const img = new Image();
          
          // Convert file path to data URL
          const response = await fetch('file://${inputPath.replace(/\\/g, '/')}');
          const blob = await response.blob();
          const imageUrl = URL.createObjectURL(blob);
          
          return new Promise((resolve, reject) => {
            img.onload = async () => {
              try {
                // Calculate new dimensions
                let newWidth = img.width;
                let newHeight = img.height;
                
                if (img.width > ${maxWidth}) {
                  newWidth = ${maxWidth};
                  newHeight = (img.height * ${maxWidth}) / img.width;
                }
                
                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.width = newWidth;
                canvas.height = newHeight;
                const ctx = canvas.getContext('2d');
                
                // Draw resized image
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
                
                // Convert to blob with compression
                const quality = ${quality};
                const ext = '${node_path_1.default.extname(outputPath).toLowerCase()}';
                
                // Force JPEG format for better compression unless original is PNG and small
                let mimeType = 'image/jpeg';
                let compressionQuality = quality;
                
                // Only keep PNG if it's likely to be smaller (icons, etc.) or transparency is needed
                if (ext === '.png') {
                  // Convert PNG to JPEG for better compression unless image is small
                  if (newWidth < 400 && newHeight < 400) {
                    mimeType = 'image/png';
                    compressionQuality = undefined; // PNG doesn't use quality param
                  }
                }
                
                canvas.toBlob((blob) => {
                  if (blob) {
                    // Convert blob to array buffer
                    const reader = new FileReader();
                    reader.onload = () => {
                      const arrayBuffer = reader.result;
                      const uint8Array = new Uint8Array(arrayBuffer);
                      resolve({
                        success: true,
                        data: Array.from(uint8Array),
                        dimensions: { 
                          original: { width: img.width, height: img.height },
                          new: { width: newWidth, height: newHeight }
                        }
                      });
                    };
                    reader.readAsArrayBuffer(blob);
                  } else {
                    reject(new Error('Failed to create blob'));
                  }
                }, mimeType, compressionQuality);
                
                URL.revokeObjectURL(imageUrl);
              } catch (error) {
                reject(error);
              }
            };
            
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = imageUrl;
          });
        } catch (error) {
          return { success: false, error: error.message };
        }
      })()
    `);
        if (result.success) {
            // Write the processed image data
            const buffer = Buffer.from(result.data);
            node_fs_1.default.writeFileSync(outputPath, buffer);
            console.log(`Image processed: ${inputPath} -> ${outputPath} (${result.dimensions.original.width}x${result.dimensions.original.height} -> ${result.dimensions.new.width}x${result.dimensions.new.height})`);
        }
        else {
            throw new Error(result.error || 'Image processing failed');
        }
    }
    catch (error) {
        console.error('Failed to process image, falling back to copy:', error);
        // Fallback to copy
        node_fs_1.default.copyFileSync(inputPath, outputPath);
    }
}
// Root directory that contains the various content folders
let CONTENT_ROOT = node_path_1.default.join(process.cwd(), '../contents');
// Update content root based on GitHub repository configuration
async function updateContentRoot() {
    console.log('=== updateContentRoot() called ===');
    const previousContentRoot = CONTENT_ROOT;
    try {
        // Check if GitHub service has a configured repository
        const config = githubService.getConfig();
        console.log('DEBUG: GitHubService config:', config);
        if (config && config.localPath) {
            console.log(`DEBUG: Checking local path: ${config.localPath}`);
            console.log(`DEBUG: Local path exists: ${node_fs_1.default.existsSync(config.localPath)}`);
            if (node_fs_1.default.existsSync(config.localPath)) {
                const clonedContentsPath = node_path_1.default.join(config.localPath, 'contents');
                console.log(`DEBUG: Checking contents path: ${clonedContentsPath}`);
                console.log(`DEBUG: Contents path exists: ${node_fs_1.default.existsSync(clonedContentsPath)}`);
                if (node_fs_1.default.existsSync(clonedContentsPath)) {
                    CONTENT_ROOT = clonedContentsPath;
                    contentRepo.setRoot(CONTENT_ROOT);
                    console.log(`✅ Using GitHub cloned contents at: ${CONTENT_ROOT}`);
                    if (previousContentRoot !== CONTENT_ROOT) {
                        console.log(`📂 Content root changed from: ${previousContentRoot} to: ${CONTENT_ROOT}`);
                    }
                    return;
                }
                else {
                    console.log(`❌ Contents directory not found in cloned repository: ${clonedContentsPath}`);
                }
            }
            else {
                console.log(`❌ Local path does not exist: ${config.localPath}`);
            }
        }
        else {
            console.log('❌ GitHub service not configured or missing localPath');
        }
    }
    catch (error) {
        console.log('❌ Error checking GitHub repository configuration:', error);
    }
    // Fallback to default if no GitHub config
    const defaultContentRoot = node_path_1.default.join(process.cwd(), '../contents');
    CONTENT_ROOT = defaultContentRoot;
    contentRepo.setRoot(CONTENT_ROOT);
    console.log(`📁 Using default contents at: ${CONTENT_ROOT}`);
    if (previousContentRoot !== CONTENT_ROOT) {
        console.log(`📂 Content root changed from: ${previousContentRoot} to: ${CONTENT_ROOT}`);
    }
}
// GitHub service instance
const githubService = new github_service_1.GitHubService();
// Clean Architecture adapters & use cases
const gitRepoAdapter = new GitRepository_1.GitRepository(githubService);
const cloneRepoUC = new CloneRepository_1.CloneRepositoryUseCase(gitRepoAdapter);
const pullLatestUC = new PullLatest_1.PullLatestUseCase(gitRepoAdapter);
const commitPushUC = new CommitAndPush_1.CommitAndPushUseCase(gitRepoAdapter);
const contentRepo = new ContentRepository_1.ContentRepository(CONTENT_ROOT);
// Utility to get path to specific item directory (used for media saving)
function getItemDir(type, id) {
    return node_path_1.default.join(CONTENT_ROOT, type, id);
}
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: node_path_1.default.join(__dirname, 'preload.js'),
            // Enable web security
            webSecurity: true,
        },
    });
    // Clear cache when creating window
    win.webContents.session.clearCache();
    // Reload page when files change in development
    if (!electron_1.app.isPackaged) {
        // Add DevTools for debugging
        win.webContents.openDevTools();
    }
    if (electron_1.app.isPackaged) {
        const htmlPath = node_path_1.default.join(__dirname, 'renderer', 'index.html');
        console.log(`Loading packaged HTML from: ${htmlPath}`);
        // Add cache-busting query parameter
        win.loadFile(htmlPath, {
            query: {
                _t: Date.now().toString(),
            },
        });
    }
    else {
        // In development, load from the filesystem dir (src)
        const devPath = node_path_1.default.join(__dirname, '../src/renderer/index.html');
        console.log(`Loading development HTML from: ${devPath}`);
        win.loadURL((0, node_url_1.format)({
            pathname: devPath,
            protocol: 'file:',
            slashes: true,
            query: {
                _t: Date.now().toString(),
            },
        }));
    }
    // Force reload after initial load to ensure latest content
    win.webContents.once('did-finish-load', () => {
        if (electron_1.app.isPackaged) {
            console.log('Packaged app loaded, content ready');
        }
    });
}
electron_1.app.whenReady().then(async () => {
    // Try to restore GitHub configuration on startup
    await tryRestoreGitHubConfiguration();
    await updateContentRoot();
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
/* eslint-disable @typescript-eslint/no-unused-vars */
// Legacy utility functions retained for reference; no longer used after ContentRepository migration
// Utility functions for interacting with file system
async function ensureContentRoot() {
    // Update content root based on current GitHub configuration
    await updateContentRoot();
    // Ensure the content root directory exists
    if (!node_fs_1.default.existsSync(CONTENT_ROOT)) {
        console.log(`Creating content root directory: ${CONTENT_ROOT}`);
        node_fs_1.default.mkdirSync(CONTENT_ROOT, { recursive: true });
    }
    console.log(`Using content root: ${CONTENT_ROOT}`);
}
// Restore GitHub configuration from stored config
async function tryRestoreGitHubConfiguration() {
    try {
        console.log('DEBUG: Attempting to restore GitHub configuration on startup...');
        // Try to get OAuth config
        const oauthConfig = await (0, exports.getGitHubOAuthConfig)();
        if (!oauthConfig || !(0, exports.validateGitHubConfig)(oauthConfig)) {
            console.log('DEBUG: No valid OAuth config found, skipping GitHub restore');
            return;
        }
        // Check if there's a stored repository configuration in user data
        const userDataPath = electron_1.app.getPath('userData');
        const configPath = node_path_1.default.join(userDataPath, 'github-repo-config.json');
        if (node_fs_1.default.existsSync(configPath)) {
            try {
                const configData = JSON.parse(node_fs_1.default.readFileSync(configPath, 'utf8'));
                console.log('DEBUG: Found stored repository config:', {
                    owner: configData.owner,
                    repo: configData.repo,
                    localPath: configData.localPath,
                    hasToken: !!configData.token,
                });
                // Restore GitHub service configuration
                if (configData.token) {
                    await githubService.authenticate(configData.token);
                    githubService.setRepositoryConfig(configData.owner, configData.repo, configData.localPath, configData.token);
                    console.log('✅ GitHub configuration restored from storage');
                }
            }
            catch (error) {
                console.log('❌ Failed to parse stored config:', error);
            }
        }
        else {
            console.log('DEBUG: No stored repository config found');
        }
    }
    catch (error) {
        console.log('DEBUG: Error during GitHub configuration restoration:', error);
    }
}
// ================= IPC handlers =================
electron_1.ipcMain.handle('get-content-types', async () => contentRepo.listContentTypes());
electron_1.ipcMain.handle('get-items', (_e, type) => contentRepo.listItems(type));
electron_1.ipcMain.handle('create-item', (_e, type) => contentRepo.createItem(type));
electron_1.ipcMain.handle('delete-item', (_e, type, id) => contentRepo.deleteItem(type, id));
electron_1.ipcMain.handle('load-content', (_e, type, id) => contentRepo.loadContent(type, id));
// Add handler to manually update content root
electron_1.ipcMain.handle('update-content-root', async () => {
    try {
        await updateContentRoot();
        return { success: true, contentRoot: CONTENT_ROOT };
    }
    catch (error) {
        console.error('Failed to update content root:', error);
        return { success: false, error: error.message };
    }
});
// ディレクトリ選択ダイアログ
electron_1.ipcMain.handle('select-directory', async () => {
    try {
        const mainWindow = electron_1.BrowserWindow.getAllWindows()[0];
        const result = await electron_1.dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory', 'createDirectory'],
            title: 'GitHub リポジトリ保存先を選択',
            message: 'リポジトリをクローンするディレクトリを選択してください',
        });
        if (!result.canceled && result.filePaths.length > 0) {
            return { success: true, path: result.filePaths[0] };
        }
        else {
            return { success: false, error: 'ディレクトリが選択されませんでした' };
        }
    }
    catch (error) {
        console.error('Directory selection error:', error);
        return { success: false, error: error.message };
    }
});
// デフォルトパスの取得
electron_1.ipcMain.handle('get-default-local-path', () => {
    try {
        const homeDir = electron_1.app.getPath('documents');
        const defaultPath = node_path_1.default.join(homeDir, 'morinolab');
        return { success: true, path: defaultPath };
    }
    catch (error) {
        console.error('Failed to get default path:', error);
        return { success: false, error: error.message };
    }
});
electron_1.ipcMain.on('save-content', (_e, type, id, content) => {
    contentRepo.saveContent(type, id, content);
});
// Handle image file copy from renderer
electron_1.ipcMain.handle('save-image', async (_event, type, id, sourcePath, fileName) => {
    const mediaDir = node_path_1.default.join(getItemDir(type, id), 'media');
    if (!node_fs_1.default.existsSync(mediaDir))
        node_fs_1.default.mkdirSync(mediaDir, { recursive: true });
    // If file with same name exists, add suffix
    let destName = fileName;
    const ext = node_path_1.default.extname(fileName);
    const base = node_path_1.default.basename(fileName, ext);
    let counter = 1;
    while (node_fs_1.default.existsSync(node_path_1.default.join(mediaDir, destName))) {
        destName = `${base}_${counter}${ext}`;
        counter += 1;
    }
    const destPath = node_path_1.default.join(mediaDir, destName);
    try {
        // Process image with our simple image processor - more aggressive compression
        await processImage(sourcePath, destPath, 1600, 0.6);
        // Return markdown relative path
        return `./media/${destName}`;
    }
    catch (error) {
        console.error('Failed to process image, falling back to copy:', error);
        // Fallback to simple copy if processing fails
        try {
            node_fs_1.default.copyFileSync(sourcePath, destPath);
            return `./media/${destName}`;
        }
        catch (copyError) {
            console.error('Failed to copy image:', copyError);
            return null;
        }
    }
});
electron_1.ipcMain.handle('get-table-data', (_e, type) => contentRepo.getTableData(type));
electron_1.ipcMain.handle('update-cell', (_e, type, id, column, value) => contentRepo.updateCell(type, id, column, value));
electron_1.ipcMain.handle('select-thumbnail', async (_event, type, id) => {
    const result = await electron_1.dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp'] }],
    });
    if (result.canceled || !result.filePaths.length)
        return null;
    const sourcePath = result.filePaths[0];
    const ext = node_path_1.default.extname(sourcePath).toLowerCase();
    const destDir = node_path_1.default.join(CONTENT_ROOT, type); // same level as csv
    if (!node_fs_1.default.existsSync(destDir))
        node_fs_1.default.mkdirSync(destDir, { recursive: true });
    const destName = `${id}${ext}`;
    const destPath = node_path_1.default.join(destDir, destName);
    // Process and resize thumbnail - more aggressive compression for thumbnails
    try {
        await processImage(sourcePath, destPath, 800, 0.5);
    }
    catch (error) {
        console.error('Failed to process thumbnail, falling back to copy:', error);
        // Fallback to simple copy if processing fails
        node_fs_1.default.copyFileSync(sourcePath, destPath);
    }
    return `./${destName}`;
});
electron_1.ipcMain.handle('resolve-path', (_e, type, rel) => {
    const abs = node_path_1.default.join(CONTENT_ROOT, type, rel.replace(/^\.\//, ''));
    return 'file://' + abs;
});
electron_1.ipcMain.handle('get-font-url', () => {
    // Check multiple possible locations for the font file
    const appPath = electron_1.app.getAppPath();
    const resourcesPath = process.resourcesPath || node_path_1.default.join(appPath, '..', 'Resources');
    const possiblePaths = [
        node_path_1.default.join(process.cwd(), 'Sango-JA-CPAL.ttf'), // Development
        node_path_1.default.join(appPath, 'Sango-JA-CPAL.ttf'), // Packaged app root
        node_path_1.default.join(resourcesPath, 'Sango-JA-CPAL.ttf'), // extraResource location
        node_path_1.default.join(resourcesPath, 'fonts', 'Sango-JA-CPAL.ttf'), // fonts subfolder inside resources (common on Windows)
        node_path_1.default.join(resourcesPath, 'app.asar.unpacked', 'Sango-JA-CPAL.ttf'), // unpacked resources
        node_path_1.default.join(appPath, 'fonts', 'Sango-JA-CPAL.ttf'), // fonts folder next to executable
        node_path_1.default.join(__dirname, '..', 'Sango-JA-CPAL.ttf'), // One level up from dist
        node_path_1.default.join(__dirname, 'Sango-JA-CPAL.ttf'), // Same directory as main.js
    ];
    for (const fontPath of possiblePaths) {
        if (node_fs_1.default.existsSync(fontPath)) {
            console.log('Font found at:', fontPath);
            return 'file://' + fontPath;
        }
    }
    console.warn('Font file not found in any of the expected locations:', possiblePaths);
    console.warn('App path:', appPath);
    console.warn('Resources path:', resourcesPath);
    console.warn('__dirname:', __dirname);
    console.warn('process.cwd():', process.cwd());
    return null;
});
// ============================================================
// GitHub API handlers
// ============================================================
// GitHub認証
electron_1.ipcMain.handle('github-authenticate', async (_, token) => {
    try {
        const success = await githubService.authenticate(token);
        return { success, error: success ? null : 'Authentication failed' };
    }
    catch (error) {
        console.error('GitHub authentication error:', error);
        return { success: false, error: error.message };
    }
});
// リポジトリ設定
electron_1.ipcMain.handle('github-set-repository', async (_, owner, repo, localPath, token) => {
    try {
        githubService.setRepositoryConfig(owner, repo, localPath, token);
        // Save configuration to persistent storage
        const userDataPath = electron_1.app.getPath('userData');
        const configPath = node_path_1.default.join(userDataPath, 'github-repo-config.json');
        const configData = { owner, repo, localPath, token };
        node_fs_1.default.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf8');
        console.log('✅ GitHub repository configuration saved to storage');
        // Update content root immediately
        await updateContentRoot();
        return { success: true, error: null };
    }
    catch (error) {
        console.error('GitHub repository config error:', error);
        return { success: false, error: error.message };
    }
});
// リポジトリクローン
electron_1.ipcMain.handle('github-clone-repository', async () => {
    try {
        const success = await githubService.cloneRepository();
        if (success) {
            // Update content root after successful clone
            await updateContentRoot();
        }
        return { success, error: success ? null : 'Clone failed' };
    }
    catch (error) {
        console.error('GitHub clone error:', error);
        return { success: false, error: error.message };
    }
});
// コミット&プッシュ（pull → merge → commit → push を一連で実行）
electron_1.ipcMain.handle('github-commit-push', async (_, message) => {
    try {
        const win = electron_1.BrowserWindow.getAllWindows()[0];
        const result = await commitPushUC.execute(message, (msg, percent) => {
            win?.webContents.send('github-commit-progress', { message: msg, percent });
        });
        return result;
    }
    catch (error) {
        console.error('GitHub commit and push error:', error);
        return { success: false, error: error.message };
    }
});
// 最新変更をプル
electron_1.ipcMain.handle('github-pull-latest', async () => {
    try {
        return await pullLatestUC.execute();
    }
    catch (error) {
        console.error('GitHub pull error:', error);
        return { success: false, error: error.message };
    }
});
// リポジトリステータス取得
electron_1.ipcMain.handle('github-get-status', async () => {
    try {
        const status = await githubService.getRepositoryStatus();
        return { success: true, data: status, error: null };
    }
    catch (error) {
        console.error('GitHub status error:', error);
        return { success: false, data: null, error: error.message };
    }
});
// リポジトリ情報取得
electron_1.ipcMain.handle('github-get-info', async () => {
    try {
        const info = await githubService.getRepositoryInfo();
        return { success: true, data: info, error: null };
    }
    catch (error) {
        console.error('GitHub info error:', error);
        return { success: false, data: null, error: error.message };
    }
});
// GitHub認証状態確認
electron_1.ipcMain.handle('github-is-authenticated', () => {
    return githubService.isAuthenticated();
});
// GitHub設定状態確認
electron_1.ipcMain.handle('github-is-configured', () => {
    return githubService.isConfigured();
});
// GitHub設定情報取得
electron_1.ipcMain.handle('github-get-config', () => {
    return githubService.getConfig();
});
// GitHub OAuth認証（設定を内部で取得）
electron_1.ipcMain.handle('github-oauth-authenticate', async () => {
    try {
        const { clientId } = await (0, exports.getGitHubOAuthConfig)();
        // Device Flow authentication (Client Secret not required)
        return await githubService.authenticateWithDeviceFlow(clientId);
    }
    catch (error) {
        console.error('GitHub OAuth authentication error:', error);
        return { success: false, error: error.message };
    }
});
// ユーザーリポジトリ一覧取得
electron_1.ipcMain.handle('github-get-user-repositories', async () => {
    try {
        const repositories = await githubService.getUserRepositories();
        return { success: true, data: repositories, error: null };
    }
    catch (error) {
        console.error('GitHub repositories error:', error);
        return { success: false, data: [], error: error.message };
    }
});
// プログレス付きクローン
electron_1.ipcMain.handle('github-clone-with-progress', async () => {
    try {
        const result = await cloneRepoUC.execute((message, percent) => {
            electron_1.BrowserWindow.getAllWindows()[0]?.webContents.send('github-clone-progress', {
                message,
                percent,
            });
        });
        if (result.success)
            await updateContentRoot();
        return result;
    }
    catch (error) {
        console.error('GitHub clone with progress error:', error);
        return { success: false, error: error.message };
    }
});
// GitHub OAuth設定の保存
electron_1.ipcMain.handle('github-save-oauth-config', async (_, clientId, clientSecret) => {
    try {
        await (0, exports.saveGitHubOAuthConfig)(clientId, clientSecret);
        return { success: true, error: null };
    }
    catch (error) {
        console.error('Failed to save GitHub OAuth config:', error);
        return { success: false, error: error.message };
    }
});
// GitHub設定状態の確認
electron_1.ipcMain.handle('github-check-config-status', async () => {
    try {
        const isConfigured = await (0, exports.isGitHubConfigured)();
        return {
            success: true,
            configured: isConfigured,
            setupGuide: isConfigured ? null : (0, exports.showGitHubSetupGuide)(),
        };
    }
    catch (error) {
        console.error('Failed to check GitHub config status:', error);
        return { success: false, configured: false, error: error.message };
    }
});
// GitHub設定の復元
electron_1.ipcMain.handle('github-restore-config', async (_, configData) => {
    try {
        console.log('DEBUG: Restoring GitHub configuration:', {
            owner: configData.owner,
            repo: configData.repo,
            localPath: configData.localPath,
            hasToken: !!configData.token,
        });
        // GitHub認証とリポジトリ設定を復元
        await githubService.authenticate(configData.token);
        githubService.setRepositoryConfig(configData.owner, configData.repo, configData.localPath, configData.token);
        // Save configuration to persistent storage
        const userDataPath = electron_1.app.getPath('userData');
        const configPath = node_path_1.default.join(userDataPath, 'github-repo-config.json');
        node_fs_1.default.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf8');
        console.log('✅ GitHub repository configuration saved to storage');
        // CONTENT_ROOTを更新
        await updateContentRoot();
        console.log('✅ GitHub configuration restored successfully');
        return { success: true };
    }
    catch (error) {
        console.error('❌ Failed to restore GitHub config:', error);
        return { success: false, error: error.message };
    }
});
// GitHub OAuth設定の取得（クライアントIDのみ、セキュリティのためClientSecretは返さない）
electron_1.ipcMain.handle('github-get-oauth-config', async () => {
    try {
        const config = await (0, exports.getGitHubOAuthConfig)();
        if (config) {
            return {
                success: true,
                data: {
                    clientId: config.clientId,
                },
            };
        }
        return { success: false, data: null, error: 'No config found' };
    }
    catch (error) {
        console.error('Failed to get GitHub OAuth config:', error);
        return { success: false, data: null, error: error.message };
    }
});
// コミットログ取得
electron_1.ipcMain.handle('github-get-log', async (_event, limit = 20) => {
    try {
        const logs = await githubService.getCommitLog(limit);
        return { success: true, data: logs, error: null };
    }
    catch (error) {
        console.error('GitHub get log error:', error);
        return { success: false, data: null, error: error.message };
    }
});
// ===============================
//   Git Conflict Resolution API
// ===============================
// 未解決コンフリクト一覧
electron_1.ipcMain.handle('github-get-conflicts', async () => {
    try {
        const files = await githubService.getConflictFiles();
        return { success: true, data: files, error: null };
    }
    catch (error) {
        return { success: false, data: [], error: error.message };
    }
});
// コンフリクトファイル内容取得
electron_1.ipcMain.handle('github-get-conflict-content', async (_e, filePath) => {
    try {
        const data = await githubService.getConflictContent(filePath);
        return { success: true, data, error: null };
    }
    catch (error) {
        return { success: false, data: null, error: error.message };
    }
});
// コンフリクトファイルの両バージョン取得
electron_1.ipcMain.handle('github-get-conflict-versions', async (_e, filePath) => {
    try {
        const versions = await githubService.getConflictVersions(filePath);
        return { success: true, data: versions, error: null };
    }
    catch (error) {
        return { success: false, data: null, error: error.message };
    }
});
// コンフリクト解決（内容を保存）
electron_1.ipcMain.handle('github-resolve-conflict', async (_e, filePath, content) => {
    try {
        const ok = await githubService.resolveConflict(filePath, content);
        return { success: ok, error: ok ? null : 'Failed to resolve conflict' };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
// すべて解消後のマージコミット作成
electron_1.ipcMain.handle('github-complete-merge', async (_e, message) => {
    try {
        const ok = await githubService.completeMerge(message);
        return { success: ok, error: ok ? null : 'Complete merge failed' };
    }
    catch (error) {
        return { success: false, error: error.message };
    }
});
// 全コンフリクト解決済みか確認
electron_1.ipcMain.handle('github-check-conflicts-resolved', async () => {
    try {
        const resolved = await githubService.areAllConflictsResolved();
        return { success: true, data: resolved, error: null };
    }
    catch (error) {
        return { success: false, data: false, error: error.message };
    }
});
