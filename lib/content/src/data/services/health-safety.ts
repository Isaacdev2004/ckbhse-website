import { benefit, defineService } from './helpers.js';

export const healthSafetyServices = [
  defineService({
    slug: 'health-safety-audits',
    category: 'health-safety',
    title: 'Health & Safety Audits',
    subtitle:
      'Independent workplace audits assessing HSE compliance, hazard control, and management system effectiveness.',
    icon: 'Shield',
    summary:
      'Comprehensive health and safety audits to identify compliance gaps, prioritise risk reduction, and strengthen your safety management approach.',
    overview: [
      'Our health and safety audits provide an independent assessment of your workplace against UK HSE requirements and industry best practice.',
      'Audits cover policy, procedures, site conditions, documentation, and leadership engagement — delivering a defensible compliance position.',
    ],
    objectives: [
      'Assess compliance with Health and Safety at Work etc. Act 1974 and relevant regulations',
      'Identify hazards and evaluate the effectiveness of existing controls',
      'Benchmark performance against sector standards and best practice',
      'Provide prioritised recommendations with clear ownership and timelines',
    ],
    keyBenefits: [
      benefit(
        'ShieldCheck',
        'Regulatory Confidence',
        'Demonstrate due diligence to regulators, clients, and insurers.',
      ),
      benefit(
        'Eye',
        'Independent Assurance',
        'Objective assessment from qualified IOSH and NEBOSH consultants.',
      ),
      benefit(
        'ClipboardList',
        'Actionable Reporting',
        'Prioritised findings mapped to risk and compliance impact.',
      ),
    ],
    industrySlugs: ['construction', 'manufacturing', 'logistics', 'healthcare'],
    regulations: [
      'Health and Safety at Work etc. Act 1974',
      'Management of Health and Safety at Work Regulations 1999',
      'Workplace (Health, Safety and Welfare) Regulations 1992',
    ],
    featured: true,
    relatedServices: [
      { category: 'health-safety', slug: 'workplace-inspections' },
      { category: 'compliance-regulatory', slug: 'compliance-audits' },
    ],
    keywords: ['health and safety audit', 'HSE audit', 'workplace compliance'],
  }),
  defineService({
    slug: 'risk-assessments',
    category: 'health-safety',
    title: 'Risk Assessments & RAMS',
    subtitle:
      'Task-specific risk assessments and method statements tailored to your operations and regulatory obligations.',
    icon: 'FileCheck',
    summary:
      'Professional risk assessments and RAMS development to control workplace hazards and satisfy CDM, PUWER, and general HSE duties.',
    overview: [
      'We deliver general, task-specific, and COSHH-aligned risk assessments that reflect how work is actually performed on site.',
      'Method statements and RAMS packages support contractors, principal contractors, and in-house teams with clear, auditable safety planning.',
    ],
    objectives: [
      'Identify hazards and evaluate risk for people affected by your work',
      'Define proportionate control measures aligned to hierarchy of control',
      'Produce RAMS suitable for client, principal contractor, and site approval',
      'Support competence records and briefing requirements',
    ],
    keyBenefits: [
      benefit(
        'FileCheck',
        'Defensible Documentation',
        'Assessments suitable for HSE, client, and insurer scrutiny.',
      ),
      benefit(
        'Users',
        'Worker Engagement',
        'Practical assessments developed with those who do the work.',
      ),
      benefit(
        'Clock',
        'Fast Turnaround',
        'Critical RAMS delivered within agreed SLA windows.',
      ),
    ],
    industrySlugs: ['construction', 'manufacturing', 'logistics', 'oil-gas'],
    regulations: [
      'Management of Health and Safety at Work Regulations 1999',
      'Construction (Design and Management) Regulations 2015',
      'Provision and Use of Work Equipment Regulations 1998',
    ],
    featured: true,
    relatedServices: [
      { category: 'health-safety', slug: 'cdm-consultancy' },
      { category: 'health-safety', slug: 'safety-policies-procedures' },
    ],
  }),
  defineService({
    slug: 'workplace-inspections',
    category: 'health-safety',
    title: 'Workplace Inspections',
    subtitle:
      'Scheduled and ad-hoc site inspections to monitor safety performance and maintain compliance.',
    icon: 'Eye',
    summary:
      'Regular workplace inspections identifying hazards, verifying controls, and driving continuous improvement across your sites.',
    overview: [
      'Our consultants conduct structured inspections using agreed checklists aligned to your hazards and regulatory profile.',
      'Inspection programmes can be standalone or integrated with retained advisory and audit services.',
    ],
    objectives: [
      'Verify implementation of risk controls and safe systems of work',
      'Identify emerging hazards and non-conformances promptly',
      'Track closure of corrective actions over time',
      'Support safety culture through visible leadership and feedback',
    ],
    keyBenefits: [
      benefit(
        'Eye',
        'Proactive Monitoring',
        'Identify issues before they become incidents or enforcement actions.',
      ),
      benefit(
        'TrendingUp',
        'Performance Tracking',
        'Trend analysis across sites and business units.',
      ),
      benefit(
        'Handshake',
        'Retainer Integration',
        'Seamlessly combined with ongoing advisory support.',
      ),
    ],
    industrySlugs: ['construction', 'manufacturing', 'retail', 'healthcare'],
    regulations: [
      'Health and Safety at Work etc. Act 1974',
      'Management of Health and Safety at Work Regulations 1999',
    ],
    relatedServices: [
      { category: 'health-safety', slug: 'health-safety-audits' },
    ],
  }),
  defineService({
    slug: 'accident-investigation',
    category: 'health-safety',
    title: 'Accident Investigation',
    subtitle:
      'Rigorous investigation of accidents and near-misses with root cause analysis and corrective action planning.',
    icon: 'AlertCircle',
    summary:
      'Professional incident investigation supporting RIDDOR compliance, regulatory liaison, and prevention of recurrence.',
    overview: [
      'When incidents occur, rapid, structured investigation is essential to protect people and demonstrate due diligence.',
      'Our investigators apply recognised techniques to establish root causes and recommend sustainable corrective actions.',
    ],
    objectives: [
      'Secure and preserve evidence in accordance with best practice',
      'Determine immediate, underlying, and root causes',
      'Support RIDDOR reporting and regulatory communication where required',
      'Develop corrective and preventive action plans',
    ],
    keyBenefits: [
      benefit(
        'AlertTriangle',
        'Rapid Response',
        'Critical incident mobilisation within agreed SLA.',
      ),
      benefit(
        'Scale',
        'Legal Alignment',
        'Investigation approach suitable for potential enforcement or claims.',
      ),
      benefit(
        'Shield',
        'Prevention Focus',
        'Recommendations designed to prevent recurrence, not just close findings.',
      ),
    ],
    industrySlugs: ['construction', 'manufacturing', 'logistics', 'oil-gas'],
    regulations: [
      'Reporting of Injuries, Diseases and Dangerous Occurrences Regulations 2013',
      'Health and Safety at Work etc. Act 1974',
    ],
    timeline: 'Initial response: 24–48 hours; full report: 1–3 weeks',
    relatedServices: [
      { category: 'health-safety', slug: 'health-safety-audits' },
      { category: 'business-risk', slug: 'crisis-management' },
    ],
  }),
  defineService({
    slug: 'safety-management-systems',
    category: 'health-safety',
    title: 'Safety Management Systems',
    subtitle:
      'Design and implementation of integrated safety management systems aligned to ISO 45001 and HSE expectations.',
    icon: 'ClipboardList',
    summary:
      'Build robust safety management systems with policies, procedures, performance monitoring, and continuous improvement.',
    overview: [
      'We help organisations move from reactive compliance to proactive safety leadership through structured management systems.',
      'Systems are tailored to your size, risk profile, and certification ambitions.',
    ],
    objectives: [
      'Define safety policy, roles, and responsibilities',
      'Document procedures for key risk activities',
      'Establish monitoring, review, and improvement cycles',
      'Align with ISO 45001 where certification is a goal',
    ],
    keyBenefits: [
      benefit(
        'ClipboardList',
        'Structured Approach',
        'Clear framework for managing safety across the organisation.',
      ),
      benefit(
        'Award',
        'Certification Ready',
        'Pathway to ISO 45001 alignment and certification.',
      ),
      benefit(
        'Users',
        'Culture Enablement',
        'Systems that support behaviour and leadership, not just paperwork.',
      ),
    ],
    industrySlugs: ['manufacturing', 'construction', 'healthcare', 'retail'],
    regulations: [
      'ISO 45001:2018 Occupational Health and Safety Management Systems',
      'Health and Safety at Work etc. Act 1974',
    ],
    relatedServices: [
      { category: 'iso-management', slug: 'iso-45001' },
      { category: 'health-safety', slug: 'safety-policies-procedures' },
    ],
  }),
  defineService({
    slug: 'cdm-consultancy',
    category: 'health-safety',
    title: 'CDM Consultancy',
    subtitle:
      'CDM 2015 compliance support for clients, principal designers, and principal contractors.',
    icon: 'Building2',
    summary:
      'Expert CDM consultancy including pre-construction information, construction phase plans, and duty holder support.',
    overview: [
      'Construction projects require clear CDM coordination and documentation. We support all duty holders with practical, compliant solutions.',
      'Our consultants have extensive experience on Tier 1 and SME construction projects across the UK.',
    ],
    objectives: [
      'Advise on CDM duty holder responsibilities',
      'Develop and review pre-construction information',
      'Support construction phase plan development',
      'Coordinate design and construction H&S integration',
    ],
    keyBenefits: [
      benefit(
        'Building2',
        'Construction Expertise',
        'Consultants with live site and CDM experience.',
      ),
      benefit(
        'FileCheck',
        'Documentation Support',
        'PCI, CPP, and H&S file development and review.',
      ),
      benefit(
        'ShieldCheck',
        'Client Assurance',
        'Defensible CDM compliance for developers and contractors.',
      ),
    ],
    industrySlugs: ['construction'],
    regulations: ['Construction (Design and Management) Regulations 2015'],
    featured: true,
    relatedServices: [
      { category: 'health-safety', slug: 'risk-assessments' },
      { category: 'compliance-regulatory', slug: 'contractor-management' },
    ],
  }),
  defineService({
    slug: 'fire-risk-assessments',
    category: 'health-safety',
    title: 'Fire Risk Assessments',
    subtitle:
      'Compliant fire risk assessments under the Regulatory Reform (Fire Safety) Order 2005.',
    icon: 'Flame',
    summary:
      'Fire risk assessments, emergency planning support, and fire safety management guidance for UK workplaces.',
    overview: [
      'Responsible persons must ensure suitable fire risk assessments are in place. We deliver assessments proportionate to your premises and occupancy.',
      'Reports include clear action plans for fire prevention, protection, and emergency arrangements.',
    ],
    objectives: [
      'Identify fire hazards and people at risk',
      'Evaluate existing fire precautions and emergency plans',
      'Recommend proportionate improvements and maintenance regimes',
      'Support fire warden training and drill programmes',
    ],
    keyBenefits: [
      benefit(
        'Flame',
        'FRA Expertise',
        'Assessments by competent fire safety consultants.',
      ),
      benefit(
        'Shield',
        'Compliance Assurance',
        'Aligned to RRFSO 2005 and current guidance.',
      ),
      benefit(
        'Users',
        'Occupant Safety',
        'Practical improvements protecting people and property.',
      ),
    ],
    industrySlugs: ['retail', 'healthcare', 'manufacturing', 'construction'],
    regulations: [
      'Regulatory Reform (Fire Safety) Order 2005',
      'Fire Safety Act 2021',
    ],
    relatedServices: [
      { category: 'health-safety', slug: 'workplace-inspections' },
      { category: 'compliance-regulatory', slug: 'competent-person-services' },
    ],
    relatedTraining: [
      {
        slug: 'fire-warden',
        title: 'Fire Warden Training',
        href: '/training/health-safety/fire-warden',
      },
    ],
  }),
  defineService({
    slug: 'safety-policies-procedures',
    category: 'health-safety',
    title: 'Safety Policies & Procedures',
    subtitle:
      'Development and review of health and safety policies, procedures, and safe systems of work.',
    icon: 'BookOpen',
    summary:
      'Clear, compliant safety documentation tailored to your operations — from policy statements to detailed procedures.',
    overview: [
      'Effective documentation underpins safety culture and regulatory compliance. We develop policies that reflect how your organisation actually works.',
      'Documentation is reviewed for legal alignment, usability, and integration with your management system.',
    ],
    objectives: [
      'Draft or revise health and safety policy statements',
      'Develop procedures for high-risk and routine activities',
      'Ensure documentation reflects legal and best practice requirements',
      'Support communication and training roll-out',
    ],
    keyBenefits: [
      benefit(
        'BookOpen',
        'Clear Documentation',
        'Policies your teams can understand and apply.',
      ),
      benefit(
        'Scale',
        'Legal Alignment',
        'Content reviewed against current UK legislation.',
      ),
      benefit(
        'Lightbulb',
        'Practical Focus',
        'Procedures designed for operational use, not shelf-ware.',
      ),
    ],
    industrySlugs: ['manufacturing', 'logistics', 'healthcare', 'retail'],
    regulations: [
      'Health and Safety at Work etc. Act 1974',
      'Management of Health and Safety at Work Regulations 1999',
    ],
    relatedServices: [
      { category: 'compliance-regulatory', slug: 'policy-development' },
      { category: 'health-safety', slug: 'safety-management-systems' },
    ],
  }),
];
