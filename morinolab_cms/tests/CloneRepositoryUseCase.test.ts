import { CloneRepositoryUseCase } from '../src/application/usecases/CloneRepository';
import type { IGitRepository, CloneProgress } from '../src/domain/ports/IGitRepository';

describe('CloneRepositoryUseCase', () => {
  it('returns success true when repository clone succeeds', async () => {
    const mockRepo: IGitRepository = {
      authenticate: jest.fn(),
      setRepository: jest.fn(),
      clone: jest.fn().mockResolvedValue(true),
      pull: jest.fn(),
      commitAndPush: jest.fn(),
      getInfo: jest.fn(),
    } as unknown as IGitRepository;

    const uc = new CloneRepositoryUseCase(mockRepo);
    const res = await uc.execute();
    expect(res.success).toBe(true);
    expect(mockRepo.clone).toHaveBeenCalled();
  });

  it('propagates failure when clone fails', async () => {
    const mockRepo: IGitRepository = {
      authenticate: jest.fn(),
      setRepository: jest.fn(),
      clone: jest.fn().mockResolvedValue(false),
      pull: jest.fn(),
      commitAndPush: jest.fn(),
      getInfo: jest.fn(),
    } as unknown as IGitRepository;

    const uc = new CloneRepositoryUseCase(mockRepo);
    const res = await uc.execute();
    expect(res.success).toBe(false);
  });
}); 