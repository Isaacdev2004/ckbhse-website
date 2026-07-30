import { describe, expect, it } from 'vitest';
import { Argon2PasswordHasher } from './argon2-password-hasher.js';

describe('Argon2PasswordHasher', () => {
  const hasher = new Argon2PasswordHasher();

  it('hashes and verifies passwords', async () => {
    const hash = await hasher.hash('StaffDev123!');
    expect(await hasher.verify('StaffDev123!', hash)).toBe(true);
    expect(await hasher.verify('wrong-password', hash)).toBe(false);
  });
});
