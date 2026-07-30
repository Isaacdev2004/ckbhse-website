import {
  SystemSettingsRepository,
  type SetSystemSettingInput,
} from '@workspace/data/repositories/system-settings';

/** Known system setting keys with typed values. */
export interface SystemSettingCatalog {
  readonly 'platform.name': string;
  readonly 'platform.support_email': string;
  readonly 'auth.session.absolute_ttl_hours': number;
  readonly 'auth.session.idle_ttl_hours': number;
  readonly 'auth.mfa.required_for_staff': boolean;
  readonly 'maintenance.enabled': boolean;
  readonly 'maintenance.message': string | null;
}

export type SystemSettingKey = keyof SystemSettingCatalog;
export type SystemSettingValue<K extends SystemSettingKey> =
  SystemSettingCatalog[K];

/**
 * Typed facade over {@link SystemSettingsRepository}.
 *
 * Callers receive compile-time key checking while persistence remains a generic
 * JSON document in the data layer.
 */
export class SystemSettingsService {
  constructor(private readonly repository: SystemSettingsRepository) {}

  async get<K extends SystemSettingKey>(
    key: K,
  ): Promise<SystemSettingValue<K> | null> {
    return this.repository.get<SystemSettingValue<K>>(key);
  }

  async set<K extends SystemSettingKey>(
    key: K,
    value: SystemSettingValue<K>,
    options: Omit<SetSystemSettingInput, 'value'> = {},
  ): Promise<void> {
    await this.repository.set(key, { value, ...options });
  }

  async delete(key: SystemSettingKey): Promise<boolean> {
    return this.repository.delete(key);
  }
}
