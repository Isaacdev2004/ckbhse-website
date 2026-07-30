import { defineIndustry, regulation, risk } from './helpers.js';

const hsAudit = {
  category: 'health-safety' as const,
  slug: 'health-safety-audits',
};
const riskAssessment = {
  category: 'health-safety' as const,
  slug: 'risk-assessments',
};
const cdm = { category: 'health-safety' as const, slug: 'cdm-consultancy' };
const fireRisk = {
  category: 'health-safety' as const,
  slug: 'fire-risk-assessments',
};
const contractorMgmt = {
  category: 'compliance-regulatory' as const,
  slug: 'contractor-management',
};

export const constructionIndustry = defineIndustry({
  slug: 'construction',
  sector: 'built-environment',
  name: 'Construction',
  icon: 'Building2',
  summary:
    'CDM compliance, site safety, RAMS, and contractor management for UK construction projects of every scale.',
  overview: [
    'Construction remains one of the highest-risk sectors in the UK economy. Principal contractors, clients, and designers face complex duties under CDM 2015 alongside general health and safety law.',
    'CKBHSE supports contractors, developers, and project teams with practical consultancy — from pre-construction information through to site audits and incident response.',
  ],
  topics: [
    'CDM Regulations',
    'Site Safety',
    'RAMS',
    'Temporary Works',
    'Working at Height',
    'Contractor Management',
  ],
  challenges: [
    'Coordinating multiple contractors and design teams under CDM 2015',
    'Managing high-risk activities including work at height and temporary works',
    'Maintaining RAMS quality across changing site conditions',
    'Principal Designer and Principal Contractor duty holder compliance',
    'Client CDM responsibilities on development projects',
  ],
  regulatoryFramework: [
    regulation(
      'Construction (Design and Management) Regulations 2015',
      'Defines duty holder roles and required H&S documentation for construction projects.',
    ),
    regulation(
      'Work at Height Regulations 2005',
      'Requires planning, supervision, and suitable equipment for work at height.',
    ),
    regulation(
      'Health and Safety at Work etc. Act 1974',
      'Foundational employer duties for safe construction operations.',
    ),
  ],
  commonRisks: [
    risk(
      'Falls from height',
      'Leading cause of fatal injuries in UK construction.',
      'high',
    ),
    risk(
      'Struck by moving objects',
      'Plant, vehicles, and falling materials on busy sites.',
      'high',
    ),
    risk(
      'Inadequate RAMS',
      'Generic method statements failing to control task-specific hazards.',
      'medium',
    ),
    risk(
      'CDM documentation gaps',
      'Missing or incomplete PCI, CPP, and H&S file content.',
      'medium',
    ),
  ],
  complianceRequirements: [
    'Appointed Principal Designer and Principal Contractor where required',
    'Suitable and sufficient risk assessments and method statements',
    'Construction Phase Plan before work commences',
    'Worker induction and site rules communication',
    'HSE notification for notifiable projects',
  ],
  requiredDocumentation: [
    'Pre-Construction Information (PCI)',
    'Construction Phase Plan (CPP)',
    'Health and Safety File',
    'Risk assessments and RAMS',
    'Contractor vetting records',
  ],
  applicableServices: [cdm, riskAssessment, hsAudit, fireRisk, contractorMgmt],
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
  relevantCaseStudies: [
    {
      slug: 'cdm-london-development',
      title: 'CDM London Development',
      href: '/case-studies/construction/cdm-london-development',
    },
  ],
  standards: [
    'ISO 45001:2018',
    'BS 5975 Temporary Works',
    'HSE Construction Sector Plan',
  ],
  industryStatistics: [
    { icon: 'AlertTriangle', value: '30%', label: 'Of UK Worker Fatalities' },
    { icon: 'Building2', value: '500+', label: 'Construction Clients Served' },
  ],
  featured: true,
  keywords: [
    'construction safety',
    'CDM 2015',
    'site safety',
    'RAMS',
    'principal contractor',
  ],
});

export const facilitiesManagementIndustry = defineIndustry({
  slug: 'facilities-management',
  sector: 'built-environment',
  name: 'Facilities Management',
  icon: 'Building',
  summary:
    'Building compliance, contractor control, legionella, asbestos, and maintenance safety for FM providers and estate managers.',
  overview: [
    'Facilities management organisations coordinate contractors, maintain building systems, and owe duties to occupiers and visitors across diverse property portfolios.',
    'CKBHSE helps FM providers manage legionella, asbestos, fire safety, and contractor competence across single and multi-site estates.',
  ],
  topics: [
    'Contractor Control',
    'Building Compliance',
    'Legionella',
    'Asbestos',
    'Maintenance Safety',
  ],
  challenges: [
    'Managing multiple contractors across varied building types',
    'Legionella control in water systems',
    'Asbestos management in older estates',
    'Fire safety in occupied buildings',
    'Permit-to-work for maintenance activities',
  ],
  regulatoryFramework: [
    regulation(
      'Control of Asbestos Regulations 2012',
      'Duty to manage asbestos in non-domestic premises.',
    ),
    regulation(
      'Regulatory Reform (Fire Safety) Order 2005',
      'Fire risk assessment duties for responsible persons.',
    ),
    regulation(
      'Health and Safety (Consultation with Employees) Regulations 1996',
      'Worker consultation in multi-contractor environments.',
    ),
  ],
  commonRisks: [
    risk(
      'Legionella exposure',
      'Inadequate water system management in large estates.',
      'high',
    ),
    risk(
      'Contractor incidents',
      'Poor vetting and supervision of maintenance contractors.',
      'high',
    ),
    risk(
      'Working at height during maintenance',
      'Roof and plant access without adequate controls.',
      'medium',
    ),
  ],
  complianceRequirements: [
    'Fire risk assessments and emergency plans',
    'Legionella risk assessment and control scheme',
    'Asbestos register and management plan where applicable',
    'Contractor competence verification',
    'Lone working procedures for mobile teams',
  ],
  requiredDocumentation: [
    'Fire risk assessment and emergency plan',
    'Legionella logbook and scheme of control',
    'Asbestos management plan',
    'Contractor RAMS and permits',
    'Building safety case summaries',
  ],
  applicableServices: [
    hsAudit,
    fireRisk,
    contractorMgmt,
    { category: 'compliance-regulatory', slug: 'competent-person-services' },
  ],
  recommendedTraining: [
    {
      slug: 'fire-warden',
      title: 'Fire Warden Training',
      href: '/training/health-safety/fire-warden',
    },
    {
      slug: 'iosh-managing-safely',
      title: 'IOSH Managing Safely',
      href: '/training/health-safety/iosh-managing-safely',
    },
  ],
  standards: [
    'ISO 45001:2018',
    'HSG274 Legionella guidance',
    'HSE asbestos management guidance',
  ],
  keywords: [
    'facilities management',
    'legionella',
    'asbestos',
    'building compliance',
  ],
});
