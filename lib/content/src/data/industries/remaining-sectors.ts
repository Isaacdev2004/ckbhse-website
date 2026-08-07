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
const workplaceHealth = {
  category: 'occupational-health' as const,
  slug: 'workplace-health',
};

export const healthcareIndustry = defineIndustry({
  slug: 'healthcare',
  sector: 'healthcare-life-sciences',
  name: 'Healthcare',
  icon: 'Heart',
  summary:
    'Infection control, clinical risk, patient safety, manual handling, and occupational health for healthcare providers.',
  overview: [
    'Healthcare settings combine clinical risks, infection prevention duties, and regulatory scrutiny from CQC, HSE, and professional bodies.',
    'CKBHSE supports NHS trusts, private providers, and care organisations with sector-specific HSE advisory.',
  ],
  topics: [
    'Infection Control',
    'Clinical Risk',
    'Patient Safety',
    'Manual Handling',
    'Occupational Health',
  ],
  challenges: [
    'Infection prevention and control compliance',
    'Manual handling of patients and residents',
    'Clinical risk management and incident reporting',
    'Fire safety in care and hospital settings',
    'Agency staff induction and competence',
  ],
  regulatoryFramework: [
    regulation(
      'Health and Social Care Act 2008 (Regulated Activities)',
      'CQC registration and fundamental standards for care providers.',
    ),
    regulation(
      'Control of Substances Hazardous to Health Regulations 2002',
      'Clinical chemicals, disinfectants, and pharmaceuticals.',
    ),
    regulation(
      'Reporting of Injuries, Diseases and Dangerous Occurrences Regulations 2013',
      'RIDDOR duties including sharps injuries.',
    ),
  ],
  commonRisks: [
    risk(
      'Needlestick and sharps injuries',
      'Inadequate disposal and handling protocols.',
      'high',
    ),
    risk(
      'Patient handling injuries',
      'Insufficient equipment and training for moving and handling.',
      'high',
    ),
    risk(
      'Infection outbreaks',
      'Gaps in IPC procedures and PPE compliance.',
      'high',
    ),
  ],
  complianceRequirements: [
    'Infection prevention and control policies',
    'Moving and handling assessments and equipment',
    'Fire risk assessment for sleeping accommodation',
    'COSHH assessments for clinical substances',
    'Incident reporting and learning systems',
  ],
  requiredDocumentation: [
    'IPC policy and audit records',
    'Patient handling risk assessments',
    'Fire risk assessment and PEEPs',
    'COSHH assessments for clinical areas',
    'CQC compliance evidence portfolio',
  ],
  applicableServices: [
    hsAudit,
    riskAssessment,
    fireRisk,
    workplaceHealth,
    { category: 'occupational-health', slug: 'health-surveillance' },
  ],
  recommendedTraining: [
    {
      slug: 'manual-handling',
      title: 'Manual Handling Training',
      href: '/training/health-safety/manual-handling',
    },
    {
      slug: 'first-aid-at-work',
      title: 'First Aid at Work',
      href: '/training/health-safety/first-aid-at-work',
    },
  ],
  featured: true,
  standards: [
    'CQC fundamental standards',
    'ISO 45001:2018',
    'NICE IPC guidelines',
  ],
  keywords: [
    'healthcare safety',
    'infection control',
    'CQC compliance',
    'patient safety',
  ],
});

export const educationIndustry = defineIndustry({
  slug: 'education',
  sector: 'education-public',
  name: 'Education',
  icon: 'GraduationCap',
  summary:
    'Campus safety, student welfare, fire safety, and laboratory safety for schools, colleges, and universities.',
  overview: [
    'Educational institutions owe duties to students, staff, and visitors across classrooms, laboratories, sports facilities, and residential accommodation.',
    'CKBHSE supports schools, colleges, and universities with proportionate, practical safety management.',
  ],
  topics: [
    'Campus Safety',
    'Student Welfare',
    'Fire Safety',
    'Laboratory Safety',
  ],
  challenges: [
    'Science laboratory and workshop safety',
    'Fire evacuation for large campus populations',
    'Educational visit and off-site activity planning',
    'Contractor works during term time',
    'Safeguarding integration with health and safety',
  ],
  regulatoryFramework: [
    regulation(
      'Health and Safety at Work etc. Act 1974',
      'Employer duties to staff and others affected by school activities.',
    ),
    regulation(
      'Regulatory Reform (Fire Safety) Order 2005',
      'Fire risk assessment for educational premises.',
    ),
    regulation(
      'Management of Health and Safety at Work Regulations 1999',
      'Risk assessment and training for educational activities.',
    ),
  ],
  commonRisks: [
    risk(
      'Laboratory incidents',
      'Inadequate COSHH controls in science departments.',
      'high',
    ),
    risk(
      'Fire evacuation failures',
      'Complex buildings with varied occupancy patterns.',
      'medium',
    ),
    risk(
      'Sports and activity injuries',
      'Insufficient risk assessment for PE and trips.',
      'medium',
    ),
  ],
  complianceRequirements: [
    'Fire risk assessment and termly drills',
    'Science laboratory COSHH and risk assessments',
    'Educational visit planning and consent',
    'Contractor management during occupied periods',
    'Playground and sports facility inspections',
  ],
  requiredDocumentation: [
    'Fire risk assessment and evacuation plans',
    'Laboratory risk assessments and CLEAPSS alignment',
    'Educational visit risk assessments',
    'Health and safety policy for governors/trustees',
    'Accident and incident reporting records',
  ],
  applicableServices: [
    hsAudit,
    riskAssessment,
    fireRisk,
    { category: 'occupational-health', slug: 'wellbeing-programmes' },
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
    'HSE education sector guidance',
    'CLEAPSS laboratory standards',
    'ISO 45001:2018',
  ],
  keywords: [
    'school safety',
    'university H&S',
    'laboratory safety',
    'campus safety',
  ],
});

