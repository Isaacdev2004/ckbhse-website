import type { User } from '@workspace/domain/auth';
import type { AuthorizationContext } from '@workspace/platform/authorization';

/**
 * Supplies the authenticated user profile for the current request.
 *
 * Separated from session resolution so handlers can load display fields without
 * re-querying identity tables when the session row already established trust.
 */
export interface CurrentUserProvider {
  /** Returns the acting user, or `null` for anonymous requests. */
  getCurrentUser(context: AuthorizationContext): Promise<User | null>;

  /** Returns the acting user or throws when the caller is not authenticated. */
  requireCurrentUser(context: AuthorizationContext): Promise<User>;
}
