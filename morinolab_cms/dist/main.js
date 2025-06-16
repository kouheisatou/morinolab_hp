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
// Root directory that contains the various content folders
const CONTENT_ROOT = node_path_1.default.join(process.cwd(), 'contents');
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
    return { id: String(newId), title: '新規記事' };
}
function deleteItem(type, id) {
    const dir = getItemDir(type, id);
    if (node_fs_1.default.existsSync(dir)) {
        node_fs_1.default.rmSync(dir, { recursive: true, force: true });
    }
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
    try {
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
        node_fs_1.default.copyFileSync(sourcePath, destPath);
        // Return markdown relative path
        return `./media/${destName}`;
    }
    catch (error) {
        console.error('save-image error', error);
        return null;
    }
});
