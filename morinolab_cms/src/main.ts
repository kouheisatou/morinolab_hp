import('dotenv').then((dotenv) => dotenv.config());

import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { GitHubService } from '@/github-service';
import { ContentService } from '@/services/content-service';
import { ImageService } from '@/services/image-service';
import { IPCService } from '@/services/ipc-service';

// Root directory that contains the various content folders
let CONTENT_ROOT = path.join(process.cwd(), '../contents');

// Initialize services
const githubService = new GitHubService();
const contentService = new ContentService(CONTENT_ROOT);
const imageService = new ImageService();
let ipcService: IPCService;

// Update content root based on GitHub repository configuration
async function updateContentRoot() {
  try {
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
          contentService.setContentRoot(CONTENT_ROOT);
          console.log(`✅ Using GitHub cloned contents at: ${CONTENT_ROOT}`);
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

  console.log(`📁 Using default contents at: ${CONTENT_ROOT}`);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
    },
  });

  // Clear cache when creating window
  win.webContents.session.clearCache();

  // Load the HTML file
  const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';

  if (isDev) {
    win.loadFile(path.join(__dirname, 'renderer', 'index.html')).catch((error) => {
      console.error('Failed to load development HTML:', error);
      // Fallback to dist version
      win.loadFile(path.join(__dirname, '..', 'dist', 'renderer', 'index.html'));
    });

    // Open DevTools in development
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'renderer', 'index.html')).catch((error) => {
      console.error('Failed to load HTML:', error);
    });
  }

  return win;
}

// Handle command line arguments
function handleCommandLineArgs() {
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--contents' && i + 1 < args.length) {
      const customContentRoot = path.resolve(args[i + 1]);
      if (fs.existsSync(customContentRoot)) {
        CONTENT_ROOT = customContentRoot;
        contentService.setContentRoot(CONTENT_ROOT);
        console.log(`📁 Using custom contents directory: ${CONTENT_ROOT}`);
      } else {
        console.error(`❌ Contents directory not found: ${customContentRoot}`);
      }
      i++; // Skip the next argument as it's the value for --contents
    }
  }
}

async function ensureContentRoot() {
  if (!fs.existsSync(CONTENT_ROOT)) {
    console.log(`Creating content root directory: ${CONTENT_ROOT}`);
    fs.mkdirSync(CONTENT_ROOT, { recursive: true });
  }
}

async function tryRestoreGitHubConfiguration() {
  try {
    await updateContentRoot();
    if (ipcService) {
      ipcService.updateContentRoot(CONTENT_ROOT);
    }
  } catch (error) {
    console.error('Failed to restore GitHub configuration:', error);
  }
}

// App event handlers
app.whenReady().then(async () => {
  console.log('App is ready, initializing...');

  // Handle command line arguments first
  handleCommandLineArgs();

  // Ensure content root exists
  await ensureContentRoot();

  // Initialize IPC service after content service is set up
  ipcService = new IPCService(contentService, imageService, githubService);

  // Try to restore GitHub configuration
  await tryRestoreGitHubConfiguration();

  // Create the main window
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  app.quit();
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  app.quit();
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Export for testing if needed
export { contentService, imageService, githubService };
