import { benefit, defineService } from './helpers.js';

export const occupationalHealthServices = [
  defineService({
    slug: 'workplace-health',
    category: 'occupational-health',
    title: 'Workplace Health',
    subtitle:
      'Occupational health programmes supporting workforce wellbeing and compliance.',
    icon: 'Heart',
    summary:
      'Workplace health advisory covering occupational health strategy, referral pathways, and health risk management.',
    overview: [
      'Healthy workers are productive workers. We help organisations design occupational health programmes aligned to their risk profile.',
    ],
    objectives: [
      'Assess occupational health risks across roles and sites',
      'Design health management programmes and referral pathways',
      'Support fitness-for-work and return-to-work processes',
      'Integrate health with wider HSE management',
    ],
    keyBenefits: [
      benefit(
        'Heart',
        'Workforce Wellbeing',
        'Programmes that protect and support employee health.',
      ),
      benefit(
        'Users',
        'Reduced Absence',
        'Early intervention and effective health management.',
      ),
      benefit(
        'ShieldCheck',
        'Legal Compliance',
        'Alignment with health surveillance duties.',
      ),
    ],
    industrySlugs: ['manufacturing', 'healthcare', 'construction'],
    regulations: [
      'Health and Safety at Work etc. Act 1974',
      'Management of Health and Safety at Work Regulations 1999',
    ],
    relatedServices: [
      { category: 'occupational-health', slug: 'health-surveillance' },
      { category: 'occupational-health', slug: 'wellbeing-programmes' },
    ],
  }),
  defineService({
    slug: 'wellbeing-programmes',
    category: 'occupational-health',
    title: 'Wellbeing Programmes',
    subtitle:
      'Employee wellbeing initiatives supporting mental and physical health.',
    icon: 'Users',
    summary:
      'Design and implement workplace wellbeing programmes including mental health, stress management, and health promotion.',
    overview: [
      'Wellbeing programmes complement traditional safety management and support modern workforce expectations.',
    ],
    objectives: [
      'Assess wellbeing risks including stress and mental health',
      'Design tailored wellbeing initiatives and campaigns',
      'Support manager training and employee resources',
      'Measure programme impact and engagement',
    ],
    keyBenefits: [
      benefit(
        'Users',
        'Engaged Workforce',
        'Programmes that employees value and participate in.',
      ),
      benefit(
        'Heart',
        'Holistic Health',
        'Address mental and physical health together.',
      ),
      benefit(
        'TrendingUp',
        'Productivity',
        'Reduced presenteeism and improved retention.',
      ),
    ],
    industrySlugs: ['healthcare', 'retail', 'manufacturing'],
    regulations: ['Health and Safety at Work etc. Act 1974'],
    relatedServices: [
      { category: 'occupational-health', slug: 'workplace-health' },
    ],
  }),
  defineService({
    slug: 'health-surveillance',
    category: 'occupational-health',
    title: 'Health Surveillance',
    subtitle:
      'Statutory and best-practice health surveillance programme design.',
    icon: 'ClipboardList',
    summary:
      'Health surveillance programmes meeting COSHH, noise, vibration, and other regulatory requirements.',
    overview: [
      'Where health surveillance is required, programmes must be systematic and legally compliant. We design and manage surveillance aligned to exposure profiles.',
    ],
    objectives: [
      'Determine health surveillance requirements by role',
      'Design screening schedules and protocols',
      'Coordinate with occupational health providers',
      'Manage records and review outcomes',
    ],
    keyBenefits: [
      benefit(
        'ClipboardList',
        'Compliant Programmes',
        'Surveillance aligned to HSE and COSHH requirements.',
      ),
      benefit(
        'Eye',
        'Early Detection',
        'Identify health effects before serious harm occurs.',
      ),
      benefit(
        'FileCheck',
        'Record Management',
        'Defensible health records and review processes.',
      ),
    ],
    industrySlugs: ['manufacturing', 'construction', 'oil-gas'],
    regulations: [
      'Control of Substances Hazardous to Health Regulations 2002',
      'Control of Noise at Work Regulations 2005',
    ],
    relatedServices: [
      { category: 'occupational-health', slug: 'exposure-monitoring' },
      { category: 'occupational-health', slug: 'occupational-hygiene' },
    ],
  }),
  defineService({
    slug: 'occupational-hygiene',
    category: 'occupational-health',
    title: 'Occupational Hygiene',
    subtitle: 'Assessment and control of workplace health hazards.',
    icon: 'FlaskConical',
    summary:
      'Occupational hygiene services identifying and controlling chemical, physical, and biological workplace hazards.',
    overview: [
      'Our occupational hygienists assess exposure to noise, vibration, dust, fumes, and biological agents.',
    ],
    objectives: [
      'Identify and assess occupational exposure hazards',
      'Recommend engineering and administrative controls',
      'Support health surveillance requirements',
      'Verify control effectiveness through monitoring',
    ],
    keyBenefits: [
      benefit(
        'FlaskConical',
        'Specialist Expertise',
        'Qualified occupational hygiene assessment.',
      ),
      benefit(
        'Shield',
        'Exposure Control',
        'Practical controls reducing worker exposure.',
      ),
      benefit(
        'Scale',
        'Regulatory Alignment',
        'Assessments suitable for HSE and insurance review.',
      ),
    ],
    industrySlugs: ['manufacturing', 'oil-gas', 'construction'],
    regulations: [
      'COSHH 2002',
      'Control of Vibration at Work Regulations 2005',
    ],
    relatedServices: [
      { category: 'occupational-health', slug: 'exposure-monitoring' },
    ],
  }),
  defineService({
    slug: 'exposure-monitoring',
    category: 'occupational-health',
    title: 'Exposure Monitoring',
    subtitle:
      'Air monitoring, noise surveys, and personal exposure assessment.',
    icon: 'Eye',
    summary:
      'Quantitative exposure monitoring for COSHH substances, noise, and other occupational health hazards.',
    overview: [
      'Monitoring provides evidence for risk assessments, health surveillance, and control verification.',
    ],
    objectives: [
      'Design monitoring strategies for identified hazards',
      'Conduct workplace air and noise surveys',
      'Compare results against workplace exposure limits',
      'Recommend control improvements where limits are exceeded',
    ],
    keyBenefits: [
      benefit(
        'Eye',
        'Evidence-based',
        'Objective data supporting risk assessment and controls.',
      ),
      benefit(
        'FileCheck',
        'WEL Compliance',
        'Comparison against UK workplace exposure limits.',
      ),
      benefit(
        'TrendingUp',
        'Trend Analysis',
        'Track exposure over time to verify improvements.',
      ),
    ],
    industrySlugs: ['manufacturing', 'construction', 'oil-gas'],
    regulations: ['COSHH 2002', 'Control of Noise at Work Regulations 2005'],
    relatedServices: [
      { category: 'occupational-health', slug: 'occupational-hygiene' },
    ],
  }),
];
