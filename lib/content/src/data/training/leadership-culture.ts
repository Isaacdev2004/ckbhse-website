import { defineCourse, outline, serviceRef, courseRef } from './helpers.js';

export const leadershipCultureCourses = [
  defineCourse({
    slug: 'safety-leadership',
    category: 'leadership-culture',
    title: 'Safety Leadership',
    subtitle:
      'Executive and senior manager training on visible safety leadership and organisational accountability.',
    icon: 'Compass',
    accreditation: 'CPD available on request',
    level: 'leadership',
    price: 'From £395',
    duration: '1 day',
    deliveryMethodIds: ['classroom', 'virtual-instructor-led'],
    certification: {
      name: 'Safety Leadership Certificate',
      description:
        'Certificate confirming senior leadership commitment to health and safety excellence.',
    },
    assessment:
      'Leadership action plan and board-level safety commitment statement.',
    overview: [
      'Safety leadership from the top sets the tone for organisational culture and regulatory compliance.',
      'This course equips directors and senior managers to demonstrate visible, effective safety leadership.',
    ],
    learningObjectives: [
      'Understand director duties and personal accountability',
      'Demonstrate visible safety leadership behaviours',
      'Integrate safety into strategic decision-making',
      'Build board-level safety governance structures',
    ],
    targetAudience: [
      'Directors and executives',
      'Senior managers',
      'Board members',
    ],
    courseOutline: [
      outline('Leadership Accountability', [
        'Director duties',
        'Sentencing guidelines',
        'Corporate manslaughter',
      ]),
      outline('Visible Leadership', [
        'Safety walks',
        'Communication',
        'Resource allocation',
      ]),
      outline('Governance & Strategy', [
        'Safety KPIs',
        'Board reporting',
        'Culture measurement',
      ]),
    ],
    learningOutcomes: [
      'Director accountability',
      'Visible leadership',
      'Safety governance',
      'Strategic integration',
    ],
    industrySlugs: [
      'construction',
      'manufacturing',
      'oil-gas',
      'public-sector',
    ],
    relatedServices: [serviceRef('business-risk', 'governance-support')],
    relatedCourses: [
      courseRef('leadership-culture', 'safety-culture'),
      courseRef('health-safety', 'iosh-managing-safely'),
    ],
    pathwayLevel: 'leadership',
    featured: true,
    keywords: ['safety leadership', 'director duties', 'executive training'],
  }),
  defineCourse({
    slug: 'behavioural-safety',
    category: 'leadership-culture',
    title: 'Behavioural Safety',
    subtitle:
      'Training on human factors, behaviour-based safety programmes, and positive safety culture interventions.',
    icon: 'Users',
    accreditation: 'CPD available on request',
    level: 'intermediate',
    price: 'From £245',
    duration: '1 day',
    deliveryMethodIds: ['classroom', 'on-site'],
    certification: {
      name: 'Behavioural Safety Certificate',
      description:
        'Certificate confirming competence in behaviour-based safety programme design.',
    },
    assessment: 'Behavioural safety observation programme design exercise.',
    overview: [
      'Human behaviour contributes significantly to workplace incidents.',
      'This course introduces behaviour-based safety principles and practical intervention strategies.',
    ],
    learningObjectives: [
      'Understand human factors in workplace safety',
      'Design behaviour-based safety observation programmes',
      'Facilitate positive safety conversations',
      'Measure and sustain behavioural improvements',
    ],
    targetAudience: [
      'Supervisors and team leaders',
      'Health and safety representatives',
      'Training coordinators',
    ],
    courseOutline: [
      outline('Human Factors', [
        'Behaviour models',
        'Error types',
        'Organisational influences',
      ]),
      outline('BBS Programmes', [
        'Observation techniques',
        'Feedback conversations',
        'Data analysis',
      ]),
      outline('Sustainability', [
        'Leadership engagement',
        'Recognition systems',
        'Continuous improvement',
      ]),
    ],
    learningOutcomes: [
      'Human factors awareness',
      'Observation programmes',
      'Safety conversations',
      'Culture improvement',
    ],
    industrySlugs: ['manufacturing', 'construction', 'logistics'],
    relatedServices: [serviceRef('business-risk', 'governance-support')],
    relatedCourses: [courseRef('leadership-culture', 'safety-culture')],
    pathwayLevel: 'intermediate',
    keywords: ['behavioural safety', 'BBS', 'human factors'],
  }),
  defineCourse({
    slug: 'supervisor-development',
    category: 'leadership-culture',
    title: 'Supervisor Development',
    subtitle:
      'Front-line leadership training combining safety management, communication, and team performance.',
    icon: 'Briefcase',
    accreditation: 'CPD available on request',
    level: 'intermediate',
    price: 'From £295',
    duration: '2 days',
    deliveryMethodIds: ['classroom', 'on-site'],
    certification: {
      name: 'Supervisor Development Certificate',
      description:
        'Certificate confirming front-line leadership and safety management competence.',
    },
    assessment: 'Supervisor action plan and team briefing simulation.',
    overview: [
      'Supervisors are the critical link between management policy and front-line safety performance.',
      'This programme develops practical leadership, communication, and hazard management skills.',
    ],
    learningObjectives: [
      'Apply legal duties as a front-line supervisor',
      'Conduct effective toolbox talks and team briefings',
      'Manage hazards and enforce safe working practices',
      'Coach team members on safe behaviour',
    ],
    targetAudience: [
      'Team leaders and supervisors',
      'Charge hands and foremen',
      'Newly promoted managers',
    ],
    courseOutline: [
      outline('Supervisor Role', [
        'Legal duties',
        'Authority and accountability',
        'Leading by example',
      ]),
      outline('Communication Skills', [
        'Toolbox talks',
        'Safety meetings',
        'Difficult conversations',
      ]),
      outline('Hazard Management', [
        'Dynamic risk assessment',
        'Stop work authority',
        'Incident reporting',
      ]),
    ],
    learningOutcomes: [
      'Supervisor duties',
      'Team communication',
      'Hazard management',
      'Coaching skills',
    ],
    industrySlugs: [
      'construction',
      'manufacturing',
      'logistics',
      'warehousing',
    ],
    relatedServices: [serviceRef('health-safety', 'health-safety-audits')],
    relatedCourses: [
      courseRef('health-safety', 'iosh-managing-safely'),
      courseRef('leadership-culture', 'behavioural-safety'),
    ],
    pathwayLevel: 'intermediate',
    keywords: ['supervisor training', 'front-line leadership', 'toolbox talks'],
  }),
  defineCourse({
    slug: 'safety-culture',
    category: 'leadership-culture',
    title: 'Safety Culture',
    subtitle:
      'Strategic training on assessing, developing, and sustaining positive organisational safety culture.',
    icon: 'Lightbulb',
    accreditation: 'CPD available on request',
    level: 'leadership',
    price: 'From £395',
    duration: '1 day',
    deliveryMethodIds: ['classroom', 'virtual-instructor-led'],
    certification: {
      name: 'Safety Culture Certificate',
      description:
        'Certificate confirming competence in safety culture assessment and development.',
    },
    assessment: 'Safety culture assessment and improvement plan development.',
    overview: [
      'Safety culture determines whether policies and procedures translate into sustained safe behaviour.',
      'This course helps leaders assess culture maturity and implement targeted improvement programmes.',
    ],
    learningObjectives: [
      'Define and measure safety culture maturity',
      'Identify cultural barriers to safety performance',
      'Design culture improvement interventions',
      'Embed safety values across all organisational levels',
    ],
    targetAudience: [
      'Directors and senior managers',
      'Health and safety managers',
      'HR and organisational development teams',
    ],
    courseOutline: [
      outline('Culture Fundamentals', [
        'Culture models',
        'Maturity levels',
        'Indicators and measurement',
      ]),
      outline('Assessment Methods', [
        'Surveys and interviews',
        'Behavioural observations',
        'Incident trend analysis',
      ]),
      outline('Improvement Strategies', [
        'Leadership engagement',
        'Communication campaigns',
        'Recognition programmes',
      ]),
    ],
    learningOutcomes: [
      'Culture assessment',
      'Barrier identification',
      'Improvement planning',
      'Sustained engagement',
    ],
    industrySlugs: ['manufacturing', 'oil-gas', 'healthcare', 'public-sector'],
    relatedServices: [serviceRef('business-risk', 'governance-support')],
    relatedCourses: [
      courseRef('leadership-culture', 'safety-leadership'),
      courseRef('leadership-culture', 'behavioural-safety'),
    ],
    pathwayLevel: 'leadership',
    featured: true,
    keywords: [
      'safety culture',
      'culture assessment',
      'organisational development',
    ],
  }),
];
