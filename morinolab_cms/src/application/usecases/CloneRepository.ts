import type { IGitRepository } from '@domain/ports/IGitRepository';

type ProgressHandler = (message: string, percent: number) => void;

export class CloneRepositoryUseCase {
  constructor(private readonly gitRepo: IGitRepository) {}

  async execute(onProgress?: ProgressHandler): Promise<{ success: boolean; error?: string }> {
    const ok = await this.gitRepo.clone((p) => onProgress?.(p.message, p.percent));
    return ok ? { success: true } : { success: false, error: 'Clone failed' };
  }
}
