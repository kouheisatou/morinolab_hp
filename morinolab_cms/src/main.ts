import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { format } from 'node:url';
import matter from 'gray-matter';

// Root directory that contains the various content folders
const CONTENT_ROOT = path.join(process.cwd(), 'contents');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  } else {
    // In development, load from the filesystem dir (src)
    win.loadURL(
      format({
        pathname: path.join(__dirname, '../src/renderer/index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
  }
}

app.whenReady().then(() => {
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

function ensureContentRoot() {
  if (!fs.existsSync(CONTENT_ROOT)) {
    fs.mkdirSync(CONTENT_ROOT, { recursive: true });
  }
}

function listContentTypes(): string[] {
  ensureContentRoot();
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

function createItem(type: string) {
  const typeDir = path.join(CONTENT_ROOT, type);
  ensureContentRoot();
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

  return { id: String(newId), title: '新規記事' };
}

function deleteItem(type: string, id: string) {
  const dir = getItemDir(type, id);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
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

// ============================================================
// IPC handlers
// ============================================================

type Handler = Parameters<typeof ipcMain.handle>[1];

const wrap: (fn: (...args: any[]) => any) => Handler = (fn) => (_event, ...args) => fn(...args);

ipcMain.handle('get-content-types', wrap(listContentTypes));
ipcMain.handle('get-items', wrap(listItems));
ipcMain.handle('create-item', wrap(createItem));
ipcMain.handle('delete-item', wrap(deleteItem));
ipcMain.handle('load-content', wrap(loadContent));

ipcMain.on('save-content', (_event, type: string, id: string, content: string) => {
  saveContent(type, id, content);
});

// Handle image file copy from renderer
ipcMain.handle(
  'save-image',
  async (_event, type: string, id: string, sourcePath: string, fileName: string) => {
    try {
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
      fs.copyFileSync(sourcePath, destPath);

      // Return markdown relative path
      return `./media/${destName}`;
    } catch (error) {
      console.error('save-image error', error);
      return null;
    }
  }
); 