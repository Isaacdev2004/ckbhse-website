import type { ServicePageContent } from '../../schemas/services.js';
import { healthSafetyServices } from './health-safety.js';
import { environmentalServices } from './environmental.js';
import { occupationalHealthServices } from './occupational-health.js';
import { isoManagementServices } from './iso-management.js';
import { complianceRegulatoryServices } from './compliance-regulatory.js';
import { businessRiskServices } from './business-risk.js';

/** Ordered registry of all service detail pages — single source for routes and CMS migration. */
export const servicePageRegistry: ServicePageContent[] = [
  ...healthSafetyServices,
  ...environmentalServices,
  ...occupationalHealthServices,
  ...isoManagementServices,
  ...complianceRegulatoryServices,
  ...businessRiskServices,
];

export const servicePaths = servicePageRegistry.map((page) => page.path);
