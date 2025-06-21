import { PullLatestUseCase } from '../src/application/usecases/PullLatest';
import type { IGitRepository } from '../src/domain/ports/IGitRepository';

describe('PullLatestUseCase', () => {
  it('delegates to repo.pull', async () => {
    const mockRepo: IGitRepository = {
      authenticate: jest.fn(),
      setRepository: jest.fn(),
      clone: jest.fn(),
      pull: jest.fn().mockResolvedValue({ success: true }),
      commitAndPush: jest.fn(),
      getInfo: jest.fn(),
    } as unknown as IGitRepository;

    const uc = new PullLatestUseCase(mockRepo);
    const res = await uc.execute();
    expect(mockRepo.pull).toHaveBeenCalled();
    expect(res.success).toBe(true);
  });
}); 