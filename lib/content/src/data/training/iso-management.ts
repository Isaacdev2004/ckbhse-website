import { defineCourse, outline, serviceRef, courseRef } from './helpers.js';

export const isoManagementCourses = [
  defineCourse({
    slug: 'iso-45001-internal-auditor',
    category: 'iso-management',
    title: 'ISO 45001 Internal Auditor',
    subtitle:
      'Develop competence to plan, conduct, and report internal audits against ISO 45001 occupational health and safety management systems.',
    icon: 'ShieldCheck',
    accreditation: 'CPD Certified',
    level: 'advanced',
    price: 'From £495',
    duration: '2 days',
    deliveryMethodIds: ['classroom', 'virtual-instructor-led'],
    certification: {
      name: 'ISO 45001 Internal Auditor Certificate',
      description:
        'Certificate confirming internal audit competence for ISO 45001 management systems.',
    },
    assessment: 'Mock audit exercise and auditor report submission.',
    overview: [
      'Internal audits are essential for maintaining ISO 45001 certification and driving continual improvement.',
      'This course develops practical audit skills aligned to ISO 19011 auditing guidelines.',
    ],
    learningObjectives: [
      'Plan and scope ISO 45001 internal audits',
      'Conduct audit interviews and gather objective evidence',
      'Identify nonconformities and opportunities for improvement',
      'Prepare audit reports and verify corrective actions',
    ],
    targetAudience: [
      'Health and safety managers',
      'Quality auditors',
      'Management system coordinators',
    ],
    prerequisites: ['ISO 45001 awareness or equivalent experience recommended'],
    courseOutline: [
      outline('Audit Principles', [
        'ISO 19011 guidelines',
        'Audit programme management',
        'Competence requirements',
      ]),
      outline('ISO 45001 Requirements', [
        'Clause-by-clause review',
        'Documentation review',
        'Process auditing',
      ]),
      outline('Practical Audit Skills', [
        'Interview techniques',
        'Evidence gathering',
        'Reporting nonconformities',
      ]),
    ],
    learningOutcomes: [
      'Audit planning',
      'Evidence gathering',
      'Nonconformity reporting',
      'Corrective action verification',
    ],
    industrySlugs: ['manufacturing', 'construction', 'oil-gas'],
    relatedServices: [
      serviceRef('iso-management', 'iso-45001'),
      serviceRef('iso-management', 'internal-audits'),
    ],
    relatedCourses: [
      courseRef('iso-management', 'integrated-management-systems'),
    ],
    pathwayLevel: 'advanced',
    keywords: ['ISO 45001', 'internal auditor', 'OHSMS'],
  }),
  defineCourse({
    slug: 'iso-9001-awareness',
    category: 'iso-management',
    title: 'ISO 9001 Awareness',
    subtitle:
      'Introduction to ISO 9001 quality management systems and certification requirements.',
    icon: 'BadgeCheck',
    accreditation: 'CPD Certified',
    level: 'intermediate',
    price: 'From £195',
    duration: '1 day',
    deliveryMethodIds: ['classroom', 'online'],
    certification: {
      name: 'ISO 9001 Awareness Certificate',
      description:
        'Certificate confirming understanding of ISO 9001 quality management requirements.',
    },
    assessment: 'Written assessment on QMS principles and clause requirements.',
    overview: [
      "ISO 9001 is the world's most widely adopted quality management standard.",
      "This course explains the standard's structure and how organisations achieve and maintain certification.",
    ],
    learningObjectives: [
      'Explain quality management principles',
      'Understand ISO 9001 high-level structure and key clauses',
      'Identify documentation and process requirements',
      'Support internal audit and management review activities',
    ],
    targetAudience: [
      'Quality managers',
      'Operations supervisors',
      'Directors pursuing ISO certification',
    ],
    courseOutline: [
      outline('Quality Management Principles', [
        'Customer focus',
        'Process approach',
        'Continual improvement',
      ]),
      outline('ISO 9001 Structure', [
        'Context and leadership',
        'Planning and support',
        'Operation and evaluation',
      ]),
      outline('Implementation Overview', [
        'Documentation',
        'Process mapping',
        'Performance measurement',
      ]),
    ],
    learningOutcomes: [
      'QMS principles',
      'ISO 9001 structure',
      'Documentation requirements',
      'Audit readiness',
    ],
    industrySlugs: ['manufacturing', 'logistics', 'healthcare'],
    relatedServices: [serviceRef('iso-management', 'iso-9001')],
    relatedCourses: [
      courseRef('iso-management', 'integrated-management-systems'),
    ],
    pathwayLevel: 'intermediate',
    keywords: ['ISO 9001', 'quality management', 'QMS'],
  }),
  defineCourse({
    slug: 'iso-14001-internal-auditor',
    category: 'iso-management',
    title: 'ISO 14001 Internal Auditor',
    subtitle:
      'Develop competence to audit environmental management systems against ISO 14001 requirements.',
    icon: 'Leaf',
    accreditation: 'CPD Certified',
    level: 'advanced',
    price: 'From £495',
    duration: '2 days',
    deliveryMethodIds: ['classroom', 'virtual-instructor-led'],
    certification: {
      name: 'ISO 14001 Internal Auditor Certificate',
      description:
        'Certificate confirming internal audit competence for ISO 14001 EMS.',
    },
    assessment: 'Environmental audit simulation and report submission.',
    overview: [
      'Effective EMS auditing drives environmental performance and certification maintenance.',
      'This course combines ISO 14001 requirements with practical audit methodology.',
    ],
    learningObjectives: [
      'Plan environmental management system audits',
      'Evaluate aspects, impacts, and legal compliance',
      'Conduct audit interviews and site inspections',
      'Report findings and track corrective actions',
    ],
    targetAudience: [
      'Environmental managers',
      'Quality auditors',
      'Compliance officers',
    ],
    prerequisites: ['ISO 14001 Awareness recommended'],
    courseOutline: [
      outline('EMS Audit Framework', [
        'ISO 19011 application',
        'Audit planning',
        'Risk-based auditing',
      ]),
      outline('ISO 14001 Deep Dive', [
        'Aspects and impacts',
        'Legal compliance',
        'Operational controls',
      ]),
      outline('Audit Execution', [
        'Site inspection',
        'Evidence evaluation',
        'Reporting',
      ]),
    ],
    learningOutcomes: [
      'EMS audit planning',
      'Compliance evaluation',
      'Finding reporting',
      'Corrective action tracking',
    ],
    industrySlugs: ['manufacturing', 'energy-utilities', 'food-beverage'],
    relatedServices: [
      serviceRef('iso-management', 'iso-14001'),
      serviceRef('iso-management', 'internal-audits'),
    ],
    relatedCourses: [courseRef('environmental', 'iso-14001-awareness')],
    pathwayLevel: 'advanced',
    keywords: ['ISO 14001', 'internal auditor', 'EMS'],
  }),
  defineCourse({
    slug: 'integrated-management-systems',
    category: 'iso-management',
    title: 'Integrated Management Systems',
    subtitle:
      'Training on integrating ISO 9001, 14001, and 45001 into a unified management system approach.',
    icon: 'Target',
    accreditation: 'CPD Certified',
    level: 'advanced',
    price: 'From £395',
    duration: '2 days',
    deliveryMethodIds: ['classroom', 'virtual-instructor-led'],
    certification: {
      name: 'Integrated Management Systems Certificate',
      description:
        'Certificate confirming competence in IMS design and implementation.',
    },
    assessment: 'IMS integration plan development and gap analysis exercise.',
    overview: [
      'Integrated management systems reduce duplication and improve efficiency across quality, environmental, and safety disciplines.',
      'This course explains how to align processes, documentation, and audits across multiple ISO standards.',
    ],
    learningObjectives: [
      'Understand the high-level structure common to ISO management standards',
      'Identify integration opportunities across QMS, EMS, and OHSMS',
      'Design unified documentation and audit programmes',
      'Implement integrated management review processes',
    ],
    targetAudience: [
      'Management system managers',
      'Directors',
      'Consultants implementing IMS',
    ],
    prerequisites: [
      'Awareness of at least one ISO management standard recommended',
    ],
    courseOutline: [
      outline('IMS Fundamentals', [
        'High-level structure',
        'Common requirements',
        'Integration benefits',
      ]),
      outline('Process Integration', [
        'Unified procedures',
        'Shared objectives',
        'Combined audits',
      ]),
      outline('Implementation Strategy', [
        'Gap analysis',
        'Migration planning',
        'Certification approach',
      ]),
    ],
    learningOutcomes: [
      'IMS design',
      'Process alignment',
      'Unified auditing',
      'Certification strategy',
    ],
    industrySlugs: ['manufacturing', 'construction', 'oil-gas'],
    relatedServices: [
      serviceRef('iso-management', 'integrated-management-systems'),
      serviceRef('iso-management', 'gap-analysis'),
    ],
    pathwayLevel: 'advanced',
    featured: true,
    keywords: ['integrated management', 'IMS', 'ISO integration'],
  }),
];
