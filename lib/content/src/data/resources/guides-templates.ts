import {
  defineResource,
  p,
  h2,
  ul,
  serviceRef,
  courseRef,
  download,
  resourceRef,
} from './helpers.js';

export const guideResources = [
  defineResource({
    slug: 'health-safety-policy-guide',
    type: 'guides',
    title: 'Health & Safety Policy Writing Guide',
    subtitle:
      'How to develop a legally compliant health and safety policy statement.',
    icon: 'FileCheck',
    summary:
      'Step-by-step guidance for directors and managers on writing and reviewing health and safety policies.',
    author: 'Dr. James Parker',
    publishDate: 'April 2, 2024',
    readingTime: '12 min read',
    body: [
      p(
        'Every employer with five or more employees must have a written health and safety policy under the Health and Safety at Work Act 1974.',
      ),
      h2('Policy structure'),
      ul([
        'Statement of intent',
        'Organisation and responsibilities',
        'Arrangements for implementation',
      ]),
    ],
    tags: ['policy', 'H&S management'],
    industrySlugs: ['construction', 'manufacturing', 'retail'],
    relatedServices: [
      serviceRef('compliance-regulatory', 'policy-development'),
    ],
    featured: true,
    keywords: ['health and safety policy'],
  }),
  defineResource({
    slug: 'risk-assessment-practitioner-guide',
    type: 'guides',
    title: 'Risk Assessment Practitioner Guide',
    subtitle: 'A practical handbook for conducting workplace risk assessments.',
    icon: 'ClipboardList',
    summary:
      'Comprehensive practitioner guide covering hazard identification, risk rating, and control selection.',
    author: 'Sarah Mitchell',
    publishDate: 'March 28, 2024',
    readingTime: '15 min read',
    body: [
      p(
        'This guide supports competent persons in delivering proportionate, defensible risk assessments.',
      ),
      h2('Five steps'),
      ul([
        'Identify hazards',
        'Decide who may be harmed',
        'Evaluate risks',
        'Record findings',
        'Review',
      ]),
    ],
    tags: ['risk assessment', 'practitioner'],
    industrySlugs: ['construction', 'manufacturing', 'logistics'],
    relatedServices: [serviceRef('health-safety', 'risk-assessments')],
    relatedCourses: [courseRef('health-safety', 'risk-assessment')],
    featured: true,
    keywords: ['risk assessment guide'],
  }),
  defineResource({
    slug: 'iso-14001-gap-analysis-guide',
    type: 'guides',
    title: 'ISO 14001 Gap Analysis Guide',
    subtitle:
      'Prepare your organisation for ISO 14001 certification with structured gap analysis.',
    icon: 'Leaf',
    summary:
      'Structured approach to assessing environmental management system readiness against ISO 14001:2015.',
    author: 'Emma Richardson',
    publishDate: 'March 20, 2024',
    readingTime: '14 min read',
    body: [
      p(
        'Gap analysis identifies the distance between current practice and ISO 14001 requirements.',
      ),
      h2('Analysis areas'),
      ul([
        'Context and leadership',
        'Environmental aspects',
        'Compliance obligations',
        'Operational controls',
      ]),
    ],
    tags: ['ISO 14001', 'gap analysis', 'EMS'],
    industrySlugs: ['manufacturing', 'construction'],
    relatedServices: [serviceRef('iso-management', 'gap-analysis')],
    relatedCourses: [courseRef('environmental', 'iso-14001-awareness')],
    keywords: ['ISO 14001 gap analysis'],
  }),
  defineResource({
    slug: 'contractor-management-guide',
    type: 'guides',
    title: 'Contractor Management Best Practice Guide',
    subtitle: 'Selecting, managing, and monitoring contractors on your sites.',
    icon: 'Handshake',
    summary:
      'Best practice guide for principal contractors and clients managing contractor H&S performance.',
    author: 'Michael Chen',
    publishDate: 'March 12, 2024',
    readingTime: '11 min read',
    body: [
      p(
        'Clients and principal contractors retain duties for contractor activities on their premises.',
      ),
      h2('Management cycle'),
      ul([
        'Pre-qualification',
        'Induction and briefing',
        'Monitoring and audit',
        'Performance review',
      ]),
    ],
    tags: ['contractor management', 'CDM'],
    industrySlugs: ['construction', 'facilities-management'],
    relatedServices: [
      serviceRef('compliance-regulatory', 'contractor-management'),
    ],
    relatedCourses: [
      courseRef('compliance-governance', 'contractor-management'),
    ],
    keywords: ['contractor management guide'],
  }),
  defineResource({
    slug: 'safety-leadership-guide',
    type: 'guides',
    title: 'Safety Leadership Guide for Directors',
    subtitle:
      'Visible leadership behaviours that drive safety culture improvement.',
    icon: 'Compass',
    summary:
      'Executive guide to demonstrating visible safety leadership and board-level governance.',
    author: 'Dr. James Parker',
    publishDate: 'February 25, 2024',
    readingTime: '10 min read',
    body: [
      p(
        'Directors face personal accountability for health and safety failures. Visible leadership sets the tone for organisational culture.',
      ),
      h2('Leadership behaviours'),
      ul([
        'Safety walks and engagement',
        'Resource allocation',
        'Board reporting',
        'Learning from incidents',
      ]),
    ],
    tags: ['leadership', 'director duties', 'culture'],
    industrySlugs: ['manufacturing', 'oil-gas', 'public-sector'],
    relatedServices: [serviceRef('business-risk', 'governance-support')],
    relatedCourses: [courseRef('leadership-culture', 'safety-leadership')],
    keywords: ['safety leadership'],
  }),
];

