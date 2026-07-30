import type { OrganizationId, UserId } from '@workspace/domain/shared';

/** Result of a successful OIDC authorization callback. */
export interface OidcAuthResult {
  readonly externalSubject: string;
  readonly email: string;
  readonly emailVerified: boolean;
  readonly givenName: string | null;
  readonly familyName: string | null;
  readonly organizationId: OrganizationId | null;
}

/** Parameters required to start an OIDC authorisation redirect. */
export interface OidcAuthorisationRequest {
  readonly redirectUri: string;
  readonly state: string;
  readonly nonce: string;
  readonly loginHint?: string;
}

/** Parameters received on the OIDC callback route. */
export interface OidcCallbackParams {
  readonly code: string;
  readonly state: string;
}

/**
 * OpenID Connect identity provider contract.
 *
 * Links external identities to existing platform `User` rows. Just-in-time
 * provisioning is opt-in per organisation policy.
 */
export interface OidcProvider {
  readonly providerKey: string;

  buildAuthorisationUrl(request: OidcAuthorisationRequest): string;

  exchangeCode(params: OidcCallbackParams): Promise<OidcAuthResult>;

  /** Resolve or create the platform user for an OIDC subject. */
  linkOrProvisionUser(
    result: OidcAuthResult,
    organizationId: OrganizationId,
  ): Promise<UserId>;
}
