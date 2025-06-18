"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_url_1 = require("node:url");
const gray_matter_1 = __importDefault(require("gray-matter"));
const papaparse_1 = __importDefault(require("papaparse"));
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
const CONTENT_ROOT = node_path_1.default.join(process.cwd(), '../contents');
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: node_path_1.default.join(__dirname, 'preload.js'),
        },
    });
    if (electron_1.app.isPackaged) {
        win.loadFile(node_path_1.default.join(__dirname, 'renderer', 'index.html'));
    }
    else {
        // In development, load from the filesystem dir (src)
        win.loadURL((0, node_url_1.format)({
            pathname: node_path_1.default.join(__dirname, '../src/renderer/index.html'),
            protocol: 'file:',
            slashes: true,
        }));
    }
}
electron_1.app.whenReady().then(() => {
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
// ============================================================
// Utility functions for interacting with file system
// ============================================================
function ensureContentRoot() {
    if (!node_fs_1.default.existsSync(CONTENT_ROOT)) {
        node_fs_1.default.mkdirSync(CONTENT_ROOT, { recursive: true });
    }
}
function listContentTypes() {
    ensureContentRoot();
    return node_fs_1.default
        .readdirSync(CONTENT_ROOT, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);
}
function getItemDir(type, id) {
    return node_path_1.default.join(CONTENT_ROOT, type, id);
}
function listItems(type) {
    const typeDir = node_path_1.default.join(CONTENT_ROOT, type);
    if (!node_fs_1.default.existsSync(typeDir))
        return [];
    return node_fs_1.default
        .readdirSync(typeDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => {
        const articlePath = node_path_1.default.join(typeDir, d.name, 'article.md');
        let title = '';
        if (node_fs_1.default.existsSync(articlePath)) {
            try {
                const file = node_fs_1.default.readFileSync(articlePath, 'utf8');
                const { data } = (0, gray_matter_1.default)(file);
                title = data.title || '';
            }
            catch {
                /* ignore errors */
            }
        }
        return { id: d.name, title };
    })
        .sort((a, b) => Number(a.id) - Number(b.id));
}
function createItem(type) {
    const typeDir = node_path_1.default.join(CONTENT_ROOT, type);
    ensureContentRoot();
    if (!node_fs_1.default.existsSync(typeDir))
        node_fs_1.default.mkdirSync(typeDir, { recursive: true });
    // Pick next numeric id
    const ids = node_fs_1.default
        .readdirSync(typeDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => Number(d.name))
        .filter((n) => !isNaN(n));
    const newId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
    const itemDir = node_path_1.default.join(typeDir, String(newId));
    node_fs_1.default.mkdirSync(itemDir);
    const template = `---\ntitle: 新規記事\n---\n\n# 見出し\n\nここに本文を書いてください\n`;
    node_fs_1.default.writeFileSync(node_path_1.default.join(itemDir, 'article.md'), template, 'utf8');
    // CSV row
    const { header, rows } = loadCsvTable(type);
    if (!header.includes('id'))
        header.unshift('id');
    const newRow = {};
    header.forEach((h) => {
        newRow[h] = '';
    });
    newRow['id'] = String(newId);
    rows.push(newRow);
    saveCsvTable(type, header, rows);
    return { id: String(newId), title: '新規記事' };
}
function deleteItem(type, id) {
    const dir = getItemDir(type, id);
    if (node_fs_1.default.existsSync(dir)) {
        node_fs_1.default.rmSync(dir, { recursive: true, force: true });
    }
    // remove thumbnail file
    const typeDir = node_path_1.default.join(CONTENT_ROOT, type);
    const thumbPattern = new RegExp(`^${id}\\.(png|jpe?g|gif|webp)$`, 'i');
    node_fs_1.default.readdirSync(typeDir)
        .filter((f) => thumbPattern.test(f))
        .forEach((f) => node_fs_1.default.rmSync(node_path_1.default.join(typeDir, f), { force: true }));
    const { header, rows } = loadCsvTable(type);
    const newRows = rows.filter((r) => String(r.id) !== String(id));
    saveCsvTable(type, header, newRows);
}
function loadContent(type, id) {
    const articlePath = node_path_1.default.join(getItemDir(type, id), 'article.md');
    if (node_fs_1.default.existsSync(articlePath)) {
        return node_fs_1.default.readFileSync(articlePath, 'utf8');
    }
    return '';
}
function saveContent(type, id, content) {
    const articlePath = node_path_1.default.join(getItemDir(type, id), 'article.md');
    node_fs_1.default.writeFileSync(articlePath, content, 'utf8');
}
// ================= CSV Utils =================
function getCsvPath(type) {
    return node_path_1.default.join(CONTENT_ROOT, type, `${type}.csv`);
}
function loadCsvTable(type) {
    const csvPath = getCsvPath(type);
    if (!node_fs_1.default.existsSync(csvPath)) {
        return { header: ['id'], rows: [] };
    }
    const csvText = node_fs_1.default.readFileSync(csvPath, 'utf8');
    const parsed = papaparse_1.default.parse(csvText.trim(), {
        header: true,
        skipEmptyLines: true,
    });
    const header = parsed.meta.fields ?? [];
    const rows = parsed.data;
    return { header, rows };
}
function saveCsvTable(type, header, rows) {
    const csvPath = getCsvPath(type);
    let csvText = '';
    if (rows.length === 0) {
        csvText = header.join(',') + '\n';
    }
    else {
        csvText = papaparse_1.default.unparse(rows, { columns: header });
    }
    node_fs_1.default.writeFileSync(csvPath, csvText, 'utf8');
}
function getTableData(type) {
    return loadCsvTable(type);
}
function updateCell(type, id, column, value) {
    const { header, rows } = loadCsvTable(type);
    const row = rows.find((r) => String(r.id) === String(id));
    if (row) {
        row[column] = value;
        saveCsvTable(type, header, rows);
    }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wrap = (fn) => (_event, ...args) => fn(...args);
electron_1.ipcMain.handle('get-content-types', wrap(listContentTypes));
electron_1.ipcMain.handle('get-items', wrap(listItems));
electron_1.ipcMain.handle('create-item', wrap(createItem));
electron_1.ipcMain.handle('delete-item', wrap(deleteItem));
electron_1.ipcMain.handle('load-content', wrap(loadContent));
electron_1.ipcMain.on('save-content', (_event, type, id, content) => {
    saveContent(type, id, content);
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
electron_1.ipcMain.handle('get-table-data', wrap(getTableData));
electron_1.ipcMain.handle('update-cell', wrap(updateCell));
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
