import type { IGitRepository, CloneProgress } from '@domain/ports/IGitRepository';
import type { RepositoryInfo } from '@domain/models/RepositoryInfo';
import { GitHubService } from '../github-service';

export class GitRepository implements IGitRepository {
  constructor(private readonly service: GitHubService) {}

  async authenticate(token: string): Promise<boolean> {
    return this.service.authenticate(token);
  }

  setRepository(info: RepositoryInfo, token: string): void {
    this.service.setRepositoryConfig(info.owner, info.name, info.localPath, token);
  }

  async clone(onProgress?: (p: CloneProgress) => void): Promise<boolean> {
    return this.service.cloneRepositoryWithProgress((msg, percent) =>
      onProgress?.({ message: msg, percent }),
    );
  }

  pull(): Promise<{ success: boolean; error?: string }> {
    return this.service.pullLatest();
  }

  commitAndPush(
    message: string,
    onProgress?: (p: CloneProgress) => void,
  ): Promise<{ success: boolean; error?: string }> {
    return this.service.commitAndPush(message, (msg, percent) =>
      onProgress?.({ message: msg, percent }),
    );
  }

  async getInfo(): Promise<RepositoryInfo | null> {
    const data = await this.service.getRepositoryInfo();
    if (!data) return null;
    const cfg = this.service.getConfig();
    return {
      owner: data.full_name.split('/')[0],
      name: data.name,
      localPath: cfg?.localPath ?? '',
    };
  }
}
