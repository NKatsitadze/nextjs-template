import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/auth/repository/user', () => ({ userRepository: { ensureIndexes: vi.fn() } }));
vi.mock('@/features/notes/repository/note', () => ({ noteRepository: { ensureIndexes: vi.fn() } }));
vi.mock('@/shared/lib/sentry', () => ({ sendServerErrorToSentry: vi.fn() }));

import { userRepository } from '@/features/auth/repository/user';
import { noteRepository } from '@/features/notes/repository/note';
import { sendServerErrorToSentry } from '@/shared/lib/sentry';

import { ensureDatabaseIndexes } from './database-indexes.service';

describe('ensureDatabaseIndexes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('ensures every repository\'s indexes', async () => {
    await ensureDatabaseIndexes();

    expect(userRepository.ensureIndexes).toHaveBeenCalled();
    expect(noteRepository.ensureIndexes).toHaveBeenCalled();
    expect(sendServerErrorToSentry).not.toHaveBeenCalled();
  });

  it('reports a failure without throwing, so the server still boots', async () => {
    const error = new Error('mongo down');
    vi.mocked(userRepository.ensureIndexes).mockRejectedValue(error);

    await expect(ensureDatabaseIndexes()).resolves.toBeUndefined();
    expect(sendServerErrorToSentry).toHaveBeenCalledWith(error, { source: 'database-indexes' });
  });
});
