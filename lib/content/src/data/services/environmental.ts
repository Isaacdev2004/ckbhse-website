import { benefit, defineService } from './helpers.js';

export const environmentalServices = [
  defineService({
    slug: 'environmental-compliance',
    category: 'environmental',
    title: 'Environmental Compliance',
    subtitle:
      'Ensure your operations meet UK environmental regulations and permit conditions.',
    icon: 'Leaf',
    summary:
      'Environmental compliance advisory covering permits, pollution prevention, and regulatory liaison with the Environment Agency.',
    overview: [
      'Navigating environmental regulation requires specialist knowledge. We help you understand obligations and maintain compliant operations.',
      'Support includes permit applications, compliance audits, and improvement planning.',
    ],
    objectives: [
      'Map applicable environmental legislation and permit conditions',
      'Assess current compliance status and gaps',
      'Develop improvement plans and monitoring regimes',
      'Support Environment Agency and local authority engagement',
    ],
    keyBenefits: [
      benefit(
        'Leaf',
        'Regulatory Navigation',
        'Clear guidance on complex environmental requirements.',
      ),
      benefit(
        'ShieldCheck',
        'Permit Support',
        'Application and compliance support for environmental permits.',
      ),
      benefit(
        'Recycle',
        'Sustainable Operations',
        'Balance compliance with sustainability objectives.',
      ),
    ],
    industrySlugs: ['manufacturing', 'construction', 'oil-gas'],
    regulations: [
      'Environmental Permitting (England and Wales) Regulations 2016',
      'Environment Act 2021',
    ],
    featured: true,
    relatedServices: [
      { category: 'environmental', slug: 'environmental-audits' },
      { category: 'iso-management', slug: 'iso-14001' },
    ],
  }),
  defineService({
    slug: 'iso-14001-environmental',
    category: 'environmental',
    title: 'ISO 14001 Environmental Systems',
    subtitle:
      'Environmental management system implementation aligned to ISO 14001:2015.',
    icon: 'Award',
    summary:
      'Implement and maintain ISO 14001 environmental management systems with gap analysis, documentation, and certification support.',
    overview: [
      'ISO 14001 provides a framework for managing environmental impacts systematically. We guide you from gap analysis through certification.',
    ],
    objectives: [
      'Conduct ISO 14001 gap analysis',
      'Develop environmental policy and objectives',
      'Implement operational controls and monitoring',
      'Prepare for certification audit',
    ],
    keyBenefits: [
      benefit(
        'Award',
        'Certification Pathway',
        'Structured route to ISO 14001 certification.',
      ),
      benefit(
        'TrendingUp',
        'Performance Improvement',
        'Measurable environmental performance gains.',
      ),
      benefit(
        'Handshake',
        'Stakeholder Confidence',
        'Demonstrate environmental commitment to clients and investors.',
      ),
    ],
    industrySlugs: ['manufacturing', 'construction', 'logistics'],
    regulations: ['ISO 14001:2015 Environmental Management Systems'],
    relatedServices: [{ category: 'iso-management', slug: 'iso-14001' }],
  }),
  defineService({
    slug: 'waste-management',
    category: 'environmental',
    title: 'Waste Management',
    subtitle: 'Waste classification, duty of care, and reduction planning.',
    icon: 'Recycle',
    summary:
      'Waste management consultancy ensuring duty of care compliance and optimised waste reduction strategies.',
    overview: [
      'We support waste audits, classification, contractor due diligence, and waste minimisation programmes.',
    ],
    objectives: [
      'Audit waste streams and disposal routes',
      'Verify duty of care documentation',
      'Identify waste reduction and recycling opportunities',
      'Support hazardous waste compliance',
    ],
    keyBenefits: [
      benefit(
        'Recycle',
        'Cost Reduction',
        'Identify waste minimisation and recycling savings.',
      ),
      benefit(
        'FileCheck',
        'Duty of Care',
        'Compliant waste transfer and documentation.',
      ),
      benefit(
        'Leaf',
        'Environmental Impact',
        'Reduce landfill and improve sustainability metrics.',
      ),
    ],
    industrySlugs: ['manufacturing', 'construction', 'retail'],
    regulations: [
      'Environmental Protection Act 1990',
      'Waste (England and Wales) Regulations 2011',
    ],
    relatedServices: [
      { category: 'environmental', slug: 'environmental-compliance' },
    ],
  }),
  defineService({
    slug: 'environmental-audits',
    category: 'environmental',
    title: 'Environmental Audits',
    subtitle: 'Independent environmental compliance and performance audits.',
    icon: 'Eye',
    summary:
      'Structured environmental audits assessing compliance, permit conditions, and management system effectiveness.',
    overview: [
      'Environmental audits provide assurance for leadership, regulators, and certification bodies.',
    ],
    objectives: [
      'Assess compliance with permits and legislation',
      'Evaluate environmental management controls',
      'Identify improvement opportunities',
      'Report findings with prioritised actions',
    ],
    keyBenefits: [
      benefit(
        'Eye',
        'Independent Review',
        'Objective assessment from IEMA-qualified consultants.',
      ),
      benefit(
        'ClipboardList',
        'Prioritised Actions',
        'Clear roadmap for environmental improvements.',
      ),
      benefit(
        'Award',
        'Audit Readiness',
        'Prepare for ISO 14001 and regulatory inspections.',
      ),
    ],
    industrySlugs: ['manufacturing', 'oil-gas', 'construction'],
    regulations: [
      'ISO 14001:2015',
      'Environmental Permitting Regulations 2016',
    ],
    relatedServices: [
      { category: 'environmental', slug: 'environmental-compliance' },
    ],
  }),
  defineService({
    slug: 'sustainability-planning',
    category: 'environmental',
    title: 'Sustainability Planning',
    subtitle:
      'Strategic sustainability programmes aligned to business objectives.',
    icon: 'Lightbulb',
    summary:
      'Develop sustainability strategies, targets, and programmes that integrate with operations and stakeholder expectations.',
    overview: [
      'We help organisations define meaningful sustainability goals and implementation plans beyond compliance.',
    ],
    objectives: [
      'Assess current sustainability performance and material topics',
      'Define targets and KPIs aligned to business strategy',
      'Develop implementation roadmaps and governance',
      'Support stakeholder reporting and communication',
    ],
    keyBenefits: [
      benefit(
        'Lightbulb',
        'Strategic Alignment',
        'Sustainability integrated with business planning.',
      ),
      benefit(
        'TrendingUp',
        'Measurable Progress',
        'KPIs and reporting frameworks for accountability.',
      ),
      benefit(
        'Handshake',
        'Stakeholder Value',
        'Meet investor and client ESG expectations.',
      ),
    ],
    industrySlugs: ['manufacturing', 'retail', 'construction'],
    regulations: ['Environment Act 2021', 'TCFD reporting guidance'],
    relatedServices: [
      { category: 'business-risk', slug: 'esg-advisory' },
      { category: 'environmental', slug: 'carbon-reduction' },
    ],
  }),
  defineService({
    slug: 'carbon-reduction',
    category: 'environmental',
    title: 'Carbon Reduction Support',
    subtitle: 'Carbon footprint assessment and net-zero pathway planning.',
    icon: 'TrendingUp',
    summary:
      'Measure, manage, and reduce organisational carbon emissions with practical reduction strategies.',
    overview: [
      'Carbon reduction requires baseline measurement, target setting, and operational change. We guide you through each stage.',
    ],
    objectives: [
      'Establish carbon baseline and boundaries',
      'Identify reduction opportunities across scopes 1–3',
      'Develop net-zero or reduction pathway',
      'Support reporting and verification readiness',
    ],
    keyBenefits: [
      benefit(
        'TrendingUp',
        'Data-driven Plans',
        'Evidence-based reduction strategies.',
      ),
      benefit(
        'Leaf',
        'Regulatory Alignment',
        'Support for SECR and emerging disclosure requirements.',
      ),
      benefit(
        'Award',
        'Reputation',
        'Demonstrate climate commitment to stakeholders.',
      ),
    ],
    industrySlugs: ['manufacturing', 'logistics', 'retail'],
    regulations: [
      'Streamlined Energy and Carbon Reporting (SECR)',
      'Climate Change Act 2008',
    ],
    relatedServices: [
      { category: 'environmental', slug: 'sustainability-planning' },
    ],
  }),
  defineService({
    slug: 'environmental-risk-assessments',
    category: 'environmental',
    title: 'Environmental Risk Assessments',
    subtitle: 'Assess and control environmental risks from your operations.',
    icon: 'AlertTriangle',
    summary:
      'Environmental risk assessments identifying pollution pathways, receptor sensitivity, and control measures.',
    overview: [
      'Structured ERA supports permit applications, incident prevention, and due diligence for acquisitions and projects.',
    ],
    objectives: [
      'Identify environmental hazards and receptors',
      'Evaluate risk significance and existing controls',
      'Recommend additional controls and monitoring',
      'Document findings for regulatory and internal use',
    ],
    keyBenefits: [
      benefit(
        'AlertTriangle',
        'Risk Visibility',
        'Clear understanding of environmental exposure.',
      ),
      benefit(
        'Shield',
        'Incident Prevention',
        'Proactive controls before pollution events occur.',
      ),
      benefit(
        'FileCheck',
        'Due Diligence',
        'Support for transactions and project approvals.',
      ),
    ],
    industrySlugs: ['construction', 'oil-gas', 'manufacturing'],
    regulations: ['Environmental Permitting Regulations 2016'],
    relatedServices: [
      { category: 'environmental', slug: 'environmental-audits' },
    ],
  }),
];
