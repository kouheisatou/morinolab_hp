import type { IGitRepository } from '@domain/ports/IGitRepository';

export class CommitAndPushUseCase {
  constructor(private readonly gitRepo: IGitRepository) {}

  async execute(message: string, onProgress?: (msg: string, percent: number) => void) {
    return this.gitRepo.commitAndPush(message, (p) => onProgress?.(p.message, p.percent));
  }
}
