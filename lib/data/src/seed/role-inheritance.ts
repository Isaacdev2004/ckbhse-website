/**
 * Role inheritance graph for permission resolution.
 *
 * Child roles inherit all permissions assigned to ancestor roles within the
 * same organisation scope. Deny overrides are applied after expansion.
 */
export const ROLE_INHERITANCE: Readonly<Record<string, readonly string[]>> =
  Object.freeze({
    super_admin: ['platform_admin'],
    platform_admin: ['organization_admin'],
    organization_admin: ['manager', 'operations_manager'],
    manager: ['consultant'],
    operations_manager: ['consultant'],
    trainer: ['consultant'],
    auditor: ['read_only'],
    staff: ['consultant'],
    finance: ['read_only'],
    consultant: [],
    client_user: [],
    learner: [],
    compliance_manager: ['client_user'],
    training_manager: ['client_user'],
    hr_manager: ['client_user'],
    viewer: ['client_user'],
    external_contractor: ['viewer'],
    department_manager: ['client_user'],
    site_manager: ['client_user'],
    read_only: [],
  });

/** Expand a set of role keys to include all inherited ancestors. */
export function expandRoleKeys(roleKeys: Iterable<string>): Set<string> {
  const expanded = new Set<string>();

  const visit = (key: string) => {
    if (expanded.has(key)) {
      return;
    }
    expanded.add(key);
    const parents = ROLE_INHERITANCE[key];
    if (parents !== undefined) {
      for (const parent of parents) {
        visit(parent);
      }
    }
  };

  for (const key of roleKeys) {
    visit(key);
  }

  return expanded;
}
