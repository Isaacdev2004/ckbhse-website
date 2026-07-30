import { defineIndustry, regulation, risk } from './helpers.js';

const hsAudit = {
  category: 'health-safety' as const,
  slug: 'health-safety-audits',
};
const riskAssessment = {
  category: 'health-safety' as const,
  slug: 'risk-assessments',
};
const iso45001 = { category: 'iso-management' as const, slug: 'iso-45001' };
const iso14001 = { category: 'iso-management' as const, slug: 'iso-14001' };
const coshh = {
  category: 'occupational-health' as const,
  slug: 'occupational-hygiene',
};
const envCompliance = {
  category: 'environmental' as const,
  slug: 'environmental-compliance',
};

export const manufacturingIndustry = defineIndustry({
  slug: 'manufacturing',
  sector: 'industrial-energy',
  name: 'Manufacturing',
  icon: 'Factory',
  summary:
    'Machinery safety, PUWER, LOLER, COSHH, and ISO management systems for UK manufacturing operations.',
  overview: [
    'Manufacturing facilities face complex machinery hazards, chemical exposures, and increasing pressure to achieve ISO certification while maintaining production uptime.',
    'CKBHSE delivers audits, risk assessments, and management system support tailored to production environments.',
  ],
  topics: [
    'Machinery Safety',
    'PUWER',
    'LOLER',
    'COSHH',
    'Risk Assessments',
    'Operational Safety',
  ],
  challenges: [
    'Machinery guarding and PUWER compliance',
    'COSHH management for production chemicals',
    'Noise and vibration exposure',
    'ISO 9001, 14001, and 45001 certification pressures',
    'Contractor access to production areas',
  ],
  regulatoryFramework: [
    regulation(
      'Provision and Use of Work Equipment Regulations 1998 (PUWER)',
      'Requires work equipment to be suitable, maintained, and inspected.',
    ),
    regulation(
      'Lifting Operations and Lifting Equipment Regulations 1998 (LOLER)',
      'Governs thorough examination of lifting equipment.',
    ),
    regulation(
      'Control of Substances Hazardous to Health Regulations 2002',
      'Requires assessment and control of hazardous substances.',
    ),
  ],
  commonRisks: [
    risk(
      'Machinery entanglement',
      'Unguarded or poorly isolated production equipment.',
      'high',
    ),
    risk(
      'COSHH exposure',
      'Inadequate control of process chemicals and fumes.',
      'high',
    ),
    risk(
      'Manual handling injuries',
      'Repetitive production tasks without ergonomic controls.',
      'medium',
    ),
  ],
  complianceRequirements: [
    'Suitable machinery guarding and isolation procedures',
    'COSHH assessments for all hazardous substances',
    'LOLER examination records for lifting equipment',
    'Noise and vibration assessments where required',
    'Emergency response plans for production incidents',
  ],
  requiredDocumentation: [
    'Machinery risk assessments',
    'COSHH assessments and safety data sheets',
    'LOLER examination reports',
    'Safe systems of work for maintenance',
    'ISO management system documentation',
  ],
  applicableServices: [hsAudit, riskAssessment, iso45001, iso14001, coshh],
  recommendedTraining: [
    {
      slug: 'iosh-managing-safely',
      title: 'IOSH Managing Safely',
      href: '/training/health-safety/iosh-managing-safely',
    },
    {
      slug: 'nebosh-general-certificate',
      title: 'NEBOSH General Certificate',
      href: '/training/health-safety/nebosh-general-certificate',
    },
  ],
  featured: true,
  standards: [
    'ISO 45001:2018',
    'ISO 14001:2015',
    'ISO 9001:2015',
    'BS EN ISO 12100 Machinery safety',
  ],
  industryStatistics: [
    { icon: 'Factory', value: '200+', label: 'Manufacturing Sites Supported' },
    { icon: 'Award', value: '85%', label: 'ISO Certification Success' },
  ],
  keywords: [
    'manufacturing safety',
    'PUWER',
    'LOLER',
    'COSHH',
    'machinery safety',
  ],
});

