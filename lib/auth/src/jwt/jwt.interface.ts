import type { OrganizationId, UserId } from '@workspace/domain/shared';

/**
 * Supported JWT use cases.
 *
 * Browser sessions use HttpOnly cookies and server-side session rows. JWTs are
 * reserved for non-browser clients (mobile apps, machine-to-machine) where cookie
 * sessions are inappropriate.
 */
export type JwtAudience = 'mobile' | 'api' | 'service';

/** Claims embedded in an access token issued by {@link JwtService}. */
export interface JwtClaims {
  readonly sub: UserId;
  readonly organizationId: OrganizationId;
  readonly sessionId?: string;
  readonly aud: JwtAudience;
  readonly iat: number;
  readonly exp: number;
}

/** Input for minting a signed access token. */
export interface IssueJwtInput {
  readonly userId: UserId;
  readonly organizationId: OrganizationId;
  readonly audience: JwtAudience;
  readonly sessionId?: string;
  readonly ttlSeconds?: number;
}

/** Result of verifying a bearer token. */
export interface JwtVerificationResult {
  readonly valid: true;
  readonly claims: JwtClaims;
}

export interface JwtVerificationFailure {
  readonly valid: false;
  readonly reason: 'expired' | 'invalid_signature' | 'malformed' | 'wrong_audience';
}

/**
 * Signs and verifies JSON Web Tokens for non-browser API clients.
 *
 * Implementations must use asymmetric signing in production so verifying nodes
 * never hold the private key.
 */
export interface JwtService {
  issue(input: IssueJwtInput): Promise<string>;
  verify(
    token: string,
    expectedAudience: JwtAudience,
  ): Promise<JwtVerificationResult | JwtVerificationFailure>;
}

/** Narrow a verification result to a successful decode. */
export function isJwtVerificationSuccess(
  result: JwtVerificationResult | JwtVerificationFailure,
): result is JwtVerificationResult {
  return result.valid === true;
}
