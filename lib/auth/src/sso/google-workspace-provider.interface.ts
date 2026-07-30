import type { OidcProvider } from './oidc-provider.interface.js';

/** Google Workspace OIDC configuration. */
export interface GoogleWorkspaceProviderConfig {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly hostedDomain?: string;
}

/**
 * Google Workspace adapter marker interface.
 *
 * When `hostedDomain` is set, the adapter rejects tokens whose `hd` claim does
 * not match, preventing consumer Google accounts from entering a Workspace-only
 * tenant.
 */
export interface GoogleWorkspaceProvider extends OidcProvider {
  readonly providerKey: 'google-workspace';
  readonly config: GoogleWorkspaceProviderConfig;
}

/** Narrow an OIDC provider to Google Workspace when the key matches. */
export function isGoogleWorkspaceProvider(
  provider: OidcProvider,
): provider is GoogleWorkspaceProvider {
  return provider.providerKey === 'google-workspace';
}