export const oilGasIndustry = defineIndustry({
  slug: 'oil-gas',
  sector: 'industrial-energy',
  name: 'Oil & Gas',
  icon: 'Droplet',
  summary:
    'Major hazard facilities, permit-to-work, process safety, and high-risk operational compliance for energy sector operators.',
  overview: [
    'Oil and gas operations involve major accident hazards requiring rigorous process safety management, permit-to-work systems, and competent workforce assurance.',
    'CKBHSE supports onshore and offshore-adjacent operations with specialist high-hazard consultancy.',
  ],
  topics: [
    'Major Hazard Facilities',
    'Permit to Work',
    'Process Safety',
    'Confined Spaces',
    'ATEX',
  ],
  challenges: [
    'Process safety and major accident hazard control',
    'Permit-to-work system integrity',
    'Confined space entry procedures',
    'ATEX compliance in hazardous atmospheres',
    'Regulatory scrutiny from HSE and OPRED',
  ],
  regulatoryFramework: [
    regulation(
      'Control of Major Accident Hazards Regulations 2015',
      'Requires safety reports and emergency plans for upper-tier sites.',
    ),
    regulation(
      'Dangerous Substances and Explosive Atmospheres Regulations 2002',
      'Controls ignition sources in explosive atmospheres.',
    ),
    regulation(
      'Confined Spaces Regulations 1997',
      'Governs entry into confined spaces including vessels and tanks.',
    ),
  ],
  commonRisks: [
    risk(
      'Loss of containment',
      'Process releases with fire and explosion potential.',
      'high',
    ),
    risk(
      'Confined space fatalities',
      'Inadequate gas testing and rescue arrangements.',
      'high',
    ),
    risk(
      'PTW failures',
      'Simultaneous operations without robust isolation.',
      'high',
    ),
  ],
  complianceRequirements: [
    'Safety report or COMAH notification as applicable',
    'Process safety management system',
    'Permit-to-work and isolation procedures',
    'Emergency response and drill programmes',
    'Competency assurance for high-hazard roles',
  ],
  requiredDocumentation: [
    'Safety report or onshore pipeline safety case',
    'Permit-to-work procedures and records',
    'Confined space entry permits',
    'Emergency response plans',
    'HAZOP and risk assessment records',
  ],
  applicableServices: [
    { category: 'health-safety', slug: 'safety-management-systems' },
    { category: 'health-safety', slug: 'accident-investigation' },
    hsAudit,
    riskAssessment,
  ],
  recommendedTraining: [
    {
      slug: 'nebosh-general-certificate',
      title: 'NEBOSH General Certificate',
      href: '/training/health-safety/nebosh-general-certificate',
    },
  ],
  featured: true,
  standards: [
    'ISO 45001:2018',
    'EEMUA guidance',
    'Energy Institute process safety frameworks',
  ],
  keywords: [
    'oil and gas safety',
    'process safety',
    'permit to work',
    'COMAH',
    'ATEX',
  ],
});

