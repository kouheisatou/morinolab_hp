import { CommitAndPushUseCase } from '../src/application/usecases/CommitAndPush';
import type { IGitRepository } from '../src/domain/ports/IGitRepository';

describe('CommitAndPushUseCase', () => {
  it('calls commitAndPush on repo with message', async () => {
    const mockRepo: IGitRepository = {
      authenticate: jest.fn(),
      setRepository: jest.fn(),
      clone: jest.fn(),
      pull: jest.fn(),
      commitAndPush: jest.fn().mockResolvedValue({ success: true }),
      getInfo: jest.fn(),
    } as unknown as IGitRepository;

    const uc = new CommitAndPushUseCase(mockRepo);
    const res = await uc.execute('msg');
    expect(mockRepo.commitAndPush).toHaveBeenCalledWith('msg', expect.any(Function));
    expect(res.success).toBe(true);
  });
}); 