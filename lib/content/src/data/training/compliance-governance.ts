import { defineCourse, outline, serviceRef, courseRef } from './helpers.js';

export const complianceGovernanceCourses = [
  defineCourse({
    slug: 'cdm-regulations',
    category: 'compliance-governance',
    title: 'CDM Regulations Training',
    subtitle:
      'Comprehensive training on Construction (Design and Management) Regulations 2015 duties and documentation.',
    icon: 'Building2',
    accreditation: 'CPD Certified',
    level: 'intermediate',
    price: 'From £245',
    duration: '1 day',
    deliveryMethodIds: ['classroom', 'on-site', 'virtual-instructor-led'],
    certification: {
      name: 'CDM Regulations Certificate',
      description:
        'Certificate confirming understanding of CDM 2015 duty holder responsibilities.',
    },
    assessment:
      'CDM documentation review exercise and duty holder scenario assessment.',
    overview: [
      'CDM 2015 applies to all construction projects and defines clear duties for clients, designers, and contractors.',
      'This course ensures duty holders understand their legal obligations and required documentation.',
    ],
    learningObjectives: [
      'Identify CDM duty holders and their responsibilities',
      'Understand pre-construction information requirements',
      'Develop and review construction phase plans',
      'Manage principal designer and principal contractor appointments',
    ],
    targetAudience: [
      'Clients and developers',
      'Project managers',
      'Designers and contractors',
    ],
    courseOutline: [
      outline('CDM Framework', [
        'Regulatory overview',
        'Duty holder roles',
        'Competence requirements',
      ]),
      outline('Documentation', [
        'Pre-construction information',
        'Construction phase plan',
        'Health and safety file',
      ]),
      outline('Project Management', [
        'Notification thresholds',
        'Coordination requirements',
        'Design risk management',
      ]),
    ],
    learningOutcomes: [
      'CDM duties',
      'Documentation requirements',
      'Duty holder competence',
      'Project coordination',
    ],
    industrySlugs: ['construction', 'facilities-management'],
    relatedServices: [serviceRef('health-safety', 'cdm-consultancy')],
    relatedCourses: [
      courseRef('compliance-governance', 'contractor-management'),
    ],
    pathwayLevel: 'intermediate',
    keywords: ['CDM', 'construction regulations', 'duty holders'],
  }),
  defineCourse({
    slug: 'contractor-management',
    category: 'compliance-governance',
    title: 'Contractor Management Training',
    subtitle:
      'Training on selecting, managing, and monitoring contractors to ensure compliance and safe working.',
    icon: 'Handshake',
    accreditation: 'CPD Certified',
    level: 'intermediate',
    price: 'From £195',
    duration: '1 day',
    deliveryMethodIds: ['classroom', 'virtual-instructor-led'],
    certification: {
      name: 'Contractor Management Certificate',
      description:
        'Certificate confirming competence in contractor selection and oversight.',
    },
    assessment: 'Contractor assessment checklist development and case study.',
    overview: [
      'Clients and principal contractors retain legal duties for contractor activities on their sites.',
      'This course covers selection criteria, induction, monitoring, and performance management.',
    ],
    learningObjectives: [
      'Apply contractor selection and pre-qualification criteria',
      'Develop contractor management procedures',
      'Conduct effective contractor induction and briefing',
      'Monitor contractor performance and enforce standards',
    ],
    targetAudience: [
      'Facilities managers',
      'Project managers',
      'Health and safety advisors',
    ],
    courseOutline: [
      outline('Legal Duties', [
        'Client responsibilities',
        'Contractor duties',
        'Shared sites',
      ]),
      outline('Selection & Induction', [
        'Pre-qualification',
        'Insurance and competence checks',
        'Site induction',
      ]),
      outline('Monitoring & Review', [
        'Performance KPIs',
        'Audit and inspection',
        'Non-compliance management',
      ]),
    ],
    learningOutcomes: [
      'Contractor selection',
      'Induction procedures',
      'Performance monitoring',
      'Legal compliance',
    ],
    industrySlugs: ['construction', 'facilities-management', 'manufacturing'],
    relatedServices: [
      serviceRef('compliance-regulatory', 'contractor-management'),
    ],
    relatedCourses: [courseRef('compliance-governance', 'cdm-regulations')],
    pathwayLevel: 'intermediate',
    keywords: ['contractor management', 'competence', 'pre-qualification'],
  }),
  defineCourse({
    slug: 'legal-compliance',
    category: 'compliance-governance',
    title: 'Legal Compliance Training',
    subtitle:
      'Training for managers on UK health, safety, and environmental legal duties and enforcement.',
    icon: 'Scale',
    accreditation: 'CPD Certified',
    level: 'intermediate',
    price: 'From £245',
    duration: '1 day',
    deliveryMethodIds: ['classroom', 'virtual-instructor-led'],
    certification: {
      name: 'Legal Compliance Certificate',
      description:
        'Certificate confirming understanding of UK H&S and environmental legal framework.',
    },
    assessment: 'Legal scenario analysis and compliance action plan.',
    overview: [
      'Directors and managers face personal accountability for health and safety failures.',
      'This course provides a practical overview of UK legislation, enforcement, and due diligence.',
    ],
    learningObjectives: [
      'Understand key UK health and safety legislation',
      'Explain director and manager duties under HSWA and related regulations',
      'Respond appropriately to enforcement notices and investigations',
      'Demonstrate due diligence through documented systems',
    ],
    targetAudience: [
      'Directors and senior managers',
      'Compliance officers',
      'Health and safety managers',
    ],
    courseOutline: [
      outline('Legal Framework', [
        'HSWA 1974',
        'Regulations and ACOPs',
        'Environmental law overview',
      ]),
      outline('Enforcement', [
        'HSE powers',
        'Fees for intervention',
        'Prosecution and sentencing',
      ]),
      outline('Due Diligence', [
        'Reasonably practicable',
        'Documentation',
        'Board reporting',
      ]),
    ],
    learningOutcomes: [
      'Legal framework',
      'Director duties',
      'Enforcement response',
      'Due diligence',
    ],
    industrySlugs: ['construction', 'manufacturing', 'public-sector'],
    relatedServices: [
      serviceRef('compliance-regulatory', 'legal-compliance-reviews'),
    ],
    pathwayLevel: 'intermediate',
    keywords: ['legal compliance', 'HSWA', 'director duties'],
  }),
  defineCourse({
    slug: 'incident-investigation',
    category: 'compliance-governance',
    title: 'Incident Investigation Training',
    subtitle:
      'Structured training on investigating workplace incidents, near misses, and root cause analysis.',
    icon: 'AlertCircle',
    accreditation: 'CPD Certified',
    level: 'advanced',
    price: 'From £295',
    duration: '1 day',
    deliveryMethodIds: ['classroom', 'on-site'],
    certification: {
      name: 'Incident Investigation Certificate',
      description:
        'Certificate confirming competence in structured incident investigation methodology.',
    },
    assessment: 'Mock incident investigation and root cause analysis report.',
    overview: [
      'Thorough incident investigation prevents recurrence and demonstrates regulatory compliance.',
      'This course teaches structured investigation techniques including root cause analysis and reporting.',
    ],
    learningObjectives: [
      'Apply structured incident investigation methodology',
      'Gather and preserve evidence effectively',
      'Conduct root cause analysis using recognised tools',
      'Prepare investigation reports and recommend corrective actions',
    ],
    targetAudience: [
      'Health and safety managers',
      'Supervisors',
      'HR and compliance teams',
    ],
    prerequisites: [
      'Risk Assessment Training or equivalent experience recommended',
    ],
    courseOutline: [
      outline('Investigation Principles', [
        'Legal requirements',
        'Immediate response',
        'Evidence preservation',
      ]),
      outline('Analysis Techniques', [
        '5 Whys',
        'Fishbone diagrams',
        'Human factors',
      ]),
      outline('Reporting & Follow-up', [
        'Report structure',
        'Corrective actions',
        'Lessons learned',
      ]),
    ],
    learningOutcomes: [
      'Investigation methodology',
      'Root cause analysis',
      'Evidence gathering',
      'Corrective actions',
    ],
    industrySlugs: ['manufacturing', 'construction', 'logistics'],
    relatedServices: [serviceRef('health-safety', 'accident-investigation')],
    relatedCourses: [courseRef('health-safety', 'risk-assessment')],
    pathwayLevel: 'advanced',
    keywords: ['incident investigation', 'root cause', 'RCA'],
  }),
];
