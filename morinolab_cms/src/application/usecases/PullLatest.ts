import type { IGitRepository } from '@domain/ports/IGitRepository';

export class PullLatestUseCase {
  constructor(private readonly gitRepo: IGitRepository) {}

  async execute() {
    return this.gitRepo.pull();
  }
}
