import { defineCourse, outline, serviceRef } from './helpers.js';

export const occupationalHealthCourses = [
  defineCourse({
    slug: 'workplace-wellbeing',
    category: 'occupational-health',
    title: 'Workplace Wellbeing',
    subtitle:
      'Training for managers and HR teams on promoting mental health, wellbeing, and productive workplace culture.',
    icon: 'Heart',
    accreditation: 'CPD available on request',
    level: 'intermediate',
    price: 'From £175',
    duration: '1 day',
    deliveryMethodIds: ['classroom', 'virtual-instructor-led'],
    certification: {
      name: 'Workplace Wellbeing Certificate',
      description:
        'Certificate confirming competence in workplace wellbeing programme design.',
    },
    assessment: 'Wellbeing action plan development and peer review.',
    overview: [
      'Workplace wellbeing directly impacts productivity, retention, and safety performance.',
      'This course equips managers to recognise stress indicators and implement supportive interventions.',
    ],
    learningObjectives: [
      'Understand the business case for workplace wellbeing',
      'Identify signs of stress and mental ill-health',
      'Implement reasonable adjustments and support pathways',
      'Design wellbeing initiatives aligned to organisational culture',
    ],
    targetAudience: [
      'Line managers',
      'HR professionals',
      'Health and safety representatives',
    ],
    courseOutline: [
      outline('Wellbeing Foundations', [
        'Mental health statistics',
        'Legal duties',
        'Organisational culture',
      ]),
      outline('Manager Responsibilities', [
        'Conversation skills',
        'Signposting support',
        'Reasonable adjustments',
      ]),
      outline('Programme Design', [
        'Wellbeing initiatives',
        'Measuring impact',
        'Sustainability',
      ]),
    ],
    learningOutcomes: [
      'Stress recognition',
      'Support pathways',
      'Wellbeing programmes',
      'Legal awareness',
    ],
    industrySlugs: ['healthcare', 'education', 'public-sector'],
    relatedServices: [
      serviceRef('occupational-health', 'wellbeing-programmes'),
    ],
    pathwayLevel: 'intermediate',
    keywords: ['wellbeing', 'mental health', 'workplace stress'],
  }),
  defineCourse({
    slug: 'health-surveillance-awareness',
    category: 'occupational-health',
    title: 'Health Surveillance Awareness',
    subtitle:
      'Understanding health surveillance requirements under UK occupational health regulations.',
    icon: 'Eye',
    accreditation: 'CPD available on request',
    level: 'intermediate',
    price: 'From £145',
    duration: 'Half day',
    deliveryMethodIds: ['online', 'classroom'],
    certification: {
      name: 'Health Surveillance Awareness Certificate',
      description:
        'Certificate confirming understanding of health surveillance programme requirements.',
    },
    assessment: 'Scenario-based assessment on surveillance programme design.',
    overview: [
      'Health surveillance is required where workplace exposure cannot be adequately controlled.',
      'This course explains legal requirements, programme design, and record management.',
    ],
    learningObjectives: [
      'Understand when health surveillance is legally required',
      'Design proportionate surveillance programmes',
      'Manage occupational health records confidentially',
      'Act on surveillance results and fitness-for-work decisions',
    ],
    targetAudience: [
      'Health and safety managers',
      'HR professionals',
      'Occupational health coordinators',
    ],
    courseOutline: [
      outline('Legal Requirements', [
        'COSHH and noise regulations',
        'When surveillance is required',
        'Competent assessors',
      ]),
      outline('Programme Design', [
        'Baseline assessments',
        'Periodic reviews',
        'Exit assessments',
      ]),
      outline('Records & Action', [
        'Confidentiality',
        'Fitness for work',
        'Trend analysis',
      ]),
    ],
    learningOutcomes: [
      'Surveillance requirements',
      'Programme design',
      'Record management',
      'Action on results',
    ],
    industrySlugs: ['manufacturing', 'construction', 'healthcare'],
    relatedServices: [serviceRef('occupational-health', 'health-surveillance')],
    pathwayLevel: 'intermediate',
    keywords: ['health surveillance', 'occupational health', 'COSHH'],
  }),
  defineCourse({
    slug: 'occupational-hygiene',
    category: 'occupational-health',
    title: 'Occupational Hygiene',
    subtitle:
      'Training on exposure assessment, monitoring, and control of workplace health hazards.',
    icon: 'FlaskConical',
    accreditation: 'CPD available on request',
    level: 'advanced',
    price: 'From £295',
    duration: '2 days',
    deliveryMethodIds: ['classroom', 'on-site'],
    certification: {
      name: 'Occupational Hygiene Certificate',
      description:
        'Advanced certificate in workplace exposure assessment and control.',
    },
    assessment: 'Exposure assessment project and control plan submission.',
    overview: [
      'Occupational hygiene focuses on identifying and controlling health hazards in the workplace.',
      'This course covers exposure assessment, monitoring techniques, and engineering controls.',
    ],
    learningObjectives: [
      'Identify occupational health hazards and exposure routes',
      'Conduct qualitative and quantitative exposure assessments',
      'Select and evaluate engineering and administrative controls',
      'Interpret monitoring results and recommend actions',
    ],
    targetAudience: [
      'Health and safety professionals',
      'Occupational hygienists in training',
      'Engineering managers',
    ],
    prerequisites: ['COSHH Awareness recommended'],
    courseOutline: [
      outline('Hazard Identification', [
        'Chemical, physical, biological agents',
        'Exposure routes',
        'WELs and OELs',
      ]),
      outline('Assessment Methods', [
        'Qualitative exposure assessment',
        'Air monitoring',
        'Biological monitoring',
      ]),
      outline('Control Strategies', [
        'Engineering controls',
        'Administrative controls',
        'PPE as last resort',
      ]),
    ],
    learningOutcomes: [
      'Exposure assessment',
      'Monitoring techniques',
      'Control selection',
      'WEL compliance',
    ],
    industrySlugs: ['manufacturing', 'oil-gas', 'healthcare'],
    relatedServices: [
      serviceRef('occupational-health', 'occupational-hygiene'),
    ],
    pathwayLevel: 'advanced',
    keywords: ['occupational hygiene', 'exposure assessment', 'WEL'],
  }),
];