export const energyUtilitiesIndustry = defineIndustry({
  slug: 'energy-utilities',
  sector: 'industrial-energy',
  name: 'Energy & Utilities',
  icon: 'Flame',
  summary:
    'Electrical safety, asset integrity, isolation procedures, and high-risk work controls for utilities and energy infrastructure.',
  overview: [
    'Energy and utilities operators manage ageing assets, electrical hazards, and high-risk maintenance activities across critical national infrastructure.',
    'CKBHSE provides compliance advisory for generation, transmission, and utility maintenance organisations.',
  ],
  topics: [
    'Electrical Safety',
    'Asset Integrity',
    'Isolation Procedures',
    'High Risk Work',
  ],
  challenges: [
    'Electrical safety and arc flash risks',
    'Asset integrity on ageing infrastructure',
    'Isolation and lock-out/tag-out procedures',
    'Lone working on remote assets',
    'Contractor management on operational sites',
  ],
  regulatoryFramework: [
    regulation(
      'Electricity at Work Regulations 1989',
      'Requires electrical systems to be maintained and work conducted safely.',
    ),
    regulation(
      'Pressure Systems Safety Regulations 2000',
      'Covers integrity of boilers and pressure vessels.',
    ),
    regulation(
      'Health and Safety at Work etc. Act 1974',
      'General duties for safe utility operations.',
    ),
  ],
  commonRisks: [
    risk(
      'Electrical shock and arc flash',
      'Live working without adequate controls.',
      'high',
    ),
    risk(
      'Pressure system failure',
      'Inadequate examination and maintenance of pressure assets.',
      'high',
    ),
    risk(
      'Working on live networks',
      'Insufficient isolation verification.',
      'high',
    ),
  ],
  complianceRequirements: [
    'Electrical safety rules and authorisation procedures',
    'Pressure system examination records',
    'Isolation and permit procedures for high-risk work',
    'Competency records for authorised persons',
    'Emergency response for network incidents',
  ],
  requiredDocumentation: [
    'Electrical safety policy and rules',
    'Authorised person registers',
    'Isolation certificates and permits',
    'Pressure system examination reports',
    'Asset integrity inspection records',
  ],
  applicableServices: [
    hsAudit,
    riskAssessment,
    { category: 'compliance-regulatory', slug: 'competent-person-services' },
  ],
  recommendedTraining: [
    {
      slug: 'iosh-managing-safely',
      title: 'IOSH Managing Safely',
      href: '/training/health-safety/iosh-managing-safely',
    },
  ],
  standards: [
    'ISO 55001 Asset management',
    'HSG85 Electricity at Work',
    'ISO 45001:2018',
  ],
  keywords: [
    'utilities safety',
    'electrical safety',
    'asset integrity',
    'energy sector',
  ],
});

export const foodBeverageIndustry = defineIndustry({
  slug: 'food-beverage',
  sector: 'industrial-energy',
  name: 'Food & Beverage',
  icon: 'Store',
  summary:
    'HACCP, food safety, hygiene management, and environmental compliance for food manufacturing and processing.',
  overview: [
    'Food and beverage producers must integrate food safety management with workplace health, safety, and environmental obligations.',
    'CKBHSE supports HACCP-aligned safety programmes, hygiene compliance, and ISO certification for food sector clients.',
  ],
  topics: ['HACCP', 'Food Safety', 'Hygiene', 'Environmental Compliance'],
  challenges: [
    'Integrating HACCP with wider HSEQ management',
    'Slips, trips, and falls in wet processing areas',
    'Machinery safety on production lines',
    'Environmental permitting for effluent and waste',
    'Agency worker and temporary staff induction',
  ],
  regulatoryFramework: [
    regulation(
      'Food Safety Act 1990',
      'General food safety obligations for food businesses.',
    ),
    regulation(
      'Food Safety and Hygiene (England) Regulations 2013',
      'Hygiene requirements for food business operators.',
    ),
    regulation(
      'Environmental Permitting Regulations 2016',
      'Controls on emissions and effluent from food processing.',
    ),
  ],
  commonRisks: [
    risk(
      'Contamination incidents',
      'Cross-contamination and allergen control failures.',
      'high',
    ),
    risk(
      'Production machinery injuries',
      'Cleaning and maintenance activities on running lines.',
      'medium',
    ),
    risk(
      'Environmental non-compliance',
      'Effluent and waste management breaches.',
      'medium',
    ),
  ],
  complianceRequirements: [
    'HACCP-based food safety management system',
    'Hygiene training and monitoring records',
    'Environmental permit compliance where applicable',
    'Workplace risk assessments for production areas',
    'Pest control and hygiene audit programmes',
  ],
  requiredDocumentation: [
    'HACCP plan and hazard analysis',
    'Hygiene schedules and monitoring records',
    'Environmental permit and discharge consents',
    'Cleaning and sanitation procedures',
    'Allergen control documentation',
  ],
  applicableServices: [
    hsAudit,
    envCompliance,
    iso45001,
    { category: 'environmental', slug: 'waste-management' },
  ],
  recommendedTraining: [
    {
      slug: 'iosh-managing-safely',
      title: 'IOSH Managing Safely',
      href: '/training/health-safety/iosh-managing-safely',
    },
  ],
  standards: [
    'ISO 22000',
    'BRCGS Food Safety',
    'ISO 14001:2015',
    'ISO 45001:2018',
  ],
  keywords: [
    'food safety',
    'HACCP',
    'food manufacturing',
    'hygiene compliance',
  ],
});
