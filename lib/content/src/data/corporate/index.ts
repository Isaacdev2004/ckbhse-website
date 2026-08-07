import type { CorporatePageContent } from '../../schemas/corporate.js';
import { aboutPageData } from './about.js';
import { missionPageData } from './mission.js';
import { visionPageData } from './vision.js';
import { valuesPageData } from './values.js';
import { leadershipPageData } from './leadership.js';
import { whyChooseUsPageData } from './why-choose-us.js';
import { governancePageData } from './governance.js';
import { sustainabilityPageData } from './sustainability.js';
import { healthSafetyCommitmentPageData } from './health-safety-commitment.js';
import { accreditationsPageData } from './accreditations.js';
import { partnersPageData } from './partners.js';

/** Ordered registry of all corporate pages — single source for routes and CMS migration. */
export const corporatePageRegistry: CorporatePageContent[] = [
  aboutPageData,
  missionPageData,
  visionPageData,
  valuesPageData,
  leadershipPageData,
  whyChooseUsPageData,
  governancePageData,
  sustainabilityPageData,
  healthSafetyCommitmentPageData,
  accreditationsPageData,
  partnersPageData,
];

export const corporatePaths = corporatePageRegistry.map((page) => page.path);
