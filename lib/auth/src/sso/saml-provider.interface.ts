import type { OrganizationId, UserId } from '@workspace/domain/shared';

/** Parsed SAML assertion attributes normalised for provisioning. */
export interface SamlAuthResult {
  readonly nameId: string;
  readonly sessionIndex: string | null;
  readonly email: string;
  readonly givenName: string | null;
  readonly familyName: string | null;
  readonly organizationId: OrganizationId | null;
  readonly attributes: Readonly<Record<string, readonly string[]>>;
}

/** Input for generating a SAML authentication request redirect. */
export interface SamlAuthorisationRequest {
  readonly relayState: string;
  readonly forceAuthn?: boolean;
}

/** Raw SAML response posted to the assertion consumer service endpoint. */
export interface SamlCallbackParams {
  readonly samlResponse: string;
  readonly relayState: string;
}

/**
 * SAML 2.0 identity provider contract.
 *
 * Enterprise customers often require SAML rather than OIDC. The interface mirrors
 * {@link OidcProvider} so login orchestration can treat SSO backends uniformly.
 */
export interface SamlProvider {
  readonly providerKey: string;

  buildAuthorisationRedirect(request: SamlAuthorisationRequest): Promise<string>;

  validateResponse(params: SamlCallbackParams): Promise<SamlAuthResult>;

  linkOrProvisionUser(
    result: SamlAuthResult,
    organizationId: OrganizationId,
  ): Promise<UserId>;
}
