import {
  defineResource,
  p,
  h2,
  ul,
  serviceRef,
  courseRef,
  resourceRef,
} from './helpers.js';

const cdmBody = [
  p(
    'The Construction (Design and Management) Regulations 2015 place clear duties on clients, designers, principal designers, principal contractors, and contractors. Understanding these roles is essential for any construction project in the UK.',
  ),
  h2('Client duties'),
  p(
    'Clients must make suitable arrangements for managing projects, provide pre-construction information, and ensure principal designer and principal contractor appointments where required.',
  ),
  ul([
    'Appoint competent duty holders',
    'Allow sufficient time and resources',
    'Ensure pre-construction information is prepared',
    'Notify HSE for notifiable projects',
  ]),
  h2('Documentation requirements'),
  p(
    'Key documents include the construction phase plan, health and safety file, and pre-construction information. These must be kept up to date and shared with relevant duty holders.',
  ),
];

export const articleResources = [
  defineResource({
    slug: 'understanding-cdm-2015',
    type: 'articles',
    title: 'Understanding CDM 2015: A Guide for Construction Clients',
    subtitle:
      'Critical duties under CDM 2015 for clients, designers, and contractors.',
    icon: 'Building2',
    summary:
      'The Construction (Design and Management) Regulations 2015 place critical duties on clients, designers, and contractors. Learn what compliance really means.',
    author: 'Sarah Mitchell',
    publishDate: 'March 15, 2024',
    readingTime: '8 min read',
    body: cdmBody,
    tags: ['CDM', 'construction', 'regulations'],
    industrySlugs: ['construction'],
    relatedServices: [
      serviceRef('health-safety', 'cdm-consultancy'),
      serviceRef('compliance-regulatory', 'contractor-management'),
    ],
    relatedCourses: [courseRef('compliance-governance', 'cdm-regulations')],
    relatedResources: [
      resourceRef('guides', 'risk-assessment-practitioner-guide'),
      resourceRef('templates', 'risk-assessment-template'),
    ],
    featured: true,
    keywords: ['CDM 2015', 'construction client duties'],
  }),
  defineResource({
    slug: 'iso-45001-implementation',
    type: 'articles',
    title: 'ISO 45001:2018 Implementation: A Step-by-Step Roadmap',
    subtitle:
      'Practical guidance on implementing an occupational health and safety management system.',
    icon: 'ShieldCheck',
    summary:
      'Practical guidance on transitioning to or implementing ISO 45001, the international standard for occupational health and safety management systems.',
    author: 'Dr. James Parker',
    publishDate: 'March 10, 2024',
    readingTime: '10 min read',
    body: [
      p(
        'ISO 45001 provides a framework for managing occupational health and safety risks and opportunities. Implementation requires leadership commitment, worker participation, and continual improvement.',
      ),
      h2('Gap analysis'),
      p(
        'Begin with a structured gap analysis against ISO 45001 clauses to identify current strengths and areas requiring development.',
      ),
      h2('Implementation phases'),
      ul([
        'Context and leadership commitment',
        'Planning and risk assessment',
        'Support and competence',
        'Operational controls',
        'Performance evaluation and audit',
      ]),
    ],
    tags: ['ISO 45001', 'management systems', 'OHSMS'],
    industrySlugs: ['manufacturing', 'construction'],
    relatedServices: [serviceRef('iso-management', 'iso-45001')],
    relatedCourses: [courseRef('iso-management', 'iso-45001-internal-auditor')],
    featured: true,
    keywords: ['ISO 45001 implementation'],
  }),
  defineResource({
    slug: 'workplace-mental-health',
    type: 'articles',
    title: 'Managing Workplace Mental Health: Legal Duties and Best Practice',
    subtitle:
      'Employer obligations and practical support strategies for workplace wellbeing.',
    icon: 'Heart',
    summary:
      'Mental health is a critical component of workplace safety. Explore employer obligations under HSE guidance and practical support strategies.',
    author: 'Emma Richardson',
    publishDate: 'March 5, 2024',
    readingTime: '6 min read',
    body: [
      p(
        'Employers have a legal duty to protect workers from stress-related ill health as part of general health and safety obligations.',
      ),
      h2('Risk factors'),
      ul([
        'Excessive workload',
        'Poor management support',
        'Organisational change',
        'Lone working',
      ]),
      h2('Support strategies'),
      p(
        'Implement stress risk assessments, train managers, and provide access to occupational health and employee assistance programmes.',
      ),
    ],
    tags: ['wellbeing', 'mental health', 'occupational health'],
    industrySlugs: ['healthcare', 'education', 'public-sector'],
    relatedServices: [
      serviceRef('occupational-health', 'wellbeing-programmes'),
    ],
    relatedCourses: [courseRef('occupational-health', 'workplace-wellbeing')],
    keywords: ['workplace mental health'],
  }),
  defineResource({
    slug: 'fire-risk-assessment-guide',
    type: 'articles',
    title: 'Fire Risk Assessment: Meeting Your Legal Obligations',
    subtitle:
      'A comprehensive guide to fire risk assessments under the Fire Safety Order.',
    icon: 'Flame',
    summary:
      'A comprehensive guide to conducting fire risk assessments under the Regulatory Reform (Fire Safety) Order 2005.',
    author: 'Michael Chen',
    publishDate: 'February 28, 2024',
    readingTime: '7 min read',
    body: [
      p(
        'The Responsible Person must ensure a suitable and sufficient fire risk assessment is conducted and reviewed regularly.',
      ),
      h2('Five-step approach'),
      ul([
        'Identify fire hazards',
        'Identify people at risk',
        'Evaluate and act',
        'Record and plan',
        'Review',
      ]),
    ],
    tags: ['fire safety', 'risk assessment'],
    industrySlugs: ['retail', 'healthcare', 'education'],
    relatedServices: [serviceRef('health-safety', 'fire-risk-assessments')],
    relatedCourses: [courseRef('health-safety', 'fire-safety-awareness')],
    keywords: ['fire risk assessment'],
  }),
  defineResource({
    slug: 'coshh-assessments-explained',
    type: 'articles',
    title:
      'COSHH Assessments Explained: Protecting Workers from Chemical Hazards',
    subtitle:
      'Step-by-step guidance on COSHH assessments and control measures.',
    icon: 'FlaskConical',
    summary:
      'Step-by-step guidance on conducting Control of Substances Hazardous to Health assessments and implementing effective control measures.',
    author: 'Sarah Mitchell',
    publishDate: 'February 22, 2024',
    readingTime: '9 min read',
    body: [
      p(
        'COSHH requires employers to prevent or adequately control exposure to hazardous substances.',
      ),
      h2('Assessment steps'),
      ul([
        'Identify hazardous substances',
        'Consider routes of exposure',
        'Select control measures',
        'Review and monitor',
      ]),
    ],
    tags: ['COSHH', 'chemical safety'],
    industrySlugs: ['manufacturing', 'healthcare'],
    relatedServices: [serviceRef('health-safety', 'risk-assessments')],
    relatedCourses: [courseRef('health-safety', 'coshh-awareness')],
    keywords: ['COSHH assessment'],
  }),
  defineResource({
    slug: 'incident-investigation-techniques',
    type: 'articles',
    title: 'Incident Investigation Techniques: Root Cause Analysis in Practice',
    subtitle:
      'Proven methodologies to identify underlying causes and prevent recurrence.',
    icon: 'AlertCircle',
    summary:
      'Learn proven investigation methodologies to identify underlying causes and prevent future workplace incidents.',
    author: 'Dr. James Parker',
    publishDate: 'February 15, 2024',
    readingTime: '11 min read',
    body: [
      p(
        'Effective incident investigation goes beyond immediate causes to identify systemic failures and prevent recurrence.',
      ),
      h2('Investigation methodology'),
      ul([
        'Secure the scene',
        'Gather evidence',
        'Analyse root causes',
        'Recommend corrective actions',
        'Verify closure',
      ]),
    ],
    tags: ['incident investigation', 'root cause analysis'],
    industrySlugs: ['manufacturing', 'construction', 'logistics'],
    relatedServices: [serviceRef('health-safety', 'accident-investigation')],
    relatedCourses: [
      courseRef('compliance-governance', 'incident-investigation'),
    ],
    keywords: ['incident investigation'],
  }),
  defineResource({
    slug: 'environmental-compliance-manufacturing',
    type: 'articles',
    title: 'Environmental Compliance for Manufacturing: Beyond ISO 14001',
    subtitle:
      'Navigate environmental regulations affecting UK manufacturing operations.',
    icon: 'Leaf',
    summary:
      'Navigate the complex landscape of environmental regulations affecting UK manufacturing operations, from emissions to waste management.',
    author: 'Emma Richardson',
    publishDate: 'February 8, 2024',
    readingTime: '8 min read',
    body: [
      p(
        'Manufacturing operations face multiple environmental compliance obligations beyond ISO 14001 certification.',
      ),
      h2('Key regulatory areas'),
      ul([
        'Environmental permits',
        'Waste duty of care',
        'Emissions monitoring',
        'Water discharge consents',
      ]),
    ],
    tags: ['environmental', 'manufacturing', 'compliance'],
    industrySlugs: ['manufacturing'],
    relatedServices: [serviceRef('environmental', 'environmental-compliance')],
    relatedCourses: [courseRef('environmental', 'environmental-compliance')],
    keywords: ['environmental compliance manufacturing'],
  }),
  defineResource({
    slug: 'health-surveillance-guide',
    type: 'articles',
    title: 'When is Health Surveillance Required? A Practical Guide',
    subtitle:
      'Legal requirements and best practices for health surveillance programmes.',
    icon: 'Eye',
    summary:
      'Understanding legal requirements and best practices for implementing health surveillance programs in high-risk industries.',
    author: 'Michael Chen',
    publishDate: 'February 1, 2024',
    readingTime: '7 min read',
    body: [
      p(
        'Health surveillance is required when workplace exposure cannot be adequately controlled and there is a identifiable disease or adverse health effect.',
      ),
      h2('When surveillance is required'),
      ul([
        'COSHH exposure limits',
        'Noise regulations',
        'Vibration regulations',
        'Asbestos exposure',
      ]),
    ],
    tags: ['health surveillance', 'occupational health'],
    industrySlugs: ['manufacturing', 'construction'],
    relatedServices: [serviceRef('occupational-health', 'health-surveillance')],
    relatedCourses: [
      courseRef('occupational-health', 'health-surveillance-awareness'),
    ],
    keywords: ['health surveillance'],
  }),
  defineResource({
    slug: 'puwer-compliance-overview',
    type: 'articles',
    title: 'PUWER Compliance: Work Equipment Safety Essentials',
    subtitle:
      'Understanding the Provision and Use of Work Equipment Regulations 1998.',
    icon: 'Factory',
    summary:
      'An overview of PUWER duties for employers regarding work equipment selection, maintenance, inspection, and training.',
    author: 'Sarah Mitchell',
    publishDate: 'January 20, 2024',
    readingTime: '6 min read',
    body: [
      p(
        'PUWER requires that work equipment is suitable, maintained, inspected, and used only by trained and authorised persons.',
      ),
      h2('Employer duties'),
      ul([
        'Suitable equipment for the task',
        'Maintenance and inspection regimes',
        'Information and training',
        'Protection from dangerous parts',
      ]),
    ],
    tags: ['PUWER', 'machinery safety', 'manufacturing'],
    industrySlugs: ['manufacturing'],
    relatedServices: [serviceRef('health-safety', 'risk-assessments')],
    keywords: ['PUWER compliance'],
  }),
  defineResource({
    slug: 'display-screen-equipment',
    type: 'articles',
    title: 'DSE Assessments: Protecting Office and Hybrid Workers',
    subtitle:
      'Practical guidance on Display Screen Equipment regulations and workstation setup.',
    icon: 'Briefcase',
    summary:
      'How to conduct DSE assessments and reduce musculoskeletal risks for office-based and hybrid workers.',
    author: 'Emma Richardson',
    publishDate: 'January 12, 2024',
    readingTime: '5 min read',
    body: [
      p(
        'The Health and Safety (Display Screen Equipment) Regulations require employers to analyse workstations and reduce risks.',
      ),
      h2('Assessment checklist'),
      ul([
        'Screen position and glare',
        'Keyboard and mouse placement',
        'Chair adjustability',
        'Breaks and eye tests',
      ]),
    ],
    tags: ['DSE', 'office safety', 'ergonomics'],
    industrySlugs: ['retail', 'public-sector', 'education'],
    relatedServices: [serviceRef('occupational-health', 'workplace-health')],
    keywords: ['DSE assessment'],
  }),
];
