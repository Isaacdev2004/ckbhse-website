import type { OrganizationId, UserId } from '@workspace/domain/shared';

/** Supported OAuth 2.0 grant types for integrations (not primary login). */
export type OAuthGrantType =
  | 'authorization_code'
  | 'client_credentials'
  | 'refresh_token';

/** Token response normalised across OAuth providers. */
export interface OAuthTokenSet {
  readonly accessToken: string;
  readonly refreshToken: string | null;
  readonly expiresAt: Date;
  readonly tokenType: string;
  readonly scope: readonly string[];
}

/** Stored integration credentials for a user or organisation. */
export interface OAuthConnection {
  readonly id: string;
  readonly providerKey: string;
  readonly userId: UserId | null;
  readonly organizationId: OrganizationId;
  readonly scopes: readonly string[];
  readonly connectedAt: Date;
}

/**
 * Generic OAuth 2.0 provider for third-party integrations.
 *
 * Distinct from SSO login providers: this contract covers delegated API access
 * (calendar, document storage) rather than platform authentication.
 */
export interface OAuthProvider {
  readonly providerKey: string;
  readonly grantTypes: readonly OAuthGrantType[];

  buildAuthorisationUrl(input: {
    readonly redirectUri: string;
    readonly state: string;
    readonly scopes: readonly string[];
  }): string;

  exchangeAuthorisationCode(input: {
    readonly code: string;
    readonly redirectUri: string;
  }): Promise<OAuthTokenSet>;

  refresh(refreshToken: string): Promise<OAuthTokenSet>;

  revoke(connection: OAuthConnection): Promise<void>;
}