export const templateResources = [
  defineResource({
    slug: 'risk-assessment-template',
    type: 'templates',
    title: 'General Risk Assessment Template',
    subtitle: 'Editable Word template for workplace risk assessments.',
    icon: 'FileCheck',
    summary:
      'CKBHSE general risk assessment template aligned to HSE five-step methodology.',
    author: 'CKBHSE Team',
    publishDate: 'April 5, 2024',
    readingTime: '2 min read',
    body: [
      p(
        'Download this editable template to document workplace risk assessments in a consistent, auditable format.',
      ),
      h2('Template contents'),
      ul([
        'Hazard identification table',
        'Risk rating matrix',
        'Control measures',
        'Review schedule',
      ]),
    ],
    tags: ['template', 'risk assessment'],
    industrySlugs: ['construction', 'manufacturing', 'retail'],
    downloadableFiles: [
      download(
        'General Risk Assessment Template',
        'docx',
        '/downloads/templates/risk-assessment-template.docx',
        'Editable Word template',
      ),
    ],
    featured: true,
    keywords: ['risk assessment template'],
  }),
  defineResource({
    slug: 'method-statement-template',
    type: 'templates',
    title: 'Method Statement Template',
    subtitle:
      'Standard method statement format for construction and maintenance work.',
    icon: 'Building2',
    summary:
      'Professional method statement template suitable for client and principal contractor approval.',
    author: 'CKBHSE Team',
    publishDate: 'April 1, 2024',
    readingTime: '2 min read',
    body: [
      p(
        'Use this template to document safe systems of work for site activities.',
      ),
    ],
    tags: ['template', 'RAMS', 'construction'],
    industrySlugs: ['construction'],
    downloadableFiles: [
      download(
        'Method Statement Template',
        'docx',
        '/downloads/templates/method-statement-template.docx',
      ),
    ],
    keywords: ['method statement template'],
  }),
  defineResource({
    slug: 'fire-evacuation-plan-template',
    type: 'templates',
    title: 'Fire Evacuation Plan Template',
    subtitle:
      'Template for documenting fire evacuation procedures and assembly points.',
    icon: 'Flame',
    summary:
      'Fire evacuation plan template supporting compliance with the Fire Safety Order.',
    author: 'CKBHSE Team',
    publishDate: 'March 18, 2024',
    readingTime: '2 min read',
    body: [
      p(
        'Document evacuation routes, assembly points, and warden responsibilities.',
      ),
    ],
    tags: ['template', 'fire safety'],
    industrySlugs: ['retail', 'healthcare', 'education'],
    downloadableFiles: [
      download(
        'Fire Evacuation Plan Template',
        'docx',
        '/downloads/templates/fire-evacuation-plan.docx',
      ),
    ],
    keywords: ['fire evacuation template'],
  }),
  defineResource({
    slug: 'toolbox-talk-template-pack',
    type: 'templates',
    title: 'Toolbox Talk Template Pack',
    subtitle: 'Twelve editable toolbox talk templates for site briefings.',
    icon: 'Users',
    summary:
      'ZIP pack containing twelve toolbox talk templates covering common site hazards.',
    author: 'CKBHSE Team',
    publishDate: 'March 8, 2024',
    readingTime: '3 min read',
    body: [
      p(
        'Ready-to-use toolbox talk templates for supervisors and site managers.',
      ),
    ],
    tags: ['template', 'toolbox talk', 'toolkit'],
    industrySlugs: ['construction', 'logistics'],
    downloadableFiles: [
      download(
        'Toolbox Talk Template Pack',
        'zip',
        '/downloads/templates/toolbox-talk-pack.zip',
        '12 editable templates',
      ),
    ],
    keywords: ['toolbox talk templates'],
  }),
];

