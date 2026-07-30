import type { OidcProvider } from './oidc-provider.interface.js';

/** Microsoft Entra ID (Azure AD) tenant configuration. */
export interface EntraIdProviderConfig {
  readonly tenantId: string;
  readonly clientId: string;
  readonly clientSecret: string;
  readonly allowedDomains?: readonly string[];
}

/**
 * Microsoft Entra ID adapter marker interface.
 *
 * Extends {@link OidcProvider} with Entra-specific configuration. Concrete
 * adapters live outside this package; this interface documents the expected
 * integration surface for enterprise SSO.
 */
export interface EntraIdProvider extends OidcProvider {
  readonly providerKey: 'entra-id';
  readonly config: EntraIdProviderConfig;
}

/** Narrow an OIDC provider to Entra ID when the key matches. */
export function isEntraIdProvider(
  provider: OidcProvider,
): provider is EntraIdProvider {
  return provider.providerKey === 'entra-id';
}
