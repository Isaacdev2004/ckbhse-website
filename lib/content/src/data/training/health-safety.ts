import { defineCourse, outline, serviceRef, courseRef } from './helpers.js';

export const healthSafetyCourses = [
  defineCourse({
    slug: 'iosh-working-safely',
    category: 'health-safety',
    title: 'IOSH Working Safely',
    subtitle:
      'Entry-level health and safety awareness for all workers, covering core hazards and personal responsibility.',
    icon: 'Shield',
    accreditation: 'IOSH syllabus aligned',
    level: 'foundation',
    price: 'From £125',
    duration: '1 day',
    deliveryMethodIds: ['classroom', 'online'],
    certification: {
      name: 'IOSH Working Safely Certificate',
      description:
        'Internationally recognised certificate confirming foundational safety awareness.',
      accreditedBy: 'Institution of Occupational Safety and Health (IOSH)',
    },
    assessment: 'Multiple-choice assessment and hazard-spotting exercise.',
    overview: [
      'IOSH Working Safely provides essential health and safety knowledge for employees at every level.',
      'The course builds confidence to identify hazards, understand legal duties, and contribute to a safer workplace.',
    ],
    learningObjectives: [
      'Define health, safety, and environmental responsibilities',
      'Identify common workplace hazards and appropriate controls',
      'Understand the importance of reporting incidents and near misses',
      'Apply basic risk control principles in daily work',
    ],
    targetAudience: [
      'All employees requiring foundational safety awareness',
      'New starters and induction programmes',
      'Contractors and agency workers on client sites',
    ],
    courseOutline: [
      outline('Module 1 — Introducing Working Safely', [
        'Why working safely matters',
        'Legal framework overview',
        'Roles and responsibilities',
      ]),
      outline('Module 2 — Defining Hazard and Risk', [
        'Hazard identification',
        'Risk assessment basics',
        'Hierarchy of control',
      ]),
      outline('Module 3 — Common Workplace Hazards', [
        'Mechanical, physical, and environmental hazards',
        'Fire, electricity, and transport',
        'Human factors and behaviour',
      ]),
    ],
    learningOutcomes: [
      'Recognise common workplace hazards',
      'Understand personal safety responsibilities',
      'Apply basic risk control measures',
      'Contribute to incident reporting culture',
    ],
    industrySlugs: ['construction', 'manufacturing', 'logistics', 'retail'],
    relatedServices: [
      serviceRef('health-safety', 'health-safety-audits'),
      serviceRef('health-safety', 'safety-policies-procedures'),
    ],
    relatedCourses: [courseRef('health-safety', 'iosh-managing-safely')],
    pathwayLevel: 'foundation',
    featured: true,
    keywords: ['IOSH', 'working safely', 'safety awareness'],
  }),
  defineCourse({
    slug: 'iosh-managing-safely',
    category: 'health-safety',
    title: 'IOSH Managing Safely',
    subtitle:
      'Industry-leading health and safety course for managers and supervisors across all sectors.',
    icon: 'Users',
    accreditation: 'IOSH syllabus aligned',
    level: 'intermediate',
    price: 'From £395',
    duration: '3–4 days',
    deliveryMethodIds: ['classroom', 'online', 'virtual-instructor-led'],
    certification: {
      name: 'IOSH Managing Safely Certificate',
      description:
        'Widely recognised management qualification for health and safety competence.',
      accreditedBy: 'Institution of Occupational Safety and Health (IOSH)',
    },
    assessment:
      'Multi-format assessment including project work and end-of-course test.',
    overview: [
      'IOSH Managing Safely equips managers and supervisors with the knowledge to handle health and safety in their teams.',
      'The programme covers legal duties, risk assessment, incident investigation, and performance measurement.',
    ],
    learningObjectives: [
      'Understand legal health and safety responsibilities for managers',
      'Assess and control risks in the workplace',
      'Investigate incidents and implement corrective actions',
      'Measure and improve safety performance',
    ],
    targetAudience: [
      'Managers and supervisors in any sector',
      'Team leaders with health and safety responsibilities',
      'Directors seeking management-level safety competence',
    ],
    prerequisites: ['No prior H&S qualification required'],
    courseOutline: [
      outline('Module 1 — Introducing Managing Safely', [
        'Why manage safely',
        'Legal framework and enforcement',
        'Management systems overview',
      ]),
      outline('Module 2 — Assessing Risks', [
        'Risk assessment methodology',
        'Hazard identification techniques',
        'Control selection and review',
      ]),
      outline('Module 3 — Controlling Risks', [
        'Hierarchy of control',
        'Safe systems of work',
        'Permits and procedures',
      ]),
      outline('Module 4 — Understanding Responsibilities', [
        'Employer and employee duties',
        'Management accountability',
        'Competence and training',
      ]),
    ],
    learningOutcomes: [
      'Understand legal responsibilities',
      'Identify and control risks',
      'Investigate incidents effectively',
      'Improve safety culture',
    ],
    industrySlugs: [
      'construction',
      'manufacturing',
      'logistics',
      'healthcare',
      'retail',
    ],
    relatedServices: [
      serviceRef('health-safety', 'health-safety-audits'),
      serviceRef('health-safety', 'risk-assessments'),
    ],
    relatedCourses: [
      courseRef('health-safety', 'iosh-working-safely'),
      courseRef('health-safety', 'nebosh-general-certificate'),
    ],
    pathwayLevel: 'intermediate',
    featured: true,
    keywords: ['IOSH', 'managing safely', 'supervisor training'],
  }),
  defineCourse({
    slug: 'nebosh-general-certificate',
    category: 'health-safety',
    title: 'NEBOSH General Certificate',
    subtitle:
      'Gold standard health and safety qualification recognised globally for safety professionals.',
    icon: 'GraduationCap',
    accreditation: 'NEBOSH Accredited',
    level: 'advanced',
    price: 'From £1,295',
    duration: '10 days',
    deliveryMethodIds: ['classroom', 'virtual-instructor-led'],
    certification: {
      name: 'NEBOSH National General Certificate',
      description:
        'Professional qualification for health and safety practitioners and career progression.',
      accreditedBy:
        'National Examination Board in Occupational Safety and Health (NEBOSH)',
    },
    assessment:
      'Two written examinations and a practical risk assessment project (NG2).',
    overview: [
      'The NEBOSH General Certificate is the benchmark qualification for health and safety professionals in the UK.',
      'It provides comprehensive knowledge of legal requirements, hazard control, and management systems.',
    ],
    learningObjectives: [
      'Understand UK health and safety legal framework',
      'Conduct and review risk assessments',
      'Develop and implement health and safety management systems',
      'Investigate incidents and recommend improvements',
    ],
    targetAudience: [
      'Aspiring health and safety professionals',
      'Safety officers and coordinators',
      'Managers pursuing formal H&S qualifications',
    ],
    prerequisites: [
      'IOSH Managing Safely or equivalent experience recommended',
    ],
    courseOutline: [
      outline('Unit NG1 — Management of Health and Safety', [
        'Legal requirements',
        'Health and safety management systems',
        'Risk assessment and control',
        'Incident investigation',
      ]),
      outline('Unit NG2 — Risk Assessment Practical', [
        'Workplace inspection',
        'Hazard identification',
        'Risk assessment report',
      ]),
    ],
    learningOutcomes: [
      'Professional H&S qualification',
      'Risk assessment expertise',
      'Legal knowledge',
      'Career progression',
    ],
    industrySlugs: ['construction', 'manufacturing', 'oil-gas', 'healthcare'],
    relatedServices: [
      serviceRef('health-safety', 'health-safety-audits'),
      serviceRef('compliance-regulatory', 'competent-person-services'),
    ],
    relatedCourses: [courseRef('health-safety', 'iosh-managing-safely')],
    pathwayLevel: 'advanced',
    featured: true,
    keywords: ['NEBOSH', 'general certificate', 'H&S qualification'],
  }),
  defineCourse({
    slug: 'risk-assessment',
    category: 'health-safety',
    title: 'Risk Assessment Training',
    subtitle:
      'Practical skills to conduct effective workplace risk assessments aligned to UK legal requirements.',
    icon: 'FileCheck',
    accreditation: 'CPD available on request',
    level: 'intermediate',
    price: 'From £195',
    duration: '1 day',
    deliveryMethodIds: ['classroom', 'online', 'on-site'],
    certification: {
      name: 'CPD Certificate in Risk Assessment',
      description:
        'Certificate confirming competence in workplace risk assessment methodology.',
    },
    assessment: 'Practical risk assessment exercise and knowledge check.',
    overview: [
      'Effective risk assessment is the foundation of UK health and safety law.',
      'This course develops practical skills to identify hazards, evaluate risk, and implement proportionate controls.',
    ],
    learningObjectives: [
      'Apply the five steps of risk assessment',
      'Identify hazards across diverse workplace scenarios',
      'Select controls using the hierarchy of control',
      'Document and review assessments effectively',
    ],
    targetAudience: [
      'Supervisors and team leaders',
      'Health and safety representatives',
      'Facilities and operations managers',
    ],
    courseOutline: [
      outline('Legal Framework', [
        'Management of Health and Safety at Work Regulations 1999',
        'Employer duties',
        'Competence requirements',
      ]),
      outline('Risk Assessment Methodology', [
        'Five steps to risk assessment',
        'Hazard identification tools',
        'Risk rating and prioritisation',
      ]),
      outline('Practical Application', [
        'Workplace scenario exercises',
        'Documentation templates',
        'Review and monitoring',
      ]),
    ],
    learningOutcomes: [
      'Risk assessment methodology',
      'Hazard identification',
      'Control hierarchy',
      'Documentation',
    ],
    industrySlugs: ['construction', 'manufacturing', 'logistics', 'retail'],
    relatedServices: [serviceRef('health-safety', 'risk-assessments')],
    pathwayLevel: 'intermediate',
    keywords: ['risk assessment', 'RAMS', 'hazard identification'],
  }),
  defineCourse({
    slug: 'fire-safety-awareness',
    category: 'health-safety',
    title: 'Fire Safety Awareness',
    subtitle:
      'Essential fire safety knowledge for all employees, covering prevention, detection, and evacuation.',
    icon: 'Flame',
    accreditation: 'CPD available on request',
    level: 'foundation',
    price: 'From £65',
    duration: '2 hours',
    deliveryMethodIds: ['online', 'classroom', 'on-site'],
    certification: {
      name: 'Fire Safety Awareness Certificate',
      description:
        'Certificate confirming foundational fire safety knowledge for all employees.',
    },
    assessment: 'Online knowledge check with minimum pass mark of 80%.',
    overview: [
      'Fire remains one of the most significant risks in UK workplaces.',
      'This awareness course ensures all employees understand fire prevention, alarm response, and evacuation procedures.',
    ],
    learningObjectives: [
      'Understand fire chemistry and common causes',
      'Identify fire hazards in the workplace',
      'Respond correctly to fire alarms and evacuation signals',
      'Use basic fire-fighting equipment where appropriate',
    ],
    targetAudience: [
      'All employees',
      'New starters',
      'Remote and hybrid workers',
    ],
    courseOutline: [
      outline('Fire Science & Legislation', [
        'Fire triangle',
        'Regulatory Reform (Fire Safety) Order 2005',
        'Employer duties',
      ]),
      outline('Prevention & Protection', [
        'Common ignition sources',
        'Fire detection systems',
        'Emergency plans',
      ]),
      outline('Emergency Response', [
        'Evacuation procedures',
        'Assembly points',
        'Fire extinguisher types',
      ]),
    ],
    learningOutcomes: [
      'Fire safety legislation',
      'Hazard identification',
      'Evacuation procedures',
      'Emergency response',
    ],
    industrySlugs: ['retail', 'healthcare', 'education', 'warehousing'],
    relatedServices: [serviceRef('health-safety', 'fire-risk-assessments')],
    relatedCourses: [courseRef('health-safety', 'fire-warden')],
    pathwayLevel: 'foundation',
    keywords: ['fire safety', 'fire awareness', 'evacuation'],
  }),
  defineCourse({
    slug: 'fire-warden',
    category: 'health-safety',
    title: 'Fire Warden Training',
    subtitle:
      'Equip designated fire wardens with the knowledge and skills to manage fire emergencies effectively.',
    icon: 'Flame',
    accreditation: 'CPD available on request',
    level: 'intermediate',
    price: 'From £95',
    duration: 'Half day',
    deliveryMethodIds: ['on-site', 'classroom'],
    certification: {
      name: 'Fire Warden / Marshal Certificate',
      description:
        'Certificate confirming competence as a designated fire warden or marshal.',
    },
    assessment: 'Practical evacuation exercise and written knowledge check.',
    overview: [
      'Fire wardens play a critical role in ensuring safe evacuation and emergency coordination.',
      'This course covers legal duties, sweep procedures, and liaison with emergency services.',
    ],
    learningObjectives: [
      'Understand fire warden roles and responsibilities',
      'Conduct effective evacuation sweeps',
      'Coordinate with fire marshals and emergency services',
      'Maintain fire safety records and equipment checks',
    ],
    targetAudience: [
      'Designated fire wardens and marshals',
      'Facilities managers',
      'Supervisors',
    ],
    prerequisites: ['Fire Safety Awareness recommended'],
    courseOutline: [
      outline('Role of the Fire Warden', [
        'Legal duties',
        'Emergency plan overview',
        'Communication protocols',
      ]),
      outline('Evacuation Procedures', [
        'Sweep techniques',
        'Assembly point management',
        'Roll call procedures',
      ]),
      outline('Equipment & Records', [
        'Fire extinguisher checks',
        'Log books',
        'Drill evaluation',
      ]),
    ],
    learningOutcomes: [
      'Fire safety legislation',
      'Evacuation procedures',
      'Fire equipment use',
      'Emergency response',
    ],
    industrySlugs: [
      'retail',
      'healthcare',
      'education',
      'facilities-management',
    ],
    relatedServices: [serviceRef('health-safety', 'fire-risk-assessments')],
    relatedCourses: [courseRef('health-safety', 'fire-safety-awareness')],
    pathwayLevel: 'intermediate',
    keywords: ['fire warden', 'fire marshal', 'evacuation'],
  }),
  defineCourse({
    slug: 'manual-handling',
    category: 'health-safety',
    title: 'Manual Handling Awareness',
    subtitle:
      'Practical training to reduce musculoskeletal injuries and improve safe lifting techniques.',
    icon: 'Briefcase',
    accreditation: 'CPD available on request',
    level: 'foundation',
    price: 'From £45',
    duration: '2 hours',
    deliveryMethodIds: ['on-site', 'online', 'classroom'],
    certification: {
      name: 'Manual Handling Awareness Certificate',
      description:
        'Certificate confirming safe manual handling principles and techniques.',
    },
    assessment: 'Practical lifting assessment and knowledge check.',
    overview: [
      'Manual handling injuries account for a third of all workplace injuries reported to HSE.',
      'This course provides practical techniques and risk awareness to protect workers and employers.',
    ],
    learningObjectives: [
      'Understand manual handling regulations',
      'Apply TILE assessment principles',
      'Demonstrate safe lifting and carrying techniques',
      'Identify when mechanical aids are required',
    ],
    targetAudience: [
      'Warehouse and logistics staff',
      'Healthcare workers',
      'Office and facilities teams',
    ],
    courseOutline: [
      outline('Legal Requirements', [
        'Manual Handling Operations Regulations 1992',
        'Employer duties',
        'Risk assessment',
      ]),
      outline('Safe Techniques', [
        'TILE assessment',
        'Kinetic lifting method',
        'Team handling',
      ]),
      outline('Practical Exercises', [
        'Load assessment',
        'Posture and technique',
        'Mechanical aids',
      ]),
    ],
    learningOutcomes: [
      'Safe lifting techniques',
      'Risk identification',
      'Injury prevention',
      'Legal requirements',
    ],
    industrySlugs: ['logistics', 'warehousing', 'healthcare', 'retail'],
    relatedServices: [serviceRef('health-safety', 'risk-assessments')],
    pathwayLevel: 'foundation',
    keywords: ['manual handling', 'lifting', 'musculoskeletal'],
  }),
  defineCourse({
    slug: 'working-at-height',
    category: 'health-safety',
    title: 'Working at Height',
    subtitle:
      'Essential training for anyone working at height or managing such activities.',
    icon: 'AlertTriangle',
    accreditation: 'CPD available on request',
    level: 'intermediate',
    price: 'From £85',
    duration: 'Half day',
    deliveryMethodIds: ['on-site', 'classroom'],
    certification: {
      name: 'Working at Height Certificate',
      description:
        'Certificate confirming understanding of height safety legislation and controls.',
    },
    assessment: 'Practical equipment inspection and knowledge assessment.',
    overview: [
      'Falls from height remain the leading cause of workplace fatalities in the UK.',
      'This course covers legislation, equipment selection, and rescue planning for work at height.',
    ],
    learningObjectives: [
      'Understand Work at Height Regulations 2005',
      'Select appropriate access equipment',
      'Inspect and use fall protection systems',
      'Plan rescue and emergency procedures',
    ],
    targetAudience: [
      'Construction workers',
      'Maintenance teams',
      'Supervisors managing height work',
    ],
    courseOutline: [
      outline('Legislation & Planning', [
        'Work at Height Regulations',
        'Hierarchy of control',
        'Planning requirements',
      ]),
      outline('Equipment & Systems', [
        'Ladders and scaffolding',
        'MEWPs and harnesses',
        'Collective protection',
      ]),
      outline('Emergency & Rescue', [
        'Rescue planning',
        'Suspension trauma',
        'Inspection records',
      ]),
    ],
    learningOutcomes: [
      'Height safety legislation',
      'Fall prevention',
      'Equipment selection',
      'Rescue procedures',
    ],
    industrySlugs: [
      'construction',
      'facilities-management',
      'energy-utilities',
    ],
    relatedServices: [
      serviceRef('health-safety', 'risk-assessments'),
      serviceRef('health-safety', 'cdm-consultancy'),
    ],
    pathwayLevel: 'intermediate',
    keywords: ['working at height', 'fall protection', 'WAHR'],
  }),
  defineCourse({
    slug: 'coshh-awareness',
    category: 'health-safety',
    title: 'COSHH Awareness',
    subtitle:
      'Control of Substances Hazardous to Health training for safe chemical handling and exposure control.',
    icon: 'FlaskConical',
    accreditation: 'CPD available on request',
    level: 'foundation',
    price: 'From £55',
    duration: '2 hours',
    deliveryMethodIds: ['online', 'classroom', 'on-site'],
    certification: {
      name: 'COSHH Awareness Certificate',
      description:
        'Certificate confirming understanding of hazardous substance control requirements.',
    },
    assessment:
      'Online assessment covering hazard symbols, SDS, and control measures.',
    overview: [
      'COSHH regulations require employers to control exposure to substances that can harm health.',
      'This course covers hazard identification, safety data sheets, and proportionate control measures.',
    ],
    learningObjectives: [
      'Understand COSHH Regulations 2002',
      'Interpret hazard symbols and safety data sheets',
      'Select appropriate control measures',
      'Understand health surveillance requirements',
    ],
    targetAudience: [
      'Laboratory and manufacturing staff',
      'Cleaning and maintenance teams',
      'Supervisors',
    ],
    courseOutline: [
      outline('COSHH Fundamentals', [
        'Legal framework',
        'Hazard vs risk',
        'Routes of exposure',
      ]),
      outline('Assessment & Controls', [
        'COSHH assessments',
        'Hierarchy of control',
        'PPE selection',
      ]),
      outline('Practical Application', [
        'Safety data sheets',
        'Storage and labelling',
        'Spill response',
      ]),
    ],
    learningOutcomes: [
      'COSHH regulations',
      'Hazard identification',
      'Control measures',
      'Safe chemical handling',
    ],
    industrySlugs: ['manufacturing', 'healthcare', 'food-beverage'],
    relatedServices: [serviceRef('health-safety', 'risk-assessments')],
    pathwayLevel: 'foundation',
    keywords: ['COSHH', 'hazardous substances', 'chemical safety'],
  }),
  defineCourse({
    slug: 'first-aid-at-work',
    category: 'health-safety',
    title: 'First Aid at Work',
    subtitle:
      'Comprehensive first aid training to meet workplace emergency requirements under HSE guidance.',
    icon: 'Heart',
    accreditation: 'HSE Approved',
    level: 'intermediate',
    price: 'From £295',
    duration: '3 days',
    deliveryMethodIds: ['on-site', 'classroom'],
    certification: {
      name: 'First Aid at Work Certificate',
      description: 'HSE-recognised qualification valid for three years.',
      accreditedBy: 'HSE-approved training provider standards',
    },
    assessment: 'Practical skills assessment and multiple-choice examination.',
    overview: [
      'Employers must provide adequate first aid provision based on workplace risk assessment.',
      'This three-day course develops competence to manage workplace emergencies until professional help arrives.',
    ],
    learningObjectives: [
      'Assess and manage unconscious casualties',
      'Perform CPR and use AED devices',
      'Treat wounds, burns, and fractures',
      'Manage medical emergencies including anaphylaxis',
    ],
    targetAudience: [
      'Designated workplace first aiders',
      'Health and safety representatives',
      'Supervisors',
    ],
    courseOutline: [
      outline('Emergency Response', [
        'Scene assessment',
        'Primary survey',
        'Calling emergency services',
      ]),
      outline('Life-Threatening Conditions', [
        'CPR and AED',
        'Choking',
        'Severe bleeding',
      ]),
      outline('Injury & Illness Management', [
        'Fractures and sprains',
        'Burns and scalds',
        'Medical conditions',
      ]),
    ],
    learningOutcomes: [
      'Emergency response skills',
      'CPR and AED use',
      'Injury and illness management',
      'HSE compliance',
    ],
    industrySlugs: ['construction', 'manufacturing', 'healthcare', 'education'],
    relatedServices: [serviceRef('occupational-health', 'health-surveillance')],
    pathwayLevel: 'intermediate',
    keywords: ['first aid', 'FAAW', 'workplace emergency'],
  }),
];
