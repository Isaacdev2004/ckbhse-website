export { Argon2PasswordHasher } from './password/argon2-password-hasher.js';
export {
  DefaultPasswordPolicyEvaluator,
  DEFAULT_PASSWORD_POLICY,
} from './password/default-password-policy.js';
export { DrizzleSessionStore } from './session/drizzle-session-store.js';
export {
  hashSessionToken,
  generateSessionToken,
  SESSION_ABSOLUTE_MS,
  SESSION_REMEMBER_ABSOLUTE_MS,
  SESSION_IDLE_MS,
  SESSION_REMEMBER_IDLE_MS,
} from './session/drizzle-session-store.js';
export {
  ExpressSessionCookieManager,
  DEFAULT_SESSION_COOKIE_NAME,
  isSessionIdFormat,
} from './cookies/express-session-cookie-manager.js';
export { DatabasePermissionResolver } from './permissions/database-permission-resolver.js';
export { DatabaseRoleResolver } from './roles/database-role-resolver.js';

export type {
  Session,
  SessionStatus,
  CreateSessionInput,
  RenewSessionInput,
} from './session/session.interface.js';
export { isSessionStatus } from './session/session.interface.js';

export type { SessionStore } from './session/session-store.interface.js';

export type {
  JwtAudience,
  JwtClaims,
  IssueJwtInput,
  JwtVerificationResult,
  JwtVerificationFailure,
  JwtService,
} from './jwt/jwt.interface.js';
export { isJwtVerificationSuccess } from './jwt/jwt.interface.js';

export type { PasswordHasher } from './password/password-hasher.interface.js';

export type {
  PasswordPolicy,
  PasswordPolicyResult,
  PasswordPolicyViolation,
  PasswordPolicyViolationCode,
  PasswordPolicyEvaluator,
  PasswordEvaluationContext,
} from './password/password-policy.interface.js';
export { isPasswordPolicyValid } from './password/password-policy.interface.js';

export type {
  MfaMethod,
  MfaEnrolment,
  TotpEnrolmentChallenge,
  MfaVerificationChallenge,
  MfaVerificationInput,
  MfaProvider,
} from './mfa/mfa-provider.interface.js';

export type {
  RoleScopeType,
  ResolvedRoleAssignment,
  RoleResolver,
} from './roles/role-resolver.interface.js';

export type {
  ResolvedPermissions,
  PermissionResolver,
} from './permissions/permission-resolver.interface.js';

export type {
  AuthMiddlewareRequest,
  AuthMiddlewareResponse,
  AuthMiddlewareNext,
  AuthMiddleware,
} from './middleware/auth-middleware.contract.js';
export {
  AUTH_CONTEXT_REQUEST_KEY,
  getAuthContextFromRequest,
} from './middleware/auth-middleware.contract.js';

export type { CurrentUserProvider } from './current-user/current-user-provider.interface.js';

export type {
  SessionCookieOptions,
  SessionCookieValue,
  SessionCookieManager,
} from './cookies/session-cookie.interface.js';

export type {
  OidcAuthResult,
  OidcAuthorisationRequest,
  OidcCallbackParams,
  OidcProvider,
} from './sso/oidc-provider.interface.js';

export type {
  SamlAuthResult,
  SamlAuthorisationRequest,
  SamlCallbackParams,
  SamlProvider,
} from './sso/saml-provider.interface.js';

export type {
  EntraIdProviderConfig,
  EntraIdProvider,
} from './sso/entra-id-provider.interface.js';
export { isEntraIdProvider } from './sso/entra-id-provider.interface.js';

export type {
  GoogleWorkspaceProviderConfig,
  GoogleWorkspaceProvider,
} from './sso/google-workspace-provider.interface.js';
export { isGoogleWorkspaceProvider } from './sso/google-workspace-provider.interface.js';

export type {
  OAuthGrantType,
  OAuthTokenSet,
  OAuthConnection,
  OAuthProvider,
} from './oauth/oauth-provider.interface.js';
