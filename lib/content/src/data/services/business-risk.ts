import { benefit, defineService } from './helpers.js';

export const businessRiskServices = [
  defineService({
    slug: 'enterprise-risk',
    category: 'business-risk',
    title: 'Enterprise Risk',
    subtitle:
      'Enterprise-wide risk identification, assessment, and governance.',
    icon: 'Target',
    summary:
      'Enterprise risk advisory integrating HSE, operational, and strategic risks into unified governance frameworks.',
    overview: [
      'Enterprise risk management connects HSE with broader business risk. We help boards and leadership teams see the full picture.',
    ],
    objectives: [
      'Identify and categorise enterprise-level risks',
      'Assess likelihood, impact, and control effectiveness',
      'Integrate HSE risks into enterprise risk registers',
      'Support board reporting and risk appetite alignment',
    ],
    keyBenefits: [
      benefit(
        'Target',
        'Strategic Alignment',
        'HSE risks visible at board level.',
      ),
      benefit(
        'Scale',
        'Integrated Governance',
        'Unified risk framework across disciplines.',
      ),
      benefit(
        'TrendingUp',
        'Informed Decisions',
        'Risk data supporting strategic planning.',
      ),
    ],
    industrySlugs: ['manufacturing', 'oil-gas', 'healthcare'],
    regulations: ['UK Corporate Governance Code', 'Companies Act 2006'],
    relatedServices: [
      { category: 'business-risk', slug: 'operational-risk' },
      { category: 'business-risk', slug: 'governance-support' },
    ],
  }),
  defineService({
    slug: 'operational-risk',
    category: 'business-risk',
    title: 'Operational Risk',
    subtitle:
      'Operational risk assessment and control for day-to-day activities.',
    icon: 'AlertTriangle',
    summary:
      'Operational risk consultancy identifying and controlling risks in processes, equipment, and human factors.',
    overview: [
      'Operational risks drive incidents and disruption. We assess and help control risks at process and task level.',
    ],
    objectives: [
      'Map operational processes and associated risks',
      'Assess control effectiveness and gaps',
      'Recommend practical risk reduction measures',
      'Integrate with business continuity planning',
    ],
    keyBenefits: [
      benefit(
        'AlertTriangle',
        'Risk Visibility',
        'Clear view of operational exposure.',
      ),
      benefit(
        'Shield',
        'Incident Reduction',
        'Targeted controls reducing loss events.',
      ),
      benefit(
        'ClipboardList',
        'Process Focus',
        'Risk management embedded in operations.',
      ),
    ],
    industrySlugs: ['manufacturing', 'logistics', 'construction'],
    regulations: ['Health and Safety at Work etc. Act 1974'],
    relatedServices: [{ category: 'business-risk', slug: 'enterprise-risk' }],
  }),
  defineService({
    slug: 'business-continuity',
    category: 'business-risk',
    title: 'Business Continuity',
    subtitle: 'Business continuity planning and resilience advisory.',
    icon: 'Shield',
    summary:
      'Business continuity planning ensuring your organisation can maintain critical operations during disruption.',
    overview: [
      'Effective business continuity plans protect revenue, reputation, and people during incidents ranging from IT failure to major accidents.',
    ],
    objectives: [
      'Conduct business impact analysis',
      'Identify critical processes and recovery requirements',
      'Develop business continuity and recovery plans',
      'Test and exercise plans with staff',
    ],
    keyBenefits: [
      benefit('Shield', 'Resilience', 'Preparedness for disruption events.'),
      benefit(
        'Clock',
        'Recovery Planning',
        'Defined RTOs and RPOs for critical processes.',
      ),
      benefit(
        'Users',
        'Staff Readiness',
        'Teams trained on continuity procedures.',
      ),
    ],
    industrySlugs: ['healthcare', 'manufacturing', 'retail'],
    regulations: [
      'ISO 22301:2019 Security and resilience — Business continuity management systems',
    ],
    relatedServices: [{ category: 'business-risk', slug: 'crisis-management' }],
  }),
  defineService({
    slug: 'crisis-management',
    category: 'business-risk',
    title: 'Crisis Management',
    subtitle: 'Crisis response planning and incident command support.',
    icon: 'AlertCircle',
    summary:
      'Crisis management advisory including response plans, media handling guidance, and incident command support.',
    overview: [
      'When crises occur, structured response protects people and reputation. We help you prepare and respond effectively.',
    ],
    objectives: [
      'Develop crisis management and communication plans',
      'Define roles, escalation, and decision-making protocols',
      'Support live crisis response when incidents occur',
      'Conduct post-incident reviews and plan updates',
    ],
    keyBenefits: [
      benefit(
        'AlertCircle',
        'Rapid Response',
        'Structured crisis response when it matters most.',
      ),
      benefit(
        'Users',
        'Clear Roles',
        'Defined responsibilities during high-pressure events.',
      ),
      benefit(
        'Handshake',
        'Reputation Protection',
        'Communication strategies protecting brand trust.',
      ),
    ],
    industrySlugs: ['oil-gas', 'healthcare', 'construction'],
    regulations: ['Civil Contingencies Act 2004'],
    relatedServices: [
      { category: 'health-safety', slug: 'accident-investigation' },
      { category: 'business-risk', slug: 'business-continuity' },
    ],
  }),
  defineService({
    slug: 'governance-support',
    category: 'business-risk',
    title: 'Governance Support',
    subtitle: 'HSE governance advisory for boards and senior leadership.',
    icon: 'Scale',
    summary:
      'Governance support helping boards and directors meet HSE due diligence and reporting obligations.',
    overview: [
      'Directors have personal duties regarding health and safety. We support governance structures that demonstrate due diligence.',
    ],
    objectives: [
      'Advise on director HSE duties and liabilities',
      'Support board reporting and KPI frameworks',
      'Review governance structures and accountability',
      'Prepare for regulatory or coroner scrutiny',
    ],
    keyBenefits: [
      benefit(
        'Scale',
        'Director Protection',
        'Demonstrate reasonable steps and due diligence.',
      ),
      benefit(
        'Eye',
        'Board Reporting',
        'Clear HSE KPIs for leadership oversight.',
      ),
      benefit(
        'BadgeCheck',
        'Governance Assurance',
        'Structures suitable for audit and review.',
      ),
    ],
    industrySlugs: ['manufacturing', 'construction', 'healthcare'],
    regulations: [
      'Health and Safety at Work etc. Act 1974',
      'UK Corporate Governance Code',
    ],
    relatedServices: [{ category: 'business-risk', slug: 'enterprise-risk' }],
  }),
  defineService({
    slug: 'esg-advisory',
    category: 'business-risk',
    title: 'ESG Advisory',
    subtitle:
      'Environmental, social, and governance advisory for corporate reporting.',
    icon: 'Recycle',
    summary:
      'ESG advisory supporting disclosure, strategy, and stakeholder reporting across environmental, social, and governance domains.',
    overview: [
      'ESG expectations from investors, clients, and regulators continue to grow. We help you develop credible ESG programmes and reporting.',
    ],
    objectives: [
      'Assess ESG material topics and current performance',
      'Develop ESG strategy and target frameworks',
      'Support TCFD, SECR, and voluntary disclosure',
      'Integrate ESG with HSE management systems',
    ],
    keyBenefits: [
      benefit(
        'Recycle',
        'Integrated ESG',
        'Connect environmental, social, and governance reporting.',
      ),
      benefit(
        'TrendingUp',
        'Investor Confidence',
        'Credible ESG data for stakeholders.',
      ),
      benefit(
        'Handshake',
        'Supply Chain',
        'Meet client and tender ESG requirements.',
      ),
    ],
    industrySlugs: ['manufacturing', 'retail', 'construction'],
    regulations: [
      'TCFD recommendations',
      'Streamlined Energy and Carbon Reporting',
    ],
    featured: true,
    relatedServices: [
      { category: 'environmental', slug: 'sustainability-planning' },
      { category: 'environmental', slug: 'carbon-reduction' },
    ],
    relatedCaseStudies: [
      {
        slug: 'iso-45001-certification',
        title: 'Manufacturing ISO 45001 Certification',
        href: '/case-studies/manufacturing/iso-45001-certification',
      },
    ],
  }),
];
