import {
  defineCaseStudy,
  serviceRef,
  courseRef,
  resourceRef,
  caseStudyRef,
  metric,
  downloadSummary,
} from './helpers.js';

export const caseStudyPages = [
  defineCaseStudy({
    slug: 'cdm-london-development',
    industry: 'construction',
    title: 'CDM Compliance for £120M Mixed-Use Development',
    subtitle:
      'Principal Designer services delivering zero major incidents across an 18-month London build.',
    icon: 'Building2',
    overview:
      'CKBHSE provided full Principal Designer services for a 24-storey mixed-use development, coordinating design risk management across multiple contractors and high-risk construction phases.',
    clientProfile: 'Major London Commercial Development',
    clientSector: 'Construction — Commercial & Mixed-Use',
    projectType: 'compliance-programme',
    challenge:
      'A 24-storey mixed-use development required comprehensive Principal Designer services to manage complex safety challenges across multiple contractors and high-risk construction phases.',
    objectives: [
      'Achieve full CDM 2015 compliance across all duty holders',
      'Coordinate design risk assessments for a multi-contractor programme',
      'Prepare and maintain pre-construction information and health and safety file',
      'Support the client through HSE notification and inspection readiness',
    ],
    methodology: [
      'Pre-construction information review and gap analysis',
      'Principal Designer appointment and duty holder coordination',
      'Design risk assessment workshops with design teams',
      'Construction phase plan review and site safety audits',
    ],
    servicesDelivered: [
      serviceRef('health-safety', 'cdm-consultancy'),
      serviceRef('compliance-regulatory', 'contractor-management'),
    ],
    trainingDelivered: [
      courseRef('compliance-governance', 'cdm-regulations'),
    ],
    regulatoryFramework: ['CDM 2015', 'HSE construction guidance', 'Building Safety Act'],
    timeline: '18 months',
    projectPhases: [
      {
        phase: 'Phase 1',
        title: 'Mobilisation & PCI',
        description: 'Pre-construction information assembly and duty holder mapping.',
        duration: '6 weeks',
      },
      {
        phase: 'Phase 2',
        title: 'Design coordination',
        description: 'Design risk assessments and residual risk sign-off.',
        duration: '4 months',
      },
      {
        phase: 'Phase 3',
        title: 'Construction delivery',
        description: 'Ongoing Principal Designer support and site coordination.',
        duration: '14 months',
      },
    ],
    riskProfile: 'High — working at height, temporary works, multi-contractor interface',
    complianceJourney: [
      'Client CDM duty assessment and competence verification',
      'HSE notification for notifiable project',
      'Construction phase plan approval',
      'Successful HSE inspection with no enforcement action',
    ],
    deliverables: [
      'Pre-construction information pack',
      'Design risk assessment register',
      'Construction phase plan review reports',
      'Health and safety file',
    ],
    measurableResults: [
      'Zero major incidents across 18-month build',
      'Successful HSE inspection with no enforcement action',
      'CDM 2015 full compliance achieved',
      '47% reduction in reportable incidents vs industry average',
    ],
    outcomeMetrics: [
      metric('incident-reduction', 'Reportable incidents', '47% below average', {
        before: 'Industry benchmark',
        after: '47% reduction',
      }),
      metric('compliance-score', 'CDM compliance', '100%'),
      metric('certification-achievement', 'HSE inspection', 'No enforcement'),
    ],
    keyStatistics: [
      { label: 'Project Value', value: '£120M' },
      { label: 'Duration', value: '18 months' },
      { label: 'Workforce', value: '300+' },
    ],
    clientQuote: {
      quote:
        'CKBHSE gave us confidence that CDM duties were being managed properly across a complex programme. Their coordination was instrumental in our clean HSE inspection.',
      author: 'Development Director',
      role: 'Project Sponsor',
      company: 'London Mixed-Use Development',
    },
    testimonialReference: 'construction-director-london',
    downloadableSummary: downloadSummary(
      'CDM London Development Summary',
      '/downloads/case-studies/cdm-london-development.pdf',
    ),
    relatedResources: [
      resourceRef('articles', 'understanding-cdm-2015'),
      resourceRef('guides', 'risk-assessment-practitioner-guide'),
    ],
    relatedCaseStudies: [
      caseStudyRef('manufacturing', 'iso-45001-certification'),
    ],
    publishDate: 'March 2024',
    featured: true,
    keywords: ['CDM 2015', 'Principal Designer', 'construction London'],
  }),
  defineCaseStudy({
    slug: 'iso-45001-certification',
    industry: 'manufacturing',
    title: 'ISO 45001 Certification for Automotive Manufacturing',
    subtitle:
      'From serious incidents to ISO 45001:2018 certification in six months.',
    icon: 'Factory',
    overview:
      'A Midlands automotive parts manufacturer achieved ISO 45001 certification to meet supply chain requirements and reduce lost-time injuries following several serious incidents.',
    clientProfile: 'Automotive Parts Manufacturer',
    clientSector: 'Manufacturing — Automotive Supply Chain',
    projectType: 'certification',
    challenge:
      'The manufacturer needed ISO 45001 certification to meet supply chain requirements and improve safety performance following several serious incidents.',
    objectives: [
      'Achieve ISO 45001:2018 certification within six months',
      'Reduce lost-time injury frequency',
      'Embed worker participation in the OH&S management system',
      'Meet major client audit requirements',
    ],
    methodology: [
      'Gap analysis against ISO 45001 clauses',
      'OH&S management system design and documentation',
      'Implementation support with line management',
      'Internal audit and certification body preparation',
    ],
    servicesDelivered: [
      serviceRef('iso-management', 'iso-45001-consultancy'),
      serviceRef('health-safety', 'health-safety-audits'),
    ],
    trainingDelivered: [
      courseRef('iso-management', 'iso-45001-internal-auditor'),
      courseRef('health-safety', 'iosh-managing-safely'),
    ],
    regulatoryFramework: ['ISO 45001:2018', 'Health and Safety at Work Act 1974'],
    timeline: '6 months',
    projectPhases: [
      {
        phase: 'Phase 1',
        title: 'Gap analysis',
        description: 'Structured assessment against ISO 45001 requirements.',
        duration: '4 weeks',
      },
      {
        phase: 'Phase 2',
        title: 'System implementation',
        description: 'Documentation, roles, and operational controls.',
        duration: '3 months',
      },
      {
        phase: 'Phase 3',
        title: 'Certification',
        description: 'Internal audit, management review, and stage 2 audit.',
        duration: '6 weeks',
      },
    ],
    riskProfile: 'Medium-high — machinery, manual handling, shift operations',
    complianceJourney: [
      'Baseline incident and audit review',
      'ISO 45001 management system deployment',
      'Stage 1 and Stage 2 certification audits passed',
      'Supply chain audit acceptance',
    ],
    deliverables: [
      'ISO 45001 management system documentation',
      'Risk assessment programme',
      'Internal audit reports',
      'Certification achievement',
    ],
    measurableResults: [
      'ISO 45001:2018 certification achieved',
      '68% reduction in lost-time injuries in first year',
      'Improved employee engagement in safety culture',
      'Major client contract secured based on certification',
    ],
    outcomeMetrics: [
      metric('lti-reduction', 'Lost-time injuries', '68% reduction', {
        before: 'Baseline year',
        after: 'Year 1 post-certification',
      }),
      metric('certification-achievement', 'ISO 45001', 'Certified'),
      metric('employee-engagement', 'Safety culture index', '+34%'),
    ],
    keyStatistics: [
      { label: 'Certification', value: 'ISO 45001' },
      { label: 'Implementation', value: '6 months' },
      { label: 'LTI Reduction', value: '68%' },
    ],
    testimonialReference: 'manufacturing-hs-manager',
    downloadableSummary: downloadSummary(
      'ISO 45001 Manufacturing Summary',
      '/downloads/case-studies/iso-45001-certification.pdf',
    ),
    relatedResources: [
      resourceRef('articles', 'iso-45001-implementation'),
      resourceRef('publications', 'hse-maturity-white-paper'),
    ],
    relatedCaseStudies: [
      caseStudyRef('construction', 'cdm-london-development'),
    ],
    publishDate: 'February 2024',
    featured: true,
    keywords: ['ISO 45001', 'manufacturing', 'certification'],
  }),
  defineCaseStudy({
    slug: 'coshh-multi-site-trust',
    industry: 'healthcare',
    title: 'Comprehensive COSHH Management for Multi-Site NHS Trust',
    subtitle:
      'Organisation-wide chemical safety across five hospital sites with CQC inspection readiness support.',
    icon: 'Heart',
    overview:
      'An NHS Foundation Trust operating across five hospital sites required a unified approach to chemical safety management, COSHH compliance, and infection prevention protocols.',
    clientProfile: 'NHS Foundation Trust',
    clientSector: 'Healthcare — Acute & Community Services',
    projectType: 'system-implementation',
    challenge:
      'Fragmented COSHH assessments, inconsistent control measures, and training gaps across five sites created compliance risk and CQC scrutiny.',
    objectives: [
      'Achieve full COSHH compliance across all five sites',
      'Implement centralised chemical inventory and assessment system',
      'Train 400+ clinical and non-clinical staff',
      'Prepare for CQC inspection with robust evidence',
    ],
    methodology: [
      'Site-wide COSHH assessment programme',
      'Centralised chemical inventory and SDS management',
      'Control measure standardisation',
      'Role-based training and competency verification',
    ],
    servicesDelivered: [
      serviceRef('occupational-health', 'coshh-assessments'),
      serviceRef('health-safety', 'health-safety-audits'),
    ],
    trainingDelivered: [
      courseRef('health-safety', 'coshh-awareness'),
    ],
    regulatoryFramework: ['COSHH 2002', 'CQC fundamental standards', 'HTM guidance'],
    timeline: '12 months',
    projectPhases: [
      {
        phase: 'Phase 1',
        title: 'Baseline assessment',
        description: 'COSHH audit across all five sites.',
        duration: '8 weeks',
      },
      {
        phase: 'Phase 2',
        title: 'System rollout',
        description: 'Inventory, assessments, and control measures.',
        duration: '6 months',
      },
      {
        phase: 'Phase 3',
        title: 'Training & assurance',
        description: 'Staff training and CQC readiness review.',
        duration: '4 months',
      },
    ],
    riskProfile: 'Medium — clinical chemicals, cleaning agents, laboratory reagents',
    complianceJourney: [
      'COSHH gap analysis across five sites',
      'Centralised management system deployment',
      '400+ staff trained and competency recorded',
      'CQC inspection readiness support delivered',
    ],
    deliverables: [
      'Site COSHH assessment registers',
      'Centralised chemical inventory',
      'Standard operating procedures',
      'Training records and competency matrix',
    ],
    measurableResults: [
      'Full COSHH compliance across all five sites',
      'Centralised chemical management system implemented',
      'Staff training delivered to 400+ employees',
      'CQC inspection readiness support delivered',
    ],
    outcomeMetrics: [
      metric('compliance-score', 'COSHH compliance', '100% across 5 sites'),
      metric('training-completion', 'Staff trained', '400+'),
      metric('audit-improvement', 'CQC readiness', 'Evidence prepared'),
    ],
    keyStatistics: [
      { label: 'Sites Covered', value: '5 hospitals' },
      { label: 'Staff Trained', value: '400+' },
      { label: 'CQC readiness', value: 'Supported' },
    ],
    testimonialReference: 'healthcare-safety-lead',
    relatedResources: [
      resourceRef('articles', 'coshh-assessments-explained'),
      resourceRef('checklists', 'coshh-assessment-checklist'),
    ],
    publishDate: 'January 2024',
    featured: true,
    keywords: ['COSHH', 'NHS', 'healthcare compliance'],
  }),
  defineCaseStudy({
    slug: 'offshore-process-safety',
    industry: 'oil-gas',
    title: 'Process Safety Management for Offshore Installation',
    subtitle:
      'Major Accident Hazard review and Safety Case update with 24 months incident-free.',
    icon: 'Droplet',
    overview:
      'An offshore oil platform required a comprehensive process safety management review following regulatory changes and aging infrastructure concerns.',
    clientProfile: 'North Sea Platform Operator',
    clientSector: 'Oil & Gas — Offshore Production',
    projectType: 'regulatory-response',
    challenge:
      'Regulatory changes and aging infrastructure required a full Major Accident Hazard review, Permit-to-Work update, and Safety Case revision.',
    objectives: [
      'Achieve full compliance with Offshore Installations Regulations',
      'Update Safety Case accepted by HSE',
      'Enhance emergency response capability',
      'Maintain zero major incidents post-implementation',
    ],
    methodology: [
      'Major Accident Hazard identification and analysis',
      'Permit-to-Work system review and update',
      'High-risk operations training programme',
      'Emergency response exercise and improvement plan',
    ],
    servicesDelivered: [
      serviceRef('business-risk', 'process-safety-management'),
      serviceRef('health-safety', 'risk-assessments'),
    ],
    regulatoryFramework: [
      'Offshore Installations Regulations',
      'PFEER',
      'Safety Case Regulations',
    ],
    timeline: '14 months',
    projectPhases: [
      {
        phase: 'Phase 1',
        title: 'MAH analysis',
        description: '120+ hazards assessed and prioritised.',
        duration: '4 months',
      },
      {
        phase: 'Phase 2',
        title: 'System updates',
        description: 'PtW, procedures, and training deployment.',
        duration: '6 months',
      },
      {
        phase: 'Phase 3',
        title: 'Safety Case',
        description: 'HSE submission and acceptance.',
        duration: '4 months',
      },
    ],
    riskProfile: 'Major accident hazard — hydrocarbon release, fire, explosion',
    complianceJourney: [
      'Baseline MAH and Safety Case gap review',
      'Updated Safety Case submitted to HSE',
      'Emergency response capability enhanced',
      '24 months incident-free post-implementation',
    ],
    deliverables: [
      'MAH register and bow-tie analyses',
      'Updated Permit-to-Work procedures',
      'Safety Case revision',
      'Emergency response improvement plan',
    ],
    measurableResults: [
      'Full compliance with Offshore Installations Regulations',
      'Updated Safety Case accepted by HSE',
      'Emergency response capability significantly enhanced',
      'Zero major incidents in 24 months post-implementation',
    ],
    outcomeMetrics: [
      metric('compliance-score', 'OIR compliance', '100%'),
      metric('incident-reduction', 'Major incidents', 'Zero in 24 months'),
      metric('operational-efficiency', 'PtW compliance', '98%'),
    ],
    keyStatistics: [
      { label: 'Hazards Assessed', value: '120+' },
      { label: 'Compliance', value: '100%' },
      { label: 'Incident-Free', value: '24 months' },
    ],
    publishDate: 'November 2023',
    featured: true,
    keywords: ['offshore', 'process safety', 'Safety Case'],
  }),
  defineCaseStudy({
    slug: 'fleet-safety-transformation',
    industry: 'logistics',
    title: 'Fleet Safety Transformation for National Logistics Operator',
    subtitle:
      'Driver safety programme reducing collisions by 41% across 800-vehicle fleet.',
    icon: 'Truck',
    overview:
      'A national logistics operator engaged CKBHSE to transform fleet safety culture, compliance, and incident performance across depots nationwide.',
    clientProfile: 'National Logistics Operator',
    clientSector: 'Logistics & Transport — Road Haulage',
    projectType: 'transformation',
    challenge:
      'Rising collision rates, inconsistent driver training, and DVSA enforcement action required a structured fleet safety transformation.',
    objectives: [
      'Reduce collision frequency by 35% within 12 months',
      'Standardise driver induction and refresher training',
      'Achieve DVSA operator compliance improvement',
      'Embed telematics-linked safety KPIs',
    ],
    methodology: [
      'Fleet risk assessment and depot audits',
      'Driver competency framework',
      'Behaviour-based safety programme',
      'Management dashboard and KPI tracking',
    ],
    servicesDelivered: [
      serviceRef('health-safety', 'risk-assessments'),
      serviceRef('compliance-regulatory', 'compliance-audits'),
    ],
    trainingDelivered: [
      courseRef('health-safety', 'manual-handling'),
      courseRef('leadership-culture', 'behavioural-safety'),
    ],
    regulatoryFramework: ['Road Traffic Act', 'Operator licensing', 'DVSA guidance'],
    timeline: '12 months',
    projectPhases: [
      {
        phase: 'Phase 1',
        title: 'Baseline & audit',
        description: 'Fleet risk profile and depot compliance review.',
        duration: '6 weeks',
      },
      {
        phase: 'Phase 2',
        title: 'Programme rollout',
        description: 'Training, procedures, and telematics integration.',
        duration: '8 months',
      },
      {
        phase: 'Phase 3',
        title: 'Sustain & review',
        description: 'KPI monitoring and continuous improvement.',
        duration: '4 months',
      },
    ],
    riskProfile: 'Medium-high — road risk, manual handling, depot operations',
    complianceJourney: [
      'DVSA improvement notice response',
      'Driver training programme deployed',
      'Telematics safety KPIs embedded',
      'Sustained collision reduction achieved',
    ],
    deliverables: [
      'Fleet safety management system',
      'Driver training records',
      'Depot audit reports',
      'Management KPI dashboard specification',
    ],
    measurableResults: [
      '41% reduction in collision frequency',
      'DVSA operator compliance score improved',
      '800 drivers trained to new competency standard',
      'Zero prohibitions in follow-up inspections',
    ],
    outcomeMetrics: [
      metric('incident-reduction', 'Collisions', '41% reduction'),
      metric('training-completion', 'Drivers trained', '800'),
      metric('compliance-score', 'DVSA compliance', 'Improved rating'),
    ],
    keyStatistics: [
      { label: 'Fleet Size', value: '800 vehicles' },
      { label: 'Collision Reduction', value: '41%' },
      { label: 'Depots', value: '12' },
    ],
    publishDate: 'October 2023',
    keywords: ['fleet safety', 'logistics', 'driver training'],
  }),
  defineCaseStudy({
    slug: 'fire-safety-compliance',
    industry: 'retail',
    title: 'Fire Safety Compliance Programme for Multi-Site Retailer',
    subtitle:
      'Fire risk assessments and staff training across 45 retail locations.',
    icon: 'Store',
    overview:
      'A UK retail chain required consistent fire safety compliance following Fire Safety Act reforms and insurance audit requirements.',
    clientProfile: 'UK Multi-Site Retail Chain',
    clientSector: 'Retail & Commercial',
    projectType: 'compliance-programme',
    challenge:
      'Inconsistent fire risk assessments, outdated emergency plans, and training gaps across 45 locations created regulatory and insurance exposure.',
    objectives: [
      'Complete fire risk assessments for all 45 sites',
      'Standardise emergency plans and evacuation procedures',
      'Train fire wardens at every location',
      'Meet Fire Safety Act and insurance audit requirements',
    ],
    methodology: [
      'Templated fire risk assessment programme',
      'Central governance with local responsible persons',
      'Fire warden training rollout',
      'Insurance audit preparation support',
    ],
    servicesDelivered: [
      serviceRef('health-safety', 'fire-risk-assessments'),
      serviceRef('compliance-regulatory', 'compliance-audits'),
    ],
    trainingDelivered: [
      courseRef('health-safety', 'fire-warden'),
      courseRef('health-safety', 'fire-safety-awareness'),
    ],
    regulatoryFramework: ['Fire Safety Act 2021', 'Regulatory Reform Order 2005'],
    timeline: '9 months',
    projectPhases: [
      {
        phase: 'Phase 1',
        title: 'Assessment programme',
        description: 'Fire risk assessments at all 45 sites.',
        duration: '4 months',
      },
      {
        phase: 'Phase 2',
        title: 'Training rollout',
        description: 'Fire warden and responsible person training.',
        duration: '3 months',
      },
      {
        phase: 'Phase 3',
        title: 'Assurance',
        description: 'Insurance audit and remediation closure.',
        duration: '2 months',
      },
    ],
    riskProfile: 'Medium — public occupancy, stock storage, multi-site consistency',
    complianceJourney: [
      'Baseline fire safety gap analysis',
      '45 site assessments completed',
      'Fire warden training at all locations',
      'Insurance audit passed with no major findings',
    ],
    deliverables: [
      '45 fire risk assessments',
      'Emergency plan templates',
      'Fire warden training records',
      'Insurance audit evidence pack',
    ],
    measurableResults: [
      '100% of sites with current fire risk assessments',
      '90 fire wardens trained and certified',
      'Insurance audit passed',
      'Zero enforcement notices',
    ],
    outcomeMetrics: [
      metric('compliance-score', 'FRA completion', '100%'),
      metric('training-completion', 'Fire wardens trained', '90'),
      metric('audit-improvement', 'Insurance audit', 'Passed'),
    ],
    keyStatistics: [
      { label: 'Sites', value: '45' },
      { label: 'Fire Wardens', value: '90' },
      { label: 'Timeline', value: '9 months' },
    ],
    relatedResources: [
      resourceRef('articles', 'fire-risk-assessment-guide'),
    ],
    publishDate: 'September 2023',
    keywords: ['fire safety', 'retail', 'FRA'],
  }),
  defineCaseStudy({
    slug: 'campus-safety-programme',
    industry: 'education',
    title: 'Campus Safety Programme for Multi-Campus University',
    subtitle:
      'Integrated health and safety management across academic and residential estates.',
    icon: 'GraduationCap',
    overview:
      'A multi-campus university required an integrated safety programme covering laboratories, workshops, residential halls, and public events.',
    clientProfile: 'Multi-Campus University',
    clientSector: 'Education — Higher Education',
    projectType: 'system-implementation',
    challenge:
      'Decentralised safety management, laboratory risks, and residential fire safety required a unified governance model.',
    objectives: [
      'Deploy unified H&S governance across three campuses',
      'Address laboratory and workshop risk profiles',
      'Improve residential fire and welfare safety',
      'Support event safety for large public gatherings',
    ],
    methodology: [
      'Campus-wide risk profiling',
      'Safety committee structure design',
      'Departmental safety coordinator training',
      'Audit and assurance calendar',
    ],
    servicesDelivered: [
      serviceRef('health-safety', 'health-safety-audits'),
      serviceRef('iso-management', 'management-system-consultancy'),
    ],
    regulatoryFramework: ['HSE education guidance', 'Fire Safety Act', 'COSHH'],
    timeline: '10 months',
    projectPhases: [
      {
        phase: 'Phase 1',
        title: 'Governance design',
        description: 'Safety committee and coordinator framework.',
        duration: '6 weeks',
      },
      {
        phase: 'Phase 2',
        title: 'Campus rollout',
        description: 'Risk assessments and coordinator training.',
        duration: '7 months',
      },
      {
        phase: 'Phase 3',
        title: 'Assurance',
        description: 'Audit programme and executive reporting.',
        duration: '3 months',
      },
    ],
    riskProfile: 'Medium — laboratories, events, residential, public access',
    complianceJourney: [
      'Baseline campus safety audit',
      'Unified governance model approved',
      'Department coordinators trained',
      'Executive safety dashboard implemented',
    ],
    deliverables: [
      'Campus risk registers',
      'Safety governance charter',
      'Coordinator training programme',
      'Annual audit schedule',
    ],
    measurableResults: [
      'Unified governance across three campuses',
      '60 departmental coordinators trained',
      'Laboratory COSHH programme standardised',
      'Event safety procedures approved',
    ],
    outcomeMetrics: [
      metric('employee-engagement', 'Coordinator network', '60 trained'),
      metric('compliance-score', 'Campus audit score', '+28%'),
      metric('training-completion', 'Coordinator training', '100%'),
    ],
    keyStatistics: [
      { label: 'Campuses', value: '3' },
      { label: 'Coordinators', value: '60' },
      { label: 'Timeline', value: '10 months' },
    ],
    publishDate: 'August 2023',
    keywords: ['education', 'campus safety', 'university'],
  }),
  defineCaseStudy({
    slug: 'hswa-compliance-review',
    industry: 'public-sector',
    title: 'HSWA Compliance Review for Local Authority',
    subtitle:
      'Corporate health and safety assurance programme for diverse council services.',
    icon: 'Building2',
    overview:
      'A local authority required an independent HSWA compliance review covering highways, leisure, housing, and corporate services.',
    clientProfile: 'Metropolitan Borough Council',
    clientSector: 'Public Sector — Local Government',
    projectType: 'audit-support',
    challenge:
      'Diverse service portfolio, budget constraints, and recent enforcement scrutiny required independent assurance and prioritised improvement plans.',
    objectives: [
      'Conduct independent HSWA compliance review',
      'Prioritise improvement actions by risk and resource',
      'Support elected member and senior officer reporting',
      'Prepare for HSE liaison and inspection readiness',
    ],
    methodology: [
      'Service-line compliance audits',
      'Risk-based prioritisation matrix',
      'Improvement plan with resource estimates',
      'Member and officer briefing programme',
    ],
    servicesDelivered: [
      serviceRef('compliance-regulatory', 'compliance-audits'),
      serviceRef('business-risk', 'health-safety-policy'),
    ],
    regulatoryFramework: ['HSWA 1974', 'Local Government Act', 'HSE public sector guidance'],
    timeline: '5 months',
    projectPhases: [
      {
        phase: 'Phase 1',
        title: 'Scoping',
        description: 'Service portfolio mapping and audit planning.',
        duration: '3 weeks',
      },
      {
        phase: 'Phase 2',
        title: 'Audit programme',
        description: 'Service-line compliance audits.',
        duration: '3 months',
      },
      {
        phase: 'Phase 3',
        title: 'Reporting',
        description: 'Improvement plan and member briefing.',
        duration: '6 weeks',
      },
    ],
    riskProfile: 'Medium — diverse operations, public interface, highways',
    complianceJourney: [
      'Independent compliance review commissioned',
      '12 service-line audits completed',
      'Prioritised improvement plan approved',
      'HSE liaison support provided',
    ],
    deliverables: [
      'Service-line audit reports',
      'Prioritised improvement plan',
      'Member briefing pack',
      'HSE inspection readiness checklist',
    ],
    measurableResults: [
      '12 service lines audited',
      'Priority actions resourced and scheduled',
      'Member briefing delivered',
      'No further HSE enforcement action',
    ],
    outcomeMetrics: [
      metric('audit-improvement', 'Compliance gaps closed', '78% in 12 months'),
      metric('compliance-score', 'Service-line compliance', '+32%'),
      metric('cost-savings', 'Efficiency savings', '£240K identified'),
    ],
    keyStatistics: [
      { label: 'Service Lines', value: '12' },
      { label: 'Audit Duration', value: '5 months' },
      { label: 'Gap Closure', value: '78%' },
    ],
    publishDate: 'July 2023',
    keywords: ['public sector', 'local authority', 'HSWA'],
  }),
];
