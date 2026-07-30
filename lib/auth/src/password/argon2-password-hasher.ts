import argon2 from 'argon2';
import type { PasswordHasher } from './password-hasher.interface.js';

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
} as const;

export class Argon2PasswordHasher implements PasswordHasher {
  async hash(plainText: string): Promise<string> {
    return argon2.hash(plainText, ARGON2_OPTIONS);
  }

  async verify(plainText: string, encodedHash: string): Promise<boolean> {
    try {
      return await argon2.verify(encodedHash, plainText);
    } catch {
      return false;
    }
  }

  needsRehash(encodedHash: string): boolean {
    return argon2.needsRehash(encodedHash, ARGON2_OPTIONS);
  }
}
