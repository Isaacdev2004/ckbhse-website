import { defineClientSuccess, metric } from './helpers.js';

export const clientSuccessPages = [
  defineClientSuccess({
    slug: 'construction-excellence',
    title: 'Construction Excellence Programme',
    subtitle:
      'Delivering CDM compliance and incident reduction for major UK developments.',
    overview:
      'A portfolio approach to construction safety delivering Principal Designer services, CDM compliance, and measurable incident reduction across high-value developments.',
    statistics: [
      { label: 'Projects delivered', value: '25+' },
      { label: 'Incident reduction', value: '47%' },
      { label: 'HSE inspections passed', value: '100%' },
    ],
    beforeAfter: [
      {
        title: 'Reportable incidents',
        before: 'Industry benchmark rate',
        after: '47% below industry average',
        metric: metric('incident-reduction', 'Incidents', '47% reduction'),
      },
      {
        title: 'CDM compliance',
        before: 'Partial duty holder coordination',
        after: 'Full CDM 2015 compliance',
        metric: metric('compliance-score', 'Compliance', '100%'),
      },
    ],
    outcomeMetrics: [
      metric('incident-reduction', 'Average incident reduction', '47%'),
      metric('compliance-score', 'CDM compliance rate', '100%'),
    ],
    clientJourney: [
      {
        step: '1',
        title: 'Assess',
        description: 'Client duty and project risk profiling.',
      },
      {
        step: '2',
        title: 'Design',
        description: 'Principal Designer coordination and PCI assembly.',
      },
      {
        step: '3',
        title: 'Deliver',
        description: 'Construction phase support and HSE readiness.',
      },
      {
        step: '4',
        title: 'Assure',
        description: 'Health and safety file and lessons learned.',
      },
    ],
    methodology: [
      'Duty holder mapping and competence verification',
      'Design risk assessment coordination',
      'Construction phase plan review',
      'HSE inspection preparation',
    ],
    improvementMetrics: [
      metric('operational-efficiency', 'Design coordination time', '-30%'),
    ],
    riskReductionMetrics: [
      metric('incident-reduction', 'Major incidents', 'Zero across portfolio'),
    ],
    complianceAchievements: [
      'CDM 2015 full compliance',
      'Building Safety Act readiness',
      'Clean HSE inspection record',
    ],
    testimonialSlugs: ['construction-director-london'],
    relatedCaseStudies: [
      { industry: 'construction', slug: 'cdm-london-development' },
    ],
    featured: true,
    keywords: ['construction', 'CDM', 'Principal Designer'],
  }),
  defineClientSuccess({
    slug: 'manufacturing-transformation',
    title: 'Manufacturing Safety Transformation',
    subtitle:
      'ISO 45001 certification and injury reduction for automotive supply chain.',
    overview:
      'End-to-end OH&S management system implementation delivering ISO 45001 certification and significant lost-time injury reduction for manufacturing clients.',
    statistics: [
      { label: 'Certifications achieved', value: '40+' },
      { label: 'LTI focus', value: 'Prevention' },
      { label: 'Implementation time', value: '6 months avg' },
    ],
    beforeAfter: [
      {
        title: 'Lost-time injuries',
        before: 'Above industry average',
        after: '68% reduction in year one',
        metric: metric('lti-reduction', 'LTI', '68% reduction'),
      },
    ],
    outcomeMetrics: [
      metric('lti-reduction', 'LTI focus', 'Prevention'),
      metric('certification-achievement', 'ISO 45001 certifications', '40+'),
    ],
    clientJourney: [
      { step: '1', title: 'Gap analysis', description: 'ISO 45001 baseline assessment.' },
      { step: '2', title: 'Implement', description: 'System design and deployment.' },
      { step: '3', title: 'Certify', description: 'Internal audit and certification.' },
      { step: '4', title: 'Sustain', description: 'Continuous improvement and surveillance.' },
    ],
    methodology: [
      'Structured gap analysis',
      'Worker participation programmes',
      'Line management engagement',
      'Certification body liaison',
    ],
    improvementMetrics: [
      metric('employee-engagement', 'Safety culture index', '+34% average'),
    ],
    riskReductionMetrics: [
      metric('lti-reduction', 'LTI frequency', 'Improved controls'),
    ],
    complianceAchievements: [
      'ISO 45001:2018 certification',
      'Supply chain audit acceptance',
      'Major client contract retention',
    ],
    testimonialSlugs: ['manufacturing-hs-manager'],
    relatedCaseStudies: [
      { industry: 'manufacturing', slug: 'iso-45001-certification' },
    ],
    featured: true,
  }),
  defineClientSuccess({
    slug: 'healthcare-compliance',
    title: 'Healthcare Compliance Excellence',
    subtitle:
      'Multi-site COSHH and safety programmes for NHS and healthcare providers.',
    overview:
      'Organisation-wide chemical safety and H&S programmes delivering CQC-ready compliance across acute and community healthcare settings.',
    statistics: [
      { label: 'Sites supported', value: '30+' },
      { label: 'Staff training', value: 'Multi-site' },
      { label: 'CQC readiness', value: 'Support' },
    ],
    beforeAfter: [
      {
        title: 'COSHH compliance',
        before: 'Fragmented site assessments',
        after: 'Centralised system across all sites',
      },
    ],
    outcomeMetrics: [
      metric('compliance-score', 'COSHH compliance', 'Improved'),
      metric('training-completion', 'Staff training', 'Role-based'),
    ],
    clientJourney: [
      { step: '1', title: 'Baseline', description: 'Multi-site COSHH audit.' },
      { step: '2', title: 'Standardise', description: 'Central inventory and controls.' },
      { step: '3', title: 'Train', description: 'Role-based competency programme.' },
      { step: '4', title: 'Assure', description: 'CQC inspection readiness.' },
    ],
    methodology: [
      'Site-wide COSHH assessment',
      'Centralised chemical inventory',
      'Clinical and non-clinical training',
      'CQC evidence preparation',
    ],
    improvementMetrics: [
      metric('audit-improvement', 'CQC readiness', 'Evidence prepared'),
    ],
    riskReductionMetrics: [
      metric('compliance-score', 'COSHH gaps closed', 'Priority actions'),
    ],
    complianceAchievements: [
      'Improved COSHH controls',
      'CQC inspection readiness support',
      'Centralised management system',
    ],
    testimonialSlugs: ['healthcare-safety-lead'],
    relatedCaseStudies: [
      { industry: 'healthcare', slug: 'coshh-multi-site-trust' },
    ],
    featured: true,
  }),
  defineClientSuccess({
    slug: 'multi-sector-impact',
    title: 'Multi-Sector Impact Programme',
    subtitle:
      'Cross-sector client success delivering measurable outcomes UK-wide.',
    overview:
      'CKBHSE delivers consistent, measurable outcomes across construction, manufacturing, healthcare, logistics, retail, education, and public sector clients.',
    statistics: [
      { label: 'Sectors served', value: '12+' },
      { label: 'Engagement model', value: 'Partnership' },
      { label: 'Outcome focus', value: 'Practical' },
    ],
    beforeAfter: [
      {
        title: 'Compliance posture',
        before: 'Reactive, fragmented approach',
        after: 'Proactive, integrated HSE programmes',
      },
    ],
    outcomeMetrics: [
      metric('compliance-score', 'Audit readiness', 'Supported'),
      metric('incident-reduction', 'Risk reduction', 'Controls'),
      metric('training-completion', 'Training support', 'Teams'),
    ],
    clientJourney: [
      { step: '1', title: 'Discover', description: 'Initial consultation and scoping.' },
      { step: '2', title: 'Diagnose', description: 'Gap analysis and risk profiling.' },
      { step: '3', title: 'Deliver', description: 'Programme implementation.' },
      { step: '4', title: 'Demonstrate', description: 'Outcome measurement and reporting.' },
    ],
    methodology: [
      'Sector-specific expertise',
      'Integrated service and training delivery',
      'Measurable KPI frameworks',
      'Long-term partnership model',
    ],
    improvementMetrics: [
      metric('operational-efficiency', 'Process clarity', 'Improved'),
      metric('cost-savings', 'Efficiency focus', 'Waste reduction'),
    ],
    riskReductionMetrics: [
      metric('incident-reduction', 'Portfolio risk focus', 'Controls'),
    ],
    complianceAchievements: [
      'Audit readiness support',
      'Certification support programmes',
      'Long-term partnership approach',
    ],
    testimonialSlugs: [
      'logistics-fleet-director',
      'retail-compliance-manager',
      'council-chief-officer',
    ],
    relatedCaseStudies: [
      { industry: 'logistics', slug: 'fleet-safety-transformation' },
      { industry: 'retail', slug: 'fire-safety-compliance' },
      { industry: 'public-sector', slug: 'hswa-compliance-review' },
    ],
    featured: true,
  }),
];
