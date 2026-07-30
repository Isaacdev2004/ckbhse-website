/**
 * Contract for password hashing and constant-time verification.
 *
 * Stored credentials must never be reversible. Implementations should prefer
 * Argon2id; bcrypt is acceptable when Argon2 is unavailable, provided cost
 * factors meet current OWASP guidance.
 */
export interface PasswordHasher {
  /** Returns an encoded hash string suitable for persistence. */
  hash(plainText: string): Promise<string>;

  /**
   * Compare a candidate password against a stored hash.
   *
   * Must run in constant time to resist timing side channels.
   */
  verify(plainText: string, encodedHash: string): Promise<boolean>;

  /** Whether an existing hash should be re-encoded after a policy upgrade. */
  needsRehash(encodedHash: string): boolean;
}
