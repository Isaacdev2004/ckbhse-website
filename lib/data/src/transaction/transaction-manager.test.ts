import { describe, expect, it, vi } from 'vitest';
import { runInTransaction } from './transaction-manager.js';

describe('runInTransaction', () => {
  it('delegates to the database transaction helper', async () => {
    const tx = { kind: 'tx' };
    const transaction = vi.fn(
      async (callback: (innerTx: typeof tx) => Promise<string>) =>
        callback(tx),
    );

    const db = { transaction } as never;

    const result = await runInTransaction(async (innerTx) => {
      expect(innerTx).toBe(tx);
      return 'committed';
    }, db);

    expect(result).toBe('committed');
    expect(transaction).toHaveBeenCalledOnce();
  });
});
