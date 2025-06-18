import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { format } from 'node:url';
import matter from 'gray-matter';
import Papa from 'papaparse';
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
const CONTENT_ROOT = path.join(process.cwd(), '../contents');

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
      }),
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
  const fontPath = path.join(process.cwd(), 'Sango-JA-CPAL.ttf');
  return fs.existsSync(fontPath) ? 'file://' + fontPath : null;
});
