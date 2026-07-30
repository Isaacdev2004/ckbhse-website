import { defineIndustry, regulation, risk } from './helpers.js';

const hsAudit = {
  category: 'health-safety' as const,
  slug: 'health-safety-audits',
};
const riskAssessment = {
  category: 'health-safety' as const,
  slug: 'risk-assessments',
};
const fireRisk = {
  category: 'health-safety' as const,
  slug: 'fire-risk-assessments',
};

export const logisticsIndustry = defineIndustry({
  slug: 'logistics',
  sector: 'transport-logistics',
  name: 'Logistics & Transport',
  icon: 'Truck',
  summary:
    'Fleet safety, driver compliance, loading operations, and warehousing support for UK logistics operators.',
  overview: [
    'Logistics and transport organisations face driver hours compliance, loading bay hazards, and warehouse safety challenges across fast-moving operations.',
    'CKBHSE supports fleet operators, 3PL providers, and hauliers with practical compliance and audit programmes.',
  ],
  topics: [
    'Fleet Safety',
    'Driver Compliance',
    'Loading Operations',
    'Warehousing',
    'Manual Handling',
  ],
  challenges: [
    'Driver fatigue and hours compliance',
    'Loading and unloading vehicle safety',
    'Warehouse traffic management',
    'Manual handling in distribution centres',
    'Contract driver and agency worker competence',
  ],
  regulatoryFramework: [
    regulation(
      "Road Traffic Act and drivers' hours rules",
      'Governs driver licensing, fitness, and working time for commercial drivers.',
    ),
    regulation(
      'Provision and Use of Work Equipment Regulations 1998',
      'Covers forklift trucks and warehouse equipment.',
    ),
    regulation(
      'Manual Handling Operations Regulations 1992',
      'Requires assessment of manual handling risks in warehouses.',
    ),
  ],
  commonRisks: [
    risk(
      'Vehicle-pedestrian collisions',
      'Inadequate segregation in yards and warehouses.',
      'high',
    ),
    risk(
      'Loading bay falls',
      'Working at height on vehicles without fall protection.',
      'high',
    ),
    risk(
      'Forklift incidents',
      'Untrained operators and poor traffic management.',
      'high',
    ),
  ],
  complianceRequirements: [
    'Driver risk assessments and training records',
    'Forklift operator training and examination',
    'Loading bay safe systems of work',
    'Vehicle maintenance and defect reporting',
    'Warehouse traffic management plans',
  ],
  requiredDocumentation: [
    'Driver induction and training records',
    'Forklift truck examination certificates',
    'Loading/unloading RAMS',
    'Vehicle defect reporting procedures',
    'Traffic management plans',
  ],
  applicableServices: [hsAudit, riskAssessment, fireRisk],
  recommendedTraining: [
    {
      slug: 'iosh-managing-safely',
      title: 'IOSH Managing Safely',
      href: '/training/health-safety/iosh-managing-safely',
    },
    {
      slug: 'manual-handling',
      title: 'Manual Handling Training',
      href: '/training/health-safety/manual-handling',
    },
  ],
  featured: true,
  standards: [
    'ISO 45001:2018',
    'Fleet Operator Recognition Scheme (FORS)',
    'HSE warehousing guidance',
  ],
  keywords: [
    'logistics safety',
    'fleet safety',
    'driver compliance',
    'warehouse safety',
  ],
});

export const warehousingIndustry = defineIndustry({
  slug: 'warehousing',
  sector: 'transport-logistics',
  name: 'Warehousing & Distribution',
  icon: 'Briefcase',
  summary:
    'Storage safety, material handling, forklift operations, fire safety, and traffic management for warehouse operations.',
  overview: [
    'Warehousing and distribution centres combine high-volume material handling, racking systems, and continuous vehicle movements — creating distinct compliance challenges.',
    'CKBHSE delivers targeted audits and risk assessments for warehouse operators nationwide.',
  ],
  topics: [
    'Storage Safety',
    'Material Handling',
    'Forklift Operations',
    'Fire Safety',
    'Traffic Management',
  ],
  challenges: [
    'Racking integrity and storage height limits',
    'Forklift-pedestrian segregation',
    'Fire loading in high-bay warehouses',
    'Manual handling of varied stock',
    'Agency and temporary worker safety',
  ],
  regulatoryFramework: [
    regulation(
      'Workplace (Health, Safety and Welfare) Regulations 1992',
      'Covers warehouse layout, lighting, and welfare.',
    ),
    regulation(
      'Regulatory Reform (Fire Safety) Order 2005',
      'Fire risk assessment for warehouse premises.',
    ),
    regulation(
      'Provision and Use of Work Equipment Regulations 1998',
      'Forklift and conveyor system safety.',
    ),
  ],
  commonRisks: [
    risk(
      'Racking collapse',
      'Overloading and damage to storage systems.',
      'high',
    ),
    risk(
      'Forklift strikes',
      'Poor visibility and inadequate traffic routes.',
      'high',
    ),
    risk(
      'Fire spread in high-bay storage',
      'Inadequate detection and compartmentation.',
      'medium',
    ),
  ],
  complianceRequirements: [
    'Racking inspection programme (SEMA or equivalent)',
    'Forklift operator training and daily checks',
    'Fire risk assessment for storage configurations',
    'Traffic management and pedestrian routes',
    'Manual handling assessments for pick and pack',
  ],
  requiredDocumentation: [
    'Racking inspection reports',
    'Forklift maintenance and LOLER records',
    'Fire risk assessment',
    'Warehouse layout and traffic plans',
    'Pick rate ergonomic assessments',
  ],
  applicableServices: [hsAudit, riskAssessment, fireRisk],
  recommendedTraining: [
    {
      slug: 'fire-warden',
      title: 'Fire Warden Training',
      href: '/training/health-safety/fire-warden',
    },
    {
      slug: 'manual-handling',
      title: 'Manual Handling Training',
      href: '/training/health-safety/manual-handling',
    },
  ],
  standards: [
    'SEMA racking guidelines',
    'ISO 45001:2018',
    'HSE warehousing and storage guidance',
  ],
  keywords: [
    'warehouse safety',
    'forklift safety',
    'distribution centre',
    'racking inspection',
  ],
});
