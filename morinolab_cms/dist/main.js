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
exports.githubService = exports.imageService = exports.contentService = void 0;
Promise.resolve().then(() => __importStar(require('dotenv'))).then((dotenv) => dotenv.config());
const electron_1 = require("electron");
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const github_service_1 = require("@/github-service");
const content_service_1 = require("@/services/content-service");
const image_service_1 = require("@/services/image-service");
const ipc_service_1 = require("@/services/ipc-service");
// Root directory that contains the various content folders
let CONTENT_ROOT = node_path_1.default.join(process.cwd(), '../contents');
// Initialize services
const githubService = new github_service_1.GitHubService();
exports.githubService = githubService;
const contentService = new content_service_1.ContentService(CONTENT_ROOT);
exports.contentService = contentService;
const imageService = new image_service_1.ImageService();
exports.imageService = imageService;
let ipcService;
// Update content root based on GitHub repository configuration
async function updateContentRoot() {
    try {
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
                    contentService.setContentRoot(CONTENT_ROOT);
                    console.log(`✅ Using GitHub cloned contents at: ${CONTENT_ROOT}`);
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
    console.log(`📁 Using default contents at: ${CONTENT_ROOT}`);
}
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: node_path_1.default.join(__dirname, 'preload.js'),
            webSecurity: true,
        },
    });
    // Clear cache when creating window
    win.webContents.session.clearCache();
    // Load the HTML file
    const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';
    if (isDev) {
        win.loadFile(node_path_1.default.join(__dirname, 'renderer', 'index.html')).catch((error) => {
            console.error('Failed to load development HTML:', error);
            // Fallback to dist version
            win.loadFile(node_path_1.default.join(__dirname, '..', 'dist', 'renderer', 'index.html'));
        });
        // Open DevTools in development
        win.webContents.openDevTools();
    }
    else {
        win.loadFile(node_path_1.default.join(__dirname, 'renderer', 'index.html')).catch((error) => {
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
            const customContentRoot = node_path_1.default.resolve(args[i + 1]);
            if (node_fs_1.default.existsSync(customContentRoot)) {
                CONTENT_ROOT = customContentRoot;
                contentService.setContentRoot(CONTENT_ROOT);
                console.log(`📁 Using custom contents directory: ${CONTENT_ROOT}`);
            }
            else {
                console.error(`❌ Contents directory not found: ${customContentRoot}`);
            }
            i++; // Skip the next argument as it's the value for --contents
        }
    }
}
async function ensureContentRoot() {
    if (!node_fs_1.default.existsSync(CONTENT_ROOT)) {
        console.log(`Creating content root directory: ${CONTENT_ROOT}`);
        node_fs_1.default.mkdirSync(CONTENT_ROOT, { recursive: true });
    }
}
async function tryRestoreGitHubConfiguration() {
    try {
        await updateContentRoot();
        if (ipcService) {
            ipcService.updateContentRoot(CONTENT_ROOT);
        }
    }
    catch (error) {
        console.error('Failed to restore GitHub configuration:', error);
    }
}
// App event handlers
electron_1.app.whenReady().then(async () => {
    console.log('App is ready, initializing...');
    // Handle command line arguments first
    handleCommandLineArgs();
    // Ensure content root exists
    await ensureContentRoot();
    // Initialize IPC service after content service is set up
    ipcService = new ipc_service_1.IPCService(contentService, imageService, githubService);
    // Try to restore GitHub configuration
    await tryRestoreGitHubConfiguration();
    // Create the main window
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    electron_1.app.quit();
});
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    electron_1.app.quit();
});
// Error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
//# sourceMappingURL=main.js.map