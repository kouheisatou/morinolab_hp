import { ipcMain, dialog } from 'electron';
import { ContentService } from '@/services/content-service';
import { ImageService } from '@/services/image-service';
import { GitHubService } from '@/github-service';
import {
  getGitHubOAuthConfig,
  validateGitHubConfig,
  saveGitHubOAuthConfig,
  isGitHubConfigured,
  showGitHubSetupGuide,
} from '@/github-config';
import path from 'node:path';

type Handler = Parameters<typeof ipcMain.handle>[1];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wrap: (fn: (...args: any[]) => any) => Handler =
  (fn) =>
  (_event, ...args) =>
    Promise.resolve(fn(...args)).catch((error) => {
      console.error('IPC handler error:', error);
      throw error;
    });

export class IPCService {
  private contentService: ContentService;
  private imageService: ImageService;
  private githubService: GitHubService;

  constructor(
    contentService: ContentService,
    imageService: ImageService,
    githubService: GitHubService,
  ) {
    this.contentService = contentService;
    this.imageService = imageService;
    this.githubService = githubService;
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Content management handlers
    ipcMain.handle(
      'get-content-types',
      wrap(() => this.contentService.listContentTypes()),
    );
    ipcMain.handle(
      'get-items',
      wrap((type: string) => this.contentService.listItems(type)),
    );
    ipcMain.handle(
      'create-item',
      wrap((type: string) => this.contentService.createItem(type)),
    );
    ipcMain.handle(
      'delete-item',
      wrap((type: string, id: string) => this.contentService.deleteItem(type, id)),
    );
    ipcMain.handle(
      'load-content',
      wrap((type: string, id: string) => this.contentService.loadContent(type, id)),
    );
    ipcMain.on('save-content', (_event, type: string, id: string, content: string) => {
      this.contentService.saveContent(type, id, content);
    });

    // Table data handlers
    ipcMain.handle(
      'get-table-data',
      wrap((type: string) => this.contentService.getTableData(type)),
    );
    ipcMain.handle(
      'update-cell',
      wrap((type: string, id: string, column: string, value: string) =>
        this.contentService.updateCell(type, id, column, value),
      ),
    );

    // Image handlers
    ipcMain.handle(
      'save-image',
      wrap(async (type: string, id: string, sourcePath: string, fileName: string) =>
        this.imageService.saveImage(
          type,
          id,
          sourcePath,
          fileName,
          this.contentService.getContentRoot(),
        ),
      ),
    );

    ipcMain.handle(
      'select-thumbnail',
      wrap(async (type: string, id: string) => {
        const result = await dialog.showOpenDialog({
          title: 'サムネイル画像を選択',
          filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] }],
          properties: ['openFile'],
        });

        if (result.canceled || result.filePaths.length === 0) {
          return null;
        }

        const sourcePath = result.filePaths[0];
        const fileName = `thumb_${Date.now()}${path.extname(sourcePath)}`;

        return this.imageService.saveImage(
          type,
          id,
          sourcePath,
          fileName,
          this.contentService.getContentRoot(),
        );
      }),
    );

    // Path resolution handlers
    ipcMain.handle(
      'resolve-path',
      wrap((type: string, rel: string) => this.contentService.resolvePath(type, rel)),
    );

    ipcMain.handle(
      'get-font-url',
      wrap(() => {
        const fontPath = path.join(__dirname, '..', '..', 'Sango-JA-CPAL.ttf');
        return `file://${fontPath}`;
      }),
    );

    // GitHub handlers
    this.setupGitHubHandlers();
  }

  private setupGitHubHandlers(): void {
    ipcMain.handle(
      'github-authenticate',
      wrap(async (token: string) => {
        const success = await this.githubService.authenticate(token);
        return { success, error: success ? null : 'Authentication failed' };
      }),
    );

    ipcMain.handle(
      'github-set-repository',
      wrap(async (owner: string, repo: string, localPath: string, token: string) => {
        try {
          this.githubService.setRepositoryConfig(owner, repo, localPath, token);
          return { success: true, error: null };
        } catch (error) {
          return { success: false, error: (error as Error).message };
        }
      }),
    );

    ipcMain.handle(
      'github-clone-repository',
      wrap(async () => {
        try {
          const success = await this.githubService.cloneRepository();
          return { success, error: success ? null : 'Clone failed' };
        } catch (error) {
          return { success: false, error: (error as Error).message };
        }
      }),
    );

    ipcMain.handle(
      'github-commit-push',
      wrap(async (message: string) => {
        try {
          const success = await this.githubService.commitAndPush(message);
          return { success, error: success ? null : 'Commit/Push failed' };
        } catch (error) {
          return { success: false, error: (error as Error).message };
        }
      }),
    );

    ipcMain.handle(
      'github-get-status',
      wrap(async () => {
        try {
          const data = await this.githubService.getRepositoryStatus();
          return { success: true, error: null, data };
        } catch (error) {
          return { success: false, error: (error as Error).message, data: null };
        }
      }),
    );

    ipcMain.handle(
      'github-pull-latest',
      wrap(async () => {
        try {
          const success = await this.githubService.pullLatest();
          return { success, error: success ? null : 'Pull failed' };
        } catch (error) {
          return { success: false, error: (error as Error).message };
        }
      }),
    );

    ipcMain.handle(
      'github-get-info',
      wrap(async () => {
        try {
          const data = await this.githubService.getRepositoryInfo();
          return { success: true, error: null, data };
        } catch (error) {
          return { success: false, error: (error as Error).message, data: null };
        }
      }),
    );

    ipcMain.handle(
      'github-is-authenticated',
      wrap(() => this.githubService.isAuthenticated()),
    );
    ipcMain.handle(
      'github-is-configured',
      wrap(() => this.githubService.isConfigured()),
    );
    ipcMain.handle(
      'github-get-config',
      wrap(() => this.githubService.getConfig()),
    );

    // OAuth handlers
    ipcMain.handle(
      'github-oauth-authenticate',
      wrap(async () => {
        try {
          const config = await getGitHubOAuthConfig();
          if (!config || !validateGitHubConfig(config)) {
            return { success: false, error: 'GitHub OAuth configuration not found' };
          }

          return await this.githubService.authenticateWithOAuth(
            config.clientId,
            config.clientSecret,
          );
        } catch (error) {
          return { success: false, error: (error as Error).message };
        }
      }),
    );

    ipcMain.handle(
      'github-get-user-repositories',
      wrap(async () => {
        try {
          const data = await this.githubService.getUserRepositories();
          return { success: true, data, error: null };
        } catch (error) {
          return { success: false, data: [], error: (error as Error).message };
        }
      }),
    );

    ipcMain.handle(
      'github-clone-with-progress',
      wrap(async () => {
        try {
          const success = await this.githubService.cloneRepositoryWithProgress();
          return { success, error: success ? null : 'Clone with progress failed' };
        } catch (error) {
          return { success: false, error: (error as Error).message };
        }
      }),
    );

    // OAuth config management
    ipcMain.handle(
      'github-save-oauth-config',
      wrap(async (clientId: string, clientSecret: string) => {
        try {
          await saveGitHubOAuthConfig(clientId, clientSecret);
          return { success: true, error: null };
        } catch (error) {
          return { success: false, error: (error as Error).message };
        }
      }),
    );

    ipcMain.handle(
      'github-check-config-status',
      wrap(async () => {
        try {
          const configured = await isGitHubConfigured();
          return {
            success: true,
            configured,
            setupGuide: configured ? undefined : showGitHubSetupGuide(),
          };
        } catch (error) {
          return { success: false, configured: false, error: (error as Error).message };
        }
      }),
    );

    ipcMain.handle(
      'github-get-oauth-config',
      wrap(async () => {
        try {
          const config = await getGitHubOAuthConfig();
          if (!config) {
            return { success: true, data: null };
          }
          return {
            success: true,
            data: {
              clientId: config.clientId,
              hasClientSecret: !!config.clientSecret,
            },
          };
        } catch (error) {
          return { success: false, data: null, error: (error as Error).message };
        }
      }),
    );

    ipcMain.handle(
      'github-restore-config',
      wrap(
        async (configData: { owner: string; repo: string; localPath: string; token: string }) => {
          try {
            const { owner, repo, localPath, token } = configData;
            await this.githubService.authenticate(token);
            this.githubService.setRepositoryConfig(owner, repo, localPath, token);
            return { success: true, error: null };
          } catch (error) {
            return { success: false, error: (error as Error).message };
          }
        },
      ),
    );
  }

  updateContentRoot(newRoot: string): void {
    this.contentService.setContentRoot(newRoot);
  }
}
