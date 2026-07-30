import { getDb, type Database } from '@workspace/db';

export type TransactionClient = Parameters<
  Parameters<Database['transaction']>[0]
>[0];

export type DbExecutor = Database | TransactionClient;

/**
 * Run a callback inside a Drizzle transaction.
 *
 * Pass an explicit database handle in tests to avoid touching `getDb()`.
 */
export async function runInTransaction<T>(
  fn: (tx: TransactionClient) => Promise<T>,
  db: Database = getDb(),
): Promise<T> {
  return db.transaction(fn);
}

/**
 * Executes callbacks inside a single database transaction.
 *
 * Services depend on this wrapper rather than calling `runInTransaction`
 * directly so tests can substitute an in-memory executor.
 */
export class TransactionManager {
  constructor(private readonly db: Database = getDb()) {}

  run<T>(fn: (tx: TransactionClient) => Promise<T>): Promise<T> {
    return runInTransaction(fn, this.db);
  }
}
