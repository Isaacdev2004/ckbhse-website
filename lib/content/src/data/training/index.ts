import { healthSafetyCourses } from './health-safety.js';
import { environmentalCourses } from './environmental.js';
import { occupationalHealthCourses } from './occupational-health.js';
import { isoManagementCourses } from './iso-management.js';
import { complianceGovernanceCourses } from './compliance-governance.js';
import { leadershipCultureCourses } from './leadership-culture.js';
import type { CoursePageContent } from '../../schemas/training.js';
import { buildTrainingPath } from '../../schemas/training.js';

export const trainingPageRegistry: CoursePageContent[] = [
  ...healthSafetyCourses,
  ...environmentalCourses,
  ...occupationalHealthCourses,
  ...isoManagementCourses,
  ...complianceGovernanceCourses,
  ...leadershipCultureCourses,
];

export const trainingPaths = trainingPageRegistry.map((page) => page.path);

export { buildTrainingPath };