export const publicSectorIndustry = defineIndustry({
  slug: 'public-sector',
  sector: 'education-public',
  name: 'Public Sector',
  icon: 'Scale',
  summary:
    'Governance, compliance, procurement, and public accountability for local authorities and public bodies.',
  overview: [
    'Public sector organisations face heightened accountability, procurement rules, and governance expectations alongside standard HSE duties.',
    'CKBHSE supports councils, arms-length bodies, and public agencies with defensible compliance programmes.',
  ],
  topics: ['Governance', 'Compliance', 'Procurement', 'Public Accountability'],
  challenges: [
    'Board and member-level governance of HSE',
    'Managing contractors through public procurement',
    'Transparent reporting and audit scrutiny',
    'Multi-department coordination across services',
    'Budget constraints on compliance resource',
  ],
  regulatoryFramework: [
    regulation(
      'Health and Safety at Work etc. Act 1974',
      'Employer duties for council and public body employees.',
    ),
    regulation(
      'Public Services (Social Value) Act 2012',
      'Social value considerations in procurement including safety.',
    ),
    regulation(
      'Local Government Act and governance frameworks',
      'Accountability structures for public bodies.',
    ),
  ],
  commonRisks: [
    risk(
      'Governance failures',
      'Insufficient board oversight of HSE performance.',
      'medium',
    ),
    risk(
      'Contractor incidents',
      'Weak contract management of outsourced services.',
      'high',
    ),
    risk(
      'Reputational damage',
      'Public scrutiny following preventable incidents.',
      'medium',
    ),
  ],
  complianceRequirements: [
    'Corporate HSE governance and reporting',
    'Contractor procurement and management standards',
    'Member and officer safety training',
    'Transparent incident reporting and learning',
    'Audit-ready documentation and evidence',
  ],
  requiredDocumentation: [
    'Corporate health and safety policy',
    'Governance committee reports',
    'Contractor procurement specifications',
    'Departmental risk registers',
    'Annual HSE performance reports',
  ],
  applicableServices: [
    { category: 'business-risk', slug: 'governance-support' },
    { category: 'compliance-regulatory', slug: 'legal-compliance-reviews' },
    hsAudit,
    { category: 'compliance-regulatory', slug: 'contractor-management' },
  ],
  recommendedTraining: [
    {
      slug: 'iosh-managing-safely',
      title: 'IOSH Managing Safely',
      href: '/training/health-safety/iosh-managing-safely',
    },
  ],
  standards: [
    'ISO 45001:2018',
    'CIPFA governance frameworks',
    'HSE public services guidance',
  ],
  keywords: [
    'public sector compliance',
    'local authority safety',
    'governance',
    'procurement',
  ],
});

export const retailIndustry = defineIndustry({
  slug: 'retail',
  sector: 'commercial',
  name: 'Retail & Commercial',
  icon: 'Store',
  summary:
    'Customer safety, premises compliance, fire risk, and staff safety for retail and commercial property operators.',
  overview: [
    'Retail and commercial operators must protect customers, staff, and contractors across high-footfall premises with varied occupancy patterns.',
    'CKBHSE supports national retailers, shopping centres, and commercial landlords with scalable compliance support.',
  ],
  topics: [
    'Customer Safety',
    'Premises Compliance',
    'Fire Risk',
    'Staff Safety',
  ],
  challenges: [
    'Slips, trips, and falls in customer areas',
    'Fire safety in large retail units',
    'Lone working and violence towards staff',
    'Contractor works during trading hours',
    'Multi-site consistency of safety standards',
  ],
  regulatoryFramework: [
    regulation(
      "Occupiers' Liability Acts",
      'Duty of care to lawful visitors on commercial premises.',
    ),
    regulation(
      'Regulatory Reform (Fire Safety) Order 2005',
      'Fire risk assessment for retail premises.',
    ),
    regulation(
      'Management of Health and Safety at Work Regulations 1999',
      'Risk assessment for retail operations.',
    ),
  ],
  commonRisks: [
    risk(
      'Customer slips and trips',
      'Wet floors, obstructions, and uneven surfaces.',
      'high',
    ),
    risk(
      'Workplace violence',
      'Robbery, abuse, and aggressive behaviour towards staff.',
      'medium',
    ),
    risk(
      'Fire in stock areas',
      'High fire loading and blocked escape routes.',
      'high',
    ),
  ],
  complianceRequirements: [
    'Fire risk assessment and staff training',
    'Customer area inspection programmes',
    'Lone working and violence reduction policies',
    'Manual handling for stock and deliveries',
    'Contractor management for fit-out works',
  ],
  requiredDocumentation: [
    'Fire risk assessment and emergency plan',
    'Customer safety inspection checklists',
    'Violence and aggression policy',
    'Delivery and stock handling RAMS',
    'Multi-site audit reports',
  ],
  applicableServices: [
    hsAudit,
    fireRisk,
    riskAssessment,
    { category: 'compliance-regulatory', slug: 'competent-person-services' },
  ],
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
  featured: true,
  standards: [
    'ISO 45001:2018',
    'British Retail Consortium standards',
    'HSE retail guidance',
  ],
  keywords: [
    'retail safety',
    'shop safety',
    'customer safety',
    'commercial premises',
  ],
});
