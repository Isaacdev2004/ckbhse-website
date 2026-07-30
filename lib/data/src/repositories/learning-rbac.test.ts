import { describe, expect, it } from 'vitest';
import {
  PERMISSIONS,
  ALL_PERMISSIONS,
} from '@workspace/platform/permissions';
import { ROLE_PERMISSION_SEED } from '../seed/permissions-seed.js';

function permissionsForRole(roleKey: string) {
  return ROLE_PERMISSION_SEED.filter((row) => row.roleKey === roleKey).map(
    (row) => row.permissionKey,
  );
}

describe('learning RBAC seed', () => {
  it('includes learning access for learners', () => {
    const learner = permissionsForRole('learner');
    expect(learner).toContain(PERMISSIONS.LEARNING_ACCESS);
    expect(learner).toContain(PERMISSIONS.COURSE_READ);
    expect(learner).toContain(PERMISSIONS.CERTIFICATE_READ);
  });

  it('includes enrolment manage for training managers', () => {
    const trainingManager = permissionsForRole('training_manager');
    expect(trainingManager).toContain(PERMISSIONS.ENROLMENT_MANAGE);
  });

  it('includes assessment mark for trainers', () => {
    const trainer = permissionsForRole('trainer');
    expect(trainer).toContain(PERMISSIONS.ASSESSMENT_MARK);
    expect(trainer).toContain(PERMISSIONS.COURSE_READ);
  });

  it('registers all learning permissions in catalogue', () => {
    expect(ALL_PERMISSIONS).toContain(PERMISSIONS.LEARNING_ACCESS);
    expect(ALL_PERMISSIONS).toContain(PERMISSIONS.ENROLMENT_MANAGE);
    expect(ALL_PERMISSIONS).toContain(PERMISSIONS.COURSE_READ);
    expect(ALL_PERMISSIONS).toContain(PERMISSIONS.CERTIFICATE_ISSUE);
  });
});
