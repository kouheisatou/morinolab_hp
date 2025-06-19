import('dotenv').then((dotenv) => dotenv.config());

import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { format } from 'node:url';
import matter from 'gray-matter';
import Papa from 'papaparse';
import { GitHubService } from './github-service';
import {
  getGitHubOAuthConfig,
  validateGitHubConfig,
  saveGitHubOAuthConfig,
  isGitHubConfigured,
  showGitHubSetupGuide,
} from './github-config';
// Image processing using renderer process
async function processImage(
  inputPath: string,
  outputPath: string,
  maxWidth: number = 1600,
  quality: number = 0.8,
) {
  try {
    const stats = fs.statSync(inputPath);

    // Check if file size is reasonable (less than 50MB for original)
    if (stats.size > 50 * 1024 * 1024) {
      console.warn('File too large, copying without processing:', inputPath);
      fs.copyFileSync(inputPath, outputPath);
      return;
    }

    // Use the main window to process the image in renderer context
    const mainWindow = BrowserWindow.getAllWindows()[0];
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
                const ext = '${path.extname(outputPath).toLowerCase()}';
                
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
      fs.writeFileSync(outputPath, buffer);
      console.log(
        `Image processed: ${inputPath} -> ${outputPath} (${result.dimensions.original.width}x${result.dimensions.original.height} -> ${result.dimensions.new.width}x${result.dimensions.new.height})`,
      );
    } else {
      throw new Error(result.error || 'Image processing failed');
    }
  } catch (error) {
    console.error('Failed to process image, falling back to copy:', error);
    // Fallback to copy
    fs.copyFileSync(inputPath, outputPath);
  }
}

// Root directory that contains the various content folders
let CONTENT_ROOT = path.join(process.cwd(), '../contents');

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
      console.log(`DEBUG: Local path exists: ${fs.existsSync(config.localPath)}`);

      if (fs.existsSync(config.localPath)) {
        const clonedContentsPath = path.join(config.localPath, 'contents');
        console.log(`DEBUG: Checking contents path: ${clonedContentsPath}`);
        console.log(`DEBUG: Contents path exists: ${fs.existsSync(clonedContentsPath)}`);

        if (fs.existsSync(clonedContentsPath)) {
          CONTENT_ROOT = clonedContentsPath;
          console.log(`✅ Using GitHub cloned contents at: ${CONTENT_ROOT}`);

          if (previousContentRoot !== CONTENT_ROOT) {
            console.log(`📂 Content root changed from: ${previousContentRoot} to: ${CONTENT_ROOT}`);
          }
          return;
        } else {
          console.log(
            `❌ Contents directory not found in cloned repository: ${clonedContentsPath}`,
          );
        }
      } else {
        console.log(`❌ Local path does not exist: ${config.localPath}`);
      }
    } else {
      console.log('❌ GitHub service not configured or missing localPath');
    }
  } catch (error) {
    console.log('❌ Error checking GitHub repository configuration:', error);
  }

  // Fallback to default if no GitHub config
  const defaultContentRoot = path.join(process.cwd(), '../contents');
  CONTENT_ROOT = defaultContentRoot;
  console.log(`📁 Using default contents at: ${CONTENT_ROOT}`);

  if (previousContentRoot !== CONTENT_ROOT) {
    console.log(`📂 Content root changed from: ${previousContentRoot} to: ${CONTENT_ROOT}`);
  }
}

// GitHub service instance
const githubService = new GitHubService();

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      // Enable web security
      webSecurity: true,
    },
  });

  // Clear cache when creating window
  win.webContents.session.clearCache();

  // Reload page when files change in development
  if (!app.isPackaged) {
    // Add DevTools for debugging
    win.webContents.openDevTools();
  }

  if (app.isPackaged) {
    const htmlPath = path.join(__dirname, 'renderer', 'index.html');
    console.log(`Loading packaged HTML from: ${htmlPath}`);

    // Add cache-busting query parameter
    win.loadFile(htmlPath, {
      query: {
        _t: Date.now().toString(),
      },
    });
  } else {
    // In development, load from the filesystem dir (src)
    const devPath = path.join(__dirname, '../src/renderer/index.html');
    console.log(`Loading development HTML from: ${devPath}`);

    win.loadURL(
      format({
        pathname: devPath,
        protocol: 'file:',
        slashes: true,
        query: {
          _t: Date.now().toString(),
        },
      }),
    );
  }

  // Force reload after initial load to ensure latest content
  win.webContents.once('did-finish-load', () => {
    if (app.isPackaged) {
      console.log('Packaged app loaded, content ready');
    }
  });
}

