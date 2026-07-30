import { benefit, defineService } from './helpers.js';

export const isoManagementServices = [
  defineService({
    slug: 'iso-45001',
    category: 'iso-management',
    title: 'ISO 45001',
    subtitle:
      'Occupational health and safety management system certification support.',
    icon: 'Shield',
    summary:
      'ISO 45001 implementation, gap analysis, and certification support for occupational health and safety management.',
    overview: [
      'ISO 45001 is the international standard for OH&S management. We guide organisations from initial gap analysis through certification and ongoing maintenance.',
    ],
    objectives: [
      'Conduct ISO 45001 gap analysis against current practices',
      'Develop OH&S policy, objectives, and documentation',
      'Implement operational controls and performance evaluation',
      'Prepare for stage 1 and stage 2 certification audits',
    ],
    keyBenefits: [
      benefit(
        'Shield',
        'Certification Ready',
        'Structured pathway to ISO 45001 certification.',
      ),
      benefit(
        'Award',
        'International Recognition',
        'Globally recognised OH&S management standard.',
      ),
      benefit(
        'TrendingUp',
        'Continuous Improvement',
        'Built-in review and improvement cycles.',
      ),
    ],
    industrySlugs: ['manufacturing', 'construction', 'logistics'],
    regulations: ['ISO 45001:2018'],
    featured: true,
    relatedServices: [
      { category: 'health-safety', slug: 'safety-management-systems' },
      { category: 'iso-management', slug: 'integrated-management-systems' },
    ],
  }),
  defineService({
    slug: 'iso-14001',
    category: 'iso-management',
    title: 'ISO 14001 Certification',
    subtitle: 'Environmental management system certification and maintenance.',
    icon: 'Leaf',
    summary:
      'Full ISO 14001 certification support including gap analysis, implementation, internal audit, and surveillance preparation.',
    overview: [
      'Achieve and maintain ISO 14001 certification with expert consultancy supporting every stage of the certification lifecycle.',
    ],
    objectives: [
      'Gap analysis against ISO 14001:2015 requirements',
      'Environmental aspects and impacts assessment',
      'Documentation and operational control implementation',
      'Internal audit and management review support',
    ],
    keyBenefits: [
      benefit(
        'Leaf',
        'Environmental Leadership',
        'Demonstrate systematic environmental management.',
      ),
      benefit(
        'Award',
        'Certification Support',
        'Preparation for UKAS-accredited certification bodies.',
      ),
      benefit(
        'Handshake',
        'Client Requirements',
        'Meet supply chain and tender ISO 14001 requirements.',
      ),
    ],
    industrySlugs: ['manufacturing', 'construction', 'logistics'],
    regulations: ['ISO 14001:2015'],
    featured: true,
    relatedServices: [
      { category: 'environmental', slug: 'iso-14001-environmental' },
    ],
  }),
  defineService({
    slug: 'iso-9001',
    category: 'iso-management',
    title: 'ISO 9001',
    subtitle: 'Quality management system certification and implementation.',
    icon: 'Award',
    summary:
      'ISO 9001 quality management system implementation, certification support, and ongoing maintenance.',
    overview: [
      'ISO 9001 demonstrates commitment to quality and customer satisfaction. We support implementation tailored to your operations.',
    ],
    objectives: [
      'Assess current quality management against ISO 9001:2015',
      'Define quality policy, objectives, and process approach',
      'Develop documentation and process controls',
      'Support certification audit preparation',
    ],
    keyBenefits: [
      benefit(
        'Award',
        'Quality Assurance',
        'Systematic approach to quality and customer satisfaction.',
      ),
      benefit(
        'TrendingUp',
        'Process Improvement',
        'Identify inefficiencies and improvement opportunities.',
      ),
      benefit(
        'Briefcase',
        'Commercial Advantage',
        'ISO 9001 often required for tenders and contracts.',
      ),
    ],
    industrySlugs: ['manufacturing', 'healthcare', 'logistics'],
    regulations: ['ISO 9001:2015'],
    relatedServices: [
      { category: 'iso-management', slug: 'integrated-management-systems' },
    ],
  }),
  defineService({
    slug: 'integrated-management-systems',
    category: 'iso-management',
    title: 'Integrated Management Systems',
    subtitle: 'Combine ISO 9001, 14001, and 45001 into a unified IMS.',
    icon: 'ClipboardList',
    summary:
      'Integrate quality, environmental, and health & safety management systems for efficiency and unified certification.',
    overview: [
      'An integrated management system reduces duplication and creates a coherent approach to QHSE across the organisation.',
    ],
    objectives: [
      'Assess integration opportunities across existing systems',
      'Design unified documentation and process structure',
      'Align internal audit and management review processes',
      'Support integrated certification audits',
    ],
    keyBenefits: [
      benefit(
        'ClipboardList',
        'Efficiency',
        'Single system reducing documentation burden.',
      ),
      benefit(
        'Award',
        'Multi-standard Certification',
        'Support for integrated ISO certification audits.',
      ),
      benefit(
        'Users',
        'Organisational Clarity',
        'One framework for QHSE leadership and teams.',
      ),
    ],
    industrySlugs: ['manufacturing', 'construction'],
    regulations: ['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018'],
    relatedServices: [
      { category: 'iso-management', slug: 'iso-9001' },
      { category: 'iso-management', slug: 'iso-14001' },
      { category: 'iso-management', slug: 'iso-45001' },
    ],
  }),
  defineService({
    slug: 'internal-audits',
    category: 'iso-management',
    title: 'Internal Audits',
    subtitle:
      'Independent internal audits for ISO and management system compliance.',
    icon: 'Eye',
    summary:
      'Competent internal audit programmes supporting ISO certification and management system improvement.',
    overview: [
      'Internal audits are a certification requirement and a powerful improvement tool. We deliver audits or train your internal auditors.',
    ],
    objectives: [
      'Plan and conduct internal audits against ISO requirements',
      'Report findings with clear non-conformity classification',
      'Support corrective action and closure verification',
      'Train internal auditors to IRCA-aligned standards',
    ],
    keyBenefits: [
      benefit(
        'Eye',
        'Audit Readiness',
        'Prepare for external certification and surveillance audits.',
      ),
      benefit(
        'BadgeCheck',
        'Competent Auditors',
        'Audits conducted by qualified lead auditors.',
      ),
      benefit(
        'TrendingUp',
        'System Improvement',
        'Findings drive genuine system enhancement.',
      ),
    ],
    industrySlugs: ['manufacturing', 'healthcare', 'logistics'],
    regulations: ['ISO 19011:2018 Guidelines for auditing management systems'],
    relatedServices: [{ category: 'iso-management', slug: 'gap-analysis' }],
  }),
  defineService({
    slug: 'gap-analysis',
    category: 'iso-management',
    title: 'Gap Analysis',
    subtitle: 'Structured gap analysis against ISO and regulatory standards.',
    icon: 'FileCheck',
    summary:
      'Gap analysis identifying the distance between current practice and ISO or regulatory requirements.',
    overview: [
      'Before investing in certification, understand exactly what is needed. Our gap analyses provide clear, prioritised roadmaps.',
    ],
    objectives: [
      'Assess current state against target standard requirements',
      'Identify gaps with severity and effort ratings',
      'Produce implementation roadmap with milestones',
      'Estimate resource and timeline requirements',
    ],
    keyBenefits: [
      benefit(
        'FileCheck',
        'Clear Roadmap',
        'Know exactly what is needed before you commit.',
      ),
      benefit(
        'Clock',
        'Efficient Planning',
        'Avoid wasted effort on unnecessary documentation.',
      ),
      benefit(
        'Target',
        'Prioritised Actions',
        'Focus on highest-impact gaps first.',
      ),
    ],
    industrySlugs: ['manufacturing', 'construction', 'retail'],
    regulations: ['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018'],
    featured: true,
    relatedServices: [
      { category: 'iso-management', slug: 'iso-9001' },
      { category: 'iso-management', slug: 'iso-14001' },
    ],
  }),
];
