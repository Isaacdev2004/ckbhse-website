import { benefit, defineService } from './helpers.js';

export const complianceRegulatoryServices = [
  defineService({
    slug: 'legal-compliance-reviews',
    category: 'compliance-regulatory',
    title: 'Legal Compliance Reviews',
    subtitle:
      'Comprehensive review of health, safety, and environmental legal registers.',
    icon: 'Scale',
    summary:
      'Legal compliance reviews ensuring your legal register is current, complete, and reflected in operational controls.',
    overview: [
      'Legislation changes frequently. We maintain and review legal registers to keep your compliance position defensible.',
    ],
    objectives: [
      'Identify applicable legislation for your operations',
      'Assess compliance status against each requirement',
      'Update legal registers and compliance matrices',
      'Recommend actions for identified gaps',
    ],
    keyBenefits: [
      benefit(
        'Scale',
        'Legal Assurance',
        'Current legal register maintained by specialists.',
      ),
      benefit(
        'ShieldCheck',
        'Director Due Diligence',
        'Support for board-level compliance reporting.',
      ),
      benefit(
        'FileCheck',
        'Audit Evidence',
        'Documented compliance status for inspections.',
      ),
    ],
    industrySlugs: ['manufacturing', 'construction', 'healthcare'],
    regulations: [
      'Health and Safety at Work etc. Act 1974',
      'Environment Act 2021',
    ],
    relatedServices: [
      { category: 'compliance-regulatory', slug: 'compliance-audits' },
    ],
  }),
  defineService({
    slug: 'compliance-audits',
    category: 'compliance-regulatory',
    title: 'Compliance Audits',
    subtitle: 'Independent audits of regulatory and policy compliance.',
    icon: 'ShieldCheck',
    summary:
      'Compliance audits verifying adherence to HSE, environmental, and internal policy requirements.',
    overview: [
      'Compliance audits provide assurance to leadership, clients, and regulators that obligations are being met.',
    ],
    objectives: [
      'Audit against regulatory and policy requirements',
      'Sample documentation and on-site verification',
      'Report findings with risk-based prioritisation',
      'Track corrective action closure',
    ],
    keyBenefits: [
      benefit(
        'ShieldCheck',
        'Independent Assurance',
        'Objective compliance verification.',
      ),
      benefit(
        'ClipboardList',
        'Risk Prioritisation',
        'Focus resources on highest-impact gaps.',
      ),
      benefit(
        'Eye',
        'Verification',
        'On-site and documentary evidence combined.',
      ),
    ],
    industrySlugs: ['construction', 'manufacturing', 'logistics'],
    regulations: ['Management of Health and Safety at Work Regulations 1999'],
    relatedServices: [
      { category: 'health-safety', slug: 'health-safety-audits' },
      { category: 'compliance-regulatory', slug: 'legal-compliance-reviews' },
    ],
  }),
  defineService({
    slug: 'policy-development',
    category: 'compliance-regulatory',
    title: 'Policy Development',
    subtitle:
      'Develop and review organisational policies across HSE disciplines.',
    icon: 'BookOpen',
    summary:
      'Policy development services creating clear, compliant, and operational policies for your organisation.',
    overview: [
      'Policies must reflect legal requirements and how work is done. We develop policies that teams understand and follow.',
    ],
    objectives: [
      'Draft policies aligned to legal and best practice requirements',
      'Review existing policies for currency and usability',
      'Support approval and communication processes',
      'Integrate policies with management systems',
    ],
    keyBenefits: [
      benefit(
        'BookOpen',
        'Clear Policies',
        'Documentation that supports compliance and culture.',
      ),
      benefit(
        'Scale',
        'Legal Alignment',
        'Policies reviewed against current UK legislation.',
      ),
      benefit(
        'Users',
        'Stakeholder Buy-in',
        'Policies developed with input from operational teams.',
      ),
    ],
    industrySlugs: ['healthcare', 'retail', 'manufacturing'],
    regulations: ['Health and Safety at Work etc. Act 1974'],
    relatedServices: [
      { category: 'health-safety', slug: 'safety-policies-procedures' },
    ],
  }),
  defineService({
    slug: 'contractor-management',
    category: 'compliance-regulatory',
    title: 'Contractor Management',
    subtitle: 'Contractor HSE vetting, induction, and performance monitoring.',
    icon: 'Handshake',
    summary:
      'Contractor management systems ensuring supply chain safety, competence, and compliance.',
    overview: [
      'Principal contractors and clients retain responsibility for contractor HSE performance. We help you manage that risk systematically.',
    ],
    objectives: [
      'Design contractor vetting and pre-qualification processes',
      'Develop induction and briefing requirements',
      'Monitor contractor performance on site',
      'Manage non-conformance and improvement',
    ],
    keyBenefits: [
      benefit(
        'Handshake',
        'Supply Chain Assurance',
        'Confident contractor selection and management.',
      ),
      benefit(
        'Shield',
        'Reduced Liability',
        'Demonstrate control of contractor HSE risks.',
      ),
      benefit(
        'ClipboardList',
        'Systematic Approach',
        'Repeatable processes for all contractors.',
      ),
    ],
    industrySlugs: ['construction', 'manufacturing', 'oil-gas'],
    regulations: ['Construction (Design and Management) Regulations 2015'],
    relatedServices: [{ category: 'health-safety', slug: 'cdm-consultancy' }],
  }),
  defineService({
    slug: 'documentation-reviews',
    category: 'compliance-regulatory',
    title: 'Documentation Reviews',
    subtitle:
      'Review and improve HSE documentation for compliance and usability.',
    icon: 'FileCheck',
    summary:
      'Expert review of RAMS, policies, procedures, and compliance documentation.',
    overview: [
      'Documentation reviews identify gaps, inconsistencies, and improvement opportunities before audits or incidents occur.',
    ],
    objectives: [
      'Review documentation against legal and best practice requirements',
      'Identify gaps, inconsistencies, and outdated content',
      'Recommend improvements and standardisation',
      'Support document control and version management',
    ],
    keyBenefits: [
      benefit(
        'FileCheck',
        'Document Assurance',
        'Documentation suitable for audit and site use.',
      ),
      benefit(
        'Clock',
        'Pre-audit Preparation',
        'Fix issues before external audits.',
      ),
      benefit('Lightbulb', 'Usability', 'Documents that workers actually use.'),
    ],
    industrySlugs: ['construction', 'manufacturing', 'logistics'],
    regulations: ['Management of Health and Safety at Work Regulations 1999'],
    relatedServices: [{ category: 'health-safety', slug: 'risk-assessments' }],
  }),
  defineService({
    slug: 'competent-person-services',
    category: 'compliance-regulatory',
    title: 'Competent Person Services',
    subtitle:
      'Retained competent person advisory for health, safety, and fire.',
    icon: 'BadgeCheck',
    summary:
      'Competent person services providing ongoing HSE advisory access without full-time internal resource.',
    overview: [
      'Many organisations require competent person support but cannot justify a full-time appointment. Our retained service fills that gap.',
    ],
    objectives: [
      'Provide named competent person advisory cover',
      'Support policy, risk assessment, and incident response',
      'Attend site as required under retainer terms',
      'Liaise with regulators on your behalf when needed',
    ],
    keyBenefits: [
      benefit(
        'BadgeCheck',
        'Qualified Cover',
        'IOSH/NEBOSH qualified competent person advisory.',
      ),
      benefit(
        'Clock',
        'Responsive Support',
        'Priority access under retainer agreements.',
      ),
      benefit(
        'Briefcase',
        'Cost Effective',
        'Senior expertise without full-time salary cost.',
      ),
    ],
    industrySlugs: ['retail', 'healthcare', 'construction'],
    regulations: ['Health and Safety at Work etc. Act 1974'],
    featured: true,
    relatedServices: [
      { category: 'health-safety', slug: 'health-safety-audits' },
      { category: 'compliance-regulatory', slug: 'legal-compliance-reviews' },
    ],
  }),
];