app.whenReady().then(async () => {
  // Try to restore GitHub configuration on startup
  await tryRestoreGitHubConfiguration();
  await updateContentRoot();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ============================================================
// Utility functions for interacting with file system
// ============================================================

async function ensureContentRoot() {
  // Update content root based on current GitHub configuration
  await updateContentRoot();

  // Ensure the content root directory exists
  if (!fs.existsSync(CONTENT_ROOT)) {
    console.log(`Creating content root directory: ${CONTENT_ROOT}`);
    fs.mkdirSync(CONTENT_ROOT, { recursive: true });
  }

  console.log(`Using content root: ${CONTENT_ROOT}`);
}

// Restore GitHub configuration from stored config
async function tryRestoreGitHubConfiguration() {
  try {
    console.log('DEBUG: Attempting to restore GitHub configuration on startup...');

    // Try to get OAuth config
    const oauthConfig = await getGitHubOAuthConfig();
    if (!oauthConfig || !validateGitHubConfig(oauthConfig)) {
      console.log('DEBUG: No valid OAuth config found, skipping GitHub restore');
      return;
    }

    // Check if there's a stored repository configuration in user data
    const userDataPath = app.getPath('userData');
    const configPath = path.join(userDataPath, 'github-repo-config.json');

    if (fs.existsSync(configPath)) {
      try {
        const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log('DEBUG: Found stored repository config:', {
          owner: configData.owner,
          repo: configData.repo,
          localPath: configData.localPath,
          hasToken: !!configData.token,
        });

        // Restore GitHub service configuration
        if (configData.token) {
          await githubService.authenticate(configData.token);
          githubService.setRepositoryConfig(
            configData.owner,
            configData.repo,
            configData.localPath,
            configData.token,
          );
          console.log('✅ GitHub configuration restored from storage');
        }
      } catch (error) {
        console.log('❌ Failed to parse stored config:', error);
      }
    } else {
      console.log('DEBUG: No stored repository config found');
    }
  } catch (error) {
    console.log('DEBUG: Error during GitHub configuration restoration:', error);
  }
}

async function listContentTypes(): Promise<string[]> {
  await ensureContentRoot();
  return fs
    .readdirSync(CONTENT_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function getItemDir(type: string, id: string) {
  return path.join(CONTENT_ROOT, type, id);
}

function listItems(type: string) {
  const typeDir = path.join(CONTENT_ROOT, type);
  if (!fs.existsSync(typeDir)) return [];
  return fs
    .readdirSync(typeDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const articlePath = path.join(typeDir, d.name, 'article.md');
      let title = '';
      if (fs.existsSync(articlePath)) {
        try {
          const file = fs.readFileSync(articlePath, 'utf8');
          const { data } = matter(file);
          title = data.title || '';
        } catch {
          /* ignore errors */
        }
      }
      return { id: d.name, title };
    })
    .sort((a, b) => Number(a.id) - Number(b.id));
}

async function createItem(type: string) {
  const typeDir = path.join(CONTENT_ROOT, type);
  await ensureContentRoot();
  if (!fs.existsSync(typeDir)) fs.mkdirSync(typeDir, { recursive: true });

  // Pick next numeric id
  const ids = fs
    .readdirSync(typeDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => Number(d.name))
    .filter((n) => !isNaN(n));
  const newId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
  const itemDir = path.join(typeDir, String(newId));
  fs.mkdirSync(itemDir);

  const template = `---\ntitle: 新規記事\n---\n\n# 見出し\n\nここに本文を書いてください\n`;
  fs.writeFileSync(path.join(itemDir, 'article.md'), template, 'utf8');

  // CSV row
  const { header, rows } = loadCsvTable(type);
  if (!header.includes('id')) header.unshift('id');
  const newRow: Record<string, string> = {};
  header.forEach((h) => {
    newRow[h] = '';
  });
  newRow['id'] = String(newId);
  rows.push(newRow);
  saveCsvTable(type, header, rows);

  return { id: String(newId), title: '新規記事' };
}

function deleteItem(type: string, id: string) {
  const dir = getItemDir(type, id);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  // remove thumbnail file
  const typeDir = path.join(CONTENT_ROOT, type);
  const thumbPattern = new RegExp(`^${id}\\.(png|jpe?g|gif|webp)$`, 'i');
  fs.readdirSync(typeDir)
    .filter((f) => thumbPattern.test(f))
    .forEach((f) => fs.rmSync(path.join(typeDir, f), { force: true }));
  const { header, rows } = loadCsvTable(type);
  const newRows = rows.filter((r) => String(r.id) !== String(id));
  saveCsvTable(type, header, newRows);
}

function loadContent(type: string, id: string) {
  const articlePath = path.join(getItemDir(type, id), 'article.md');
  if (fs.existsSync(articlePath)) {
    return fs.readFileSync(articlePath, 'utf8');
  }
  return '';
}

function saveContent(type: string, id: string, content: string) {
  const articlePath = path.join(getItemDir(type, id), 'article.md');
  fs.writeFileSync(articlePath, content, 'utf8');
}

// ================= CSV Utils =================
function getCsvPath(type: string) {
  return path.join(CONTENT_ROOT, type, `${type}.csv`);
}

function loadCsvTable(type: string): { header: string[]; rows: Record<string, string>[] } {
  const csvPath = getCsvPath(type);
  if (!fs.existsSync(csvPath)) {
    return { header: ['id'], rows: [] };
  }
  const csvText = fs.readFileSync(csvPath, 'utf8');
  const parsed = Papa.parse<Record<string, string>>(csvText.trim(), {
    header: true,
    skipEmptyLines: true,
  });
  const header = parsed.meta.fields ?? [];
  const rows = parsed.data;
  return { header, rows };
}

function saveCsvTable(type: string, header: string[], rows: Record<string, string>[]) {
  const csvPath = getCsvPath(type);
  let csvText = '';
  if (rows.length === 0) {
    csvText = header.join(',') + '\n';
  } else {
    csvText = Papa.unparse(rows, { columns: header });
  }
  fs.writeFileSync(csvPath, csvText, 'utf8');
}

function getTableData(type: string) {
  return loadCsvTable(type);
}

function updateCell(type: string, id: string, column: string, value: string) {
  const { header, rows } = loadCsvTable(type);
  const row = rows.find((r) => String(r.id) === String(id));
  if (row) {
    row[column] = value;
    saveCsvTable(type, header, rows);
  }
}

// ============================================================
// IPC handlers
// ============================================================

type Handler = Parameters<typeof ipcMain.handle>[1];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wrap: (fn: (...args: any[]) => any) => Handler =
  (fn) =>
  (_event, ...args) =>
    fn(...args);

ipcMain.handle('get-content-types', wrap(listContentTypes));
ipcMain.handle('get-items', wrap(listItems));
ipcMain.handle('create-item', wrap(createItem));
ipcMain.handle('delete-item', wrap(deleteItem));
ipcMain.handle('load-content', wrap(loadContent));

// Add handler to manually update content root
ipcMain.handle('update-content-root', async () => {
  try {
    await updateContentRoot();
    return { success: true, contentRoot: CONTENT_ROOT };
  } catch (error) {
    console.error('Failed to update content root:', error);
    return { success: false, error: (error as Error).message };
  }
});

// ディレクトリ選択ダイアログ
ipcMain.handle('select-directory', async () => {
  try {
    const mainWindow = BrowserWindow.getAllWindows()[0];
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory', 'createDirectory'],
      title: 'GitHub リポジトリ保存先を選択',
      message: 'リポジトリをクローンするディレクトリを選択してください',
    });

    if (!result.canceled && result.filePaths.length > 0) {
      return { success: true, path: result.filePaths[0] };
    } else {
      return { success: false, error: 'ディレクトリが選択されませんでした' };
    }
  } catch (error) {
    console.error('Directory selection error:', error);
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.on('save-content', (_event, type: string, id: string, content: string) => {
  saveContent(type, id, content);
});

// Handle image file copy from renderer
ipcMain.handle(
  'save-image',
  async (_event, type: string, id: string, sourcePath: string, fileName: string) => {
    const mediaDir = path.join(getItemDir(type, id), 'media');
    if (!fs.existsSync(mediaDir)) fs.mkdirSync(mediaDir, { recursive: true });

    // If file with same name exists, add suffix
    let destName = fileName;
    const ext = path.extname(fileName);
    const base = path.basename(fileName, ext);
    let counter = 1;
    while (fs.existsSync(path.join(mediaDir, destName))) {
      destName = `${base}_${counter}${ext}`;
      counter += 1;
    }

    const destPath = path.join(mediaDir, destName);

    try {
      // Process image with our simple image processor - more aggressive compression
      await processImage(sourcePath, destPath, 1600, 0.6);

      // Return markdown relative path
      return `./media/${destName}`;
    } catch (error) {
      console.error('Failed to process image, falling back to copy:', error);
      // Fallback to simple copy if processing fails
      try {
        fs.copyFileSync(sourcePath, destPath);
        return `./media/${destName}`;
      } catch (copyError) {
        console.error('Failed to copy image:', copyError);
        return null;
      }
    }
  },
);

ipcMain.handle('get-table-data', wrap(getTableData));
ipcMain.handle('update-cell', wrap(updateCell));

ipcMain.handle('select-thumbnail', async (_event, type: string, id: string) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp'] }],
  });
  if (result.canceled || !result.filePaths.length) return null;
  const sourcePath = result.filePaths[0];
  const ext = path.extname(sourcePath).toLowerCase();
  const destDir = path.join(CONTENT_ROOT, type); // same level as csv
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const destName = `${id}${ext}`;
  const destPath = path.join(destDir, destName);
  // Process and resize thumbnail - more aggressive compression for thumbnails
  try {
    await processImage(sourcePath, destPath, 800, 0.5);
  } catch (error) {
    console.error('Failed to process thumbnail, falling back to copy:', error);
    // Fallback to simple copy if processing fails
    fs.copyFileSync(sourcePath, destPath);
  }
  return `./${destName}`;
});

ipcMain.handle('resolve-path', (_e, type: string, rel: string) => {
  const abs = path.join(CONTENT_ROOT, type, rel.replace(/^\.\//, ''));
  return 'file://' + abs;
});

ipcMain.handle('get-font-url', () => {
  // Check multiple possible locations for the font file
  const appPath = app.getAppPath();
  const resourcesPath = process.resourcesPath || path.join(appPath, '..', 'Resources');

  const possiblePaths = [
    path.join(process.cwd(), 'Sango-JA-CPAL.ttf'), // Development
    path.join(appPath, 'Sango-JA-CPAL.ttf'), // Packaged app root
    path.join(resourcesPath, 'Sango-JA-CPAL.ttf'), // extraResource location
    path.join(__dirname, '..', 'Sango-JA-CPAL.ttf'), // One level up from dist
    path.join(__dirname, 'Sango-JA-CPAL.ttf'), // Same directory as main.js
  ];

  for (const fontPath of possiblePaths) {
    if (fs.existsSync(fontPath)) {
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
ipcMain.handle('github-authenticate', async (_, token: string) => {
  try {
    const success = await githubService.authenticate(token);
    return { success, error: success ? null : 'Authentication failed' };
  } catch (error) {
    console.error('GitHub authentication error:', error);
    return { success: false, error: (error as Error).message };
  }
});

// リポジトリ設定
ipcMain.handle(
  'github-set-repository',
  async (_, owner: string, repo: string, localPath: string, token: string) => {
    try {
      githubService.setRepositoryConfig(owner, repo, localPath, token);

      // Save configuration to persistent storage
      const userDataPath = app.getPath('userData');
      const configPath = path.join(userDataPath, 'github-repo-config.json');
      const configData = { owner, repo, localPath, token };

      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf8');
      console.log('✅ GitHub repository configuration saved to storage');

      // Update content root immediately
      await updateContentRoot();

      return { success: true, error: null };
    } catch (error) {
      console.error('GitHub repository config error:', error);
      return { success: false, error: (error as Error).message };
    }
  },
);

// リポジトリクローン
ipcMain.handle('github-clone-repository', async () => {
  try {
    const success = await githubService.cloneRepository();
    if (success) {
      // Update content root after successful clone
      await updateContentRoot();
    }
    return { success, error: success ? null : 'Clone failed' };
  } catch (error) {
    console.error('GitHub clone error:', error);
    return { success: false, error: (error as Error).message };
  }
});

// コミット&プッシュ
ipcMain.handle('github-commit-push', async (_, message: string) => {
  try {
    const success = await githubService.commitAndPush(message);
    return { success, error: success ? null : 'Commit and push failed' };
  } catch (error) {
    console.error('GitHub commit and push error:', error);
    return { success: false, error: (error as Error).message };
  }
});

// リポジトリステータス取得
ipcMain.handle('github-get-status', async () => {
  try {
    const status = await githubService.getRepositoryStatus();
    return { success: true, data: status, error: null };
  } catch (error) {
    console.error('GitHub status error:', error);
    return { success: false, data: null, error: (error as Error).message };
  }
});

// 最新変更をプル
ipcMain.handle('github-pull-latest', async () => {
  try {
    const success = await githubService.pullLatest();
    return { success, error: success ? null : 'Pull failed' };
  } catch (error) {
    console.error('GitHub pull error:', error);
    return { success: false, error: (error as Error).message };
  }
});

// リポジトリ情報取得
ipcMain.handle('github-get-info', async () => {
  try {
    const info = await githubService.getRepositoryInfo();
    return { success: true, data: info, error: null };
  } catch (error) {
    console.error('GitHub info error:', error);
    return { success: false, data: null, error: (error as Error).message };
  }
});

// GitHub認証状態確認
ipcMain.handle('github-is-authenticated', () => {
  return githubService.isAuthenticated();
});

// GitHub設定状態確認
ipcMain.handle('github-is-configured', () => {
  return githubService.isConfigured();
});

// GitHub設定情報取得
ipcMain.handle('github-get-config', () => {
  return githubService.getConfig();
});

// GitHub OAuth認証（設定を内部で取得）
ipcMain.handle('github-oauth-authenticate', async () => {
  try {
    const oauthConfig = await getGitHubOAuthConfig();

    if (!oauthConfig || !validateGitHubConfig(oauthConfig)) {
      return {
        success: false,
        error: 'GitHub OAuth設定が正しくありません。初期設定が必要です。',
        setupGuide: showGitHubSetupGuide(),
      };
    }

    const result = await githubService.authenticateWithOAuth(
      oauthConfig.clientId,
      oauthConfig.clientSecret,
    );
    if (result.success && result.token) {
      await githubService.authenticate(result.token);
    }
    return result;
  } catch (error) {
    console.error('GitHub OAuth authentication error:', error);
    return { success: false, error: (error as Error).message };
  }
});

// ユーザーリポジトリ一覧取得
ipcMain.handle('github-get-user-repositories', async () => {
  try {
    const repositories = await githubService.getUserRepositories();
    return { success: true, data: repositories, error: null };
  } catch (error) {
    console.error('GitHub repositories error:', error);
    return { success: false, data: [], error: (error as Error).message };
  }
});

// プログレス付きクローン
ipcMain.handle('github-clone-with-progress', async () => {
  try {
    const success = await githubService.cloneRepositoryWithProgress((message, percent) => {
      // レンダラープロセスにプログレス情報を送信
      BrowserWindow.getAllWindows()[0]?.webContents.send('github-clone-progress', {
        message,
        percent,
      });
    });
    if (success) {
      // Update content root after successful clone
      await updateContentRoot();
    }
    return { success, error: success ? null : 'Clone failed' };
  } catch (error) {
    console.error('GitHub clone with progress error:', error);
    return { success: false, error: (error as Error).message };
  }
});

// GitHub OAuth設定の保存
ipcMain.handle('github-save-oauth-config', async (_, clientId: string, clientSecret: string) => {
  try {
    await saveGitHubOAuthConfig(clientId, clientSecret);
    return { success: true, error: null };
  } catch (error) {
    console.error('Failed to save GitHub OAuth config:', error);
    return { success: false, error: (error as Error).message };
  }
});

// GitHub設定状態の確認
ipcMain.handle('github-check-config-status', async () => {
  try {
    const isConfigured = await isGitHubConfigured();
    return {
      success: true,
      configured: isConfigured,
      setupGuide: isConfigured ? null : showGitHubSetupGuide(),
    };
  } catch (error) {
    console.error('Failed to check GitHub config status:', error);
    return { success: false, configured: false, error: (error as Error).message };
  }
});

// GitHub設定の復元
ipcMain.handle(
  'github-restore-config',
  async (_, configData: { owner: string; repo: string; localPath: string; token: string }) => {
    try {
      console.log('DEBUG: Restoring GitHub configuration:', {
        owner: configData.owner,
        repo: configData.repo,
        localPath: configData.localPath,
        hasToken: !!configData.token,
      });

      // GitHub認証とリポジトリ設定を復元
      await githubService.authenticate(configData.token);
      githubService.setRepositoryConfig(
        configData.owner,
        configData.repo,
        configData.localPath,
        configData.token,
      );

      // Save configuration to persistent storage
      const userDataPath = app.getPath('userData');
      const configPath = path.join(userDataPath, 'github-repo-config.json');

      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf8');
      console.log('✅ GitHub repository configuration saved to storage');

      // CONTENT_ROOTを更新
      await updateContentRoot();

      console.log('✅ GitHub configuration restored successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to restore GitHub config:', error);
      return { success: false, error: (error as Error).message };
    }
  },
);

// GitHub OAuth設定の取得（クライアントIDのみ、セキュリティのためClientSecretは返さない）
ipcMain.handle('github-get-oauth-config', async () => {
  try {
    const config = await getGitHubOAuthConfig();
    if (config) {
      return {
        success: true,
        data: {
          clientId: config.clientId,
          // セキュリティのため、Client Secretは返さない
          hasClientSecret: Boolean(config.clientSecret && config.clientSecret.length > 0),
        },
      };
    }
    return { success: false, data: null, error: 'No config found' };
  } catch (error) {
    console.error('Failed to get GitHub OAuth config:', error);
    return { success: false, data: null, error: (error as Error).message };
  }
});
