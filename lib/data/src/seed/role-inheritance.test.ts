import { describe, expect, it } from 'vitest';
import { expandRoleKeys } from './role-inheritance.js';

describe('client portal role inheritance', () => {
  it('expands compliance_manager from client_user', () => {
    const expanded = expandRoleKeys(['compliance_manager']);
    expect(expanded.has('compliance_manager')).toBe(true);
    expect(expanded.has('client_user')).toBe(true);
  });

  it('expands viewer from client_user', () => {
    const expanded = expandRoleKeys(['viewer']);
    expect(expanded.has('viewer')).toBe(true);
    expect(expanded.has('client_user')).toBe(true);
  });
});