export const checklistResources = [
  defineResource({
    slug: 'site-safety-inspection-checklist',
    type: 'checklists',
    title: 'Site Safety Inspection Checklist',
    subtitle: 'Comprehensive checklist for workplace safety inspections.',
    icon: 'ClipboardList',
    summary:
      'Excel checklist covering housekeeping, PPE, equipment, and emergency arrangements.',
    author: 'CKBHSE Team',
    publishDate: 'April 8, 2024',
    readingTime: '2 min read',
    body: [
      p(
        'Use during routine site inspections to identify hazards and track corrective actions.',
      ),
    ],
    tags: ['checklist', 'inspection'],
    industrySlugs: ['construction', 'manufacturing'],
    downloadableFiles: [
      download(
        'Site Safety Inspection Checklist',
        'xlsx',
        '/downloads/checklists/site-safety-inspection.xlsx',
      ),
    ],
    featured: true,
    keywords: ['site inspection checklist'],
  }),
  defineResource({
    slug: 'cdm-client-checklist',
    type: 'checklists',
    title: 'CDM Client Compliance Checklist',
    subtitle: 'Checklist for construction clients verifying CDM 2015 duties.',
    icon: 'Building2',
    summary:
      'Client-focused checklist covering CDM appointments, documentation, and project notification.',
    author: 'CKBHSE Team',
    publishDate: 'March 25, 2024',
    readingTime: '2 min read',
    body: [
      p(
        'Verify client CDM duties are fulfilled before and during construction projects.',
      ),
    ],
    tags: ['checklist', 'CDM', 'construction'],
    industrySlugs: ['construction'],
    downloadableFiles: [
      download(
        'CDM Client Checklist',
        'xlsx',
        '/downloads/checklists/cdm-client-checklist.xlsx',
      ),
    ],
    relatedResources: [resourceRef('articles', 'understanding-cdm-2015')],
    keywords: ['CDM client checklist'],
  }),
  defineResource({
    slug: 'iso-audit-readiness-checklist',
    type: 'checklists',
    title: 'ISO Audit Readiness Checklist',
    subtitle:
      'Pre-audit checklist for ISO 14001 and 45001 certification audits.',
    icon: 'BadgeCheck',
    summary:
      'Prepare for certification audits with this comprehensive readiness checklist.',
    author: 'CKBHSE Team',
    publishDate: 'March 15, 2024',
    readingTime: '3 min read',
    body: [
      p(
        'Covers documentation, records, internal audits, management review, and corrective actions.',
      ),
    ],
    tags: ['checklist', 'ISO', 'audit'],
    industrySlugs: ['manufacturing'],
    downloadableFiles: [
      download(
        'ISO Audit Readiness Checklist',
        'xlsx',
        '/downloads/checklists/iso-audit-readiness.xlsx',
      ),
    ],
    keywords: ['ISO audit checklist'],
  }),
];
