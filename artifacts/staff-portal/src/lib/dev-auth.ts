import { setDevAuthHeaders } from '@workspace/api-client-react';

export const DEV_USER_ID =
  import.meta.env.VITE_DEV_USER_ID ?? '00000000-0000-4000-8000-000000000010';
export const DEV_ORG_ID =
  import.meta.env.VITE_DEV_ORG_ID ?? '00000000-0000-4000-8000-000000000001';

/** Attach development identity headers consumed by api-server dev auth. */
export function configureDevAuth(): void {
  setDevAuthHeaders({
    'x-dev-user-id': DEV_USER_ID,
    'x-dev-organization-id': DEV_ORG_ID,
    'x-dev-role': 'consultant',
  });
}
