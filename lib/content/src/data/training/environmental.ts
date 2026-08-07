import { defineCourse, outline, serviceRef, courseRef } from './helpers.js';

export const environmentalCourses = [
  defineCourse({
    slug: 'environmental-awareness',
    category: 'environmental',
    title: 'Environmental Awareness',
    subtitle:
      'Foundational environmental management training covering pollution prevention and regulatory awareness.',
    icon: 'Leaf',
    accreditation: 'CPD Certified',
    level: 'foundation',
    price: 'From £75',
    duration: 'Half day',
    deliveryMethodIds: ['online', 'classroom'],
    certification: {
      name: 'Environmental Awareness Certificate',
      description:
        'Certificate confirming foundational environmental management knowledge.',
    },
    assessment: 'Online knowledge check with scenario-based questions.',
    overview: [
      'Environmental awareness is essential for organisations seeking to manage their impact responsibly.',
      'This course introduces key environmental issues, legislation, and practical improvement opportunities.',
    ],
    learningObjectives: [
      'Understand key environmental legislation affecting UK businesses',
      'Identify environmental aspects and impacts of operations',
      'Apply pollution prevention principles',
      'Support environmental improvement programmes',
    ],
    targetAudience: ['All employees', 'Supervisors', 'Environmental champions'],
    courseOutline: [
      outline('Environmental Context', [
        'Climate and pollution issues',
        'Corporate responsibility',
        'Stakeholder expectations',
      ]),
      outline('Legislation Overview', [
        'Environmental Protection Act',
        'Waste regulations',
        'Water and air emissions',
      ]),
      outline('Practical Actions', [
        'Resource efficiency',
        'Waste minimisation',
        'Reporting incidents',
      ]),
    ],
    learningOutcomes: [
      'Environmental legislation awareness',
      'Impact identification',
      'Pollution prevention',
      'Improvement culture',
    ],
    industrySlugs: ['manufacturing', 'construction', 'food-beverage'],
    relatedServices: [serviceRef('environmental', 'environmental-compliance')],
    relatedCourses: [courseRef('environmental', 'iso-14001-awareness')],
    pathwayLevel: 'foundation',
    keywords: ['environmental awareness', 'pollution prevention'],
  }),
  defineCourse({
    slug: 'iso-14001-awareness',
    category: 'environmental',
    title: 'ISO 14001 Awareness',
    subtitle:
      'Introduction to ISO 14001 environmental management systems and certification requirements.',
    icon: 'Award',
    accreditation: 'CPD Certified',
    level: 'intermediate',
    price: 'From £195',
    duration: '1 day',
    deliveryMethodIds: ['classroom', 'virtual-instructor-led'],
    certification: {
      name: 'ISO 14001 Awareness Certificate',
      description:
        'Certificate confirming understanding of ISO 14001 EMS requirements.',
    },
    assessment:
      'Written assessment covering EMS clauses and implementation principles.',
    overview: [
      'ISO 14001 provides the framework for effective environmental management systems.',
      "This course explains the standard's requirements and how organisations achieve certification.",
    ],
    learningObjectives: [
      'Explain the Plan-Do-Check-Act cycle in environmental management',
      'Understand ISO 14001 clause requirements',
      'Identify documentation and competence needs',
      'Support internal audit and management review processes',
    ],
    targetAudience: [
      'Environmental managers',
      'Compliance teams',
      'Directors pursuing ISO certification',
    ],
    courseOutline: [
      outline('ISO 14001 Overview', [
        'High-level structure',
        'Context of the organisation',
        'Leadership and policy',
      ]),
      outline('Planning & Operation', [
        'Aspects and impacts',
        'Legal compliance',
        'Operational controls',
      ]),
      outline('Performance Evaluation', [
        'Monitoring and measurement',
        'Internal audit',
        'Management review',
      ]),
    ],
    learningOutcomes: [
      'ISO 14001 structure',
      'EMS implementation',
      'Audit readiness',
      'Continuous improvement',
    ],
    industrySlugs: ['manufacturing', 'construction', 'energy-utilities'],
    relatedServices: [
      serviceRef('iso-management', 'iso-14001'),
      serviceRef('environmental', 'environmental-compliance'),
    ],
    relatedCourses: [
      courseRef('environmental', 'environmental-awareness'),
      courseRef('iso-management', 'iso-14001-internal-auditor'),
    ],
    pathwayLevel: 'intermediate',
    keywords: ['ISO 14001', 'environmental management', 'EMS'],
  }),
  defineCourse({
    slug: 'waste-management',
    category: 'environmental',
    title: 'Waste Management Training',
    subtitle:
      'Practical training on UK waste legislation, duty of care, and sustainable waste management practices.',
    icon: 'Recycle',
    accreditation: 'CPD Certified',
    level: 'intermediate',
    price: 'From £145',
    duration: '1 day',
    deliveryMethodIds: ['classroom', 'on-site'],
    certification: {
      name: 'Waste Management Certificate',
      description:
        'Certificate confirming competence in waste duty of care and classification.',
    },
    assessment: 'Waste classification exercise and regulatory knowledge check.',
    overview: [
      'Waste mismanagement carries significant regulatory and reputational risk.',
      'This course covers duty of care, waste hierarchy, and documentation requirements under UK law.',
    ],
    learningObjectives: [
      'Apply the waste hierarchy in operational decisions',
      'Classify waste correctly using EWC codes',
      'Complete waste transfer notes and consignment documentation',
      'Select and audit licensed waste carriers',
    ],
    targetAudience: [
      'Facilities managers',
      'Operations supervisors',
      'Environmental coordinators',
    ],
    courseOutline: [
      outline('Waste Legislation', [
        'Duty of care',
        'Environmental Protection Act',
        'Hazardous waste regulations',
      ]),
      outline('Classification & Handling', [
        'EWC codes',
        'Segregation requirements',
        'Storage standards',
      ]),
      outline('Documentation & Compliance', [
        'Transfer notes',
        'Consignment notes',
        'Record keeping',
      ]),
    ],
    learningOutcomes: [
      'Waste hierarchy',
      'Duty of care',
      'Documentation compliance',
      'Carrier selection',
    ],
    industrySlugs: ['manufacturing', 'construction', 'healthcare'],
    relatedServices: [serviceRef('environmental', 'waste-management')],
    pathwayLevel: 'intermediate',
    keywords: ['waste management', 'duty of care', 'EWC codes'],
  }),
  defineCourse({
    slug: 'environmental-compliance',
    category: 'environmental',
    title: 'Environmental Compliance',
    subtitle:
      'Comprehensive training on environmental permit compliance, monitoring, and enforcement response.',
    icon: 'Scale',
    accreditation: 'CPD Certified',
    level: 'advanced',
    price: 'From £295',
    duration: '2 days',
    deliveryMethodIds: ['classroom', 'virtual-instructor-led'],
    certification: {
      name: 'Environmental Compliance Certificate',
      description:
        'Advanced certificate for environmental compliance managers and officers.',
    },
    assessment: 'Case study analysis and compliance plan development exercise.',
    overview: [
      'Environmental compliance requires understanding of permits, monitoring obligations, and enforcement powers.',
      'This course prepares managers to maintain compliance and respond effectively to regulatory scrutiny.',
    ],
    learningObjectives: [
      'Interpret environmental permits and conditions',
      'Design monitoring and reporting programmes',
      'Manage non-compliance and enforcement interactions',
      'Implement corrective and preventive actions',
    ],
    targetAudience: [
      'Environmental managers',
      'Compliance officers',
      'Directors with environmental accountability',
    ],
    prerequisites: [
      'Environmental Awareness or equivalent experience recommended',
    ],
    courseOutline: [
      outline('Regulatory Framework', [
        'Permitting regimes',
        'Regulator powers',
        'Enforcement options',
      ]),
      outline('Compliance Management', [
        'Monitoring programmes',
        'Reporting obligations',
        'Record management',
      ]),
      outline('Incident Response', [
        'Pollution incidents',
        'Notification requirements',
        'Remediation planning',
      ]),
    ],
    learningOutcomes: [
      'Permit compliance',
      'Monitoring programmes',
      'Enforcement response',
      'Corrective actions',
    ],
    industrySlugs: ['manufacturing', 'oil-gas', 'energy-utilities'],
    relatedServices: [serviceRef('environmental', 'environmental-compliance')],
    pathwayLevel: 'advanced',
    keywords: ['environmental compliance', 'permits', 'EA enforcement'],
  }),
];
