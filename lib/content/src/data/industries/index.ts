import type { IndustryPageContent } from '../../schemas/industries.js';
import {
  constructionIndustry,
  facilitiesManagementIndustry,
} from './built-environment.js';
import {
  manufacturingIndustry,
  oilGasIndustry,
  energyUtilitiesIndustry,
  foodBeverageIndustry,
} from './industrial-energy.js';
import {
  logisticsIndustry,
  warehousingIndustry,
} from './transport-logistics.js';
import {
  healthcareIndustry,
  educationIndustry,
  publicSectorIndustry,
  retailIndustry,
} from './remaining-sectors.js';

export const industryPageRegistry: IndustryPageContent[] = [
  constructionIndustry,
  facilitiesManagementIndustry,
  manufacturingIndustry,
  oilGasIndustry,
  energyUtilitiesIndustry,
  foodBeverageIndustry,
  logisticsIndustry,
  warehousingIndustry,
  healthcareIndustry,
  educationIndustry,
  publicSectorIndustry,
  retailIndustry,
];

export const industryPaths = industryPageRegistry.map((page) => page.path);
