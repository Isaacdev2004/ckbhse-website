import type { EntityId, OrganizationId, Timestamps, Versioned } from '../shared/types.js';

export type OrganizationStatus = 'prospect' | 'active' | 'dormant' | 'archived';

export type OrganizationType = 'platform_operator' | 'client';

export interface Organization extends Timestamps, Versioned {
  readonly id: OrganizationId;
  readonly name: string;
  readonly slug: string;
  readonly status: OrganizationStatus;
  readonly type: OrganizationType;
  readonly deletedAt: Date | null;
}

export type UserStatus =
  | 'invited'
  | 'active'
  | 'suspended'
  | 'deactivated';

export interface User extends Timestamps, Versioned {
  readonly id: EntityId;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly status: UserStatus;
  readonly deletedAt: Date | null;
}

export interface Role extends Timestamps {
  readonly id: EntityId;
  readonly key: string;
  readonly name: string;
  readonly description: string | null;
  readonly isSystem: boolean;
}

export interface Permission extends Timestamps {
  readonly id: EntityId;
  readonly key: string;
  readonly name: string;
  readonly description: string | null;
  readonly domain: string;
}

export interface PermissionGroup extends Timestamps {
  readonly id: EntityId;
  readonly key: string;
  readonly name: string;
  readonly description: string | null;
}
