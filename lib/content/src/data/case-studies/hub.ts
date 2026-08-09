import type { CaseStudiesHubPageContent } from '../../schemas/case-studies.js';
import {
  CASE_STUDY_INDUSTRY_LABELS,
  PROJECT_TYPE_LABELS,
  SUCCESS_METRIC_LABELS,
} from '../../schemas/case-studies.js';
import type { CaseStudyIndustryId } from '../../schemas/case-studies.js';
import type { ProjectTypeId } from '../../schemas/case-studies.js';
import type { SuccessMetricType } from '../../schemas/case-studies.js';

export const caseStudiesHubPageData = {
  seo: {
    title: 'Case Studies | CKBHSE Limited',
    description:
      'Real-world client success stories demonstrating measurable safety improvements, compliance achievements, and operational excellence across UK industries.',
  },
  hero: {
    badge: 'Client Success',
    title: 'Case Studies',
    description:
      'Evidence of measurable outcomes — from CDM compliance and ISO certification to fleet safety transformation and offshore process safety.',
  },
  industryFilters: (
    Object.entries(CASE_STUDY_INDUSTRY_LABELS) as [CaseStudyIndustryId, string][]
  ).map(([id, label]) => ({ id, label })),
  serviceFilters: [
    { id: 'health-safety', label: 'Health & Safety' },
    { id: 'iso-management', label: 'ISO & Management Systems' },
    { id: 'compliance-regulatory', label: 'Compliance & Regulatory' },
    { id: 'occupational-health', label: 'Occupational Health' },
    { id: 'business-risk', label: 'Business Risk' },
  ],
  projectTypeFilters: (
    Object.entries(PROJECT_TYPE_LABELS) as [ProjectTypeId, string][]
  ).map(([id, label]) => ({ id, label })),
  resultFilters: (
    Object.entries(SUCCESS_METRIC_LABELS) as [SuccessMetricType, string][]
  ).map(([id, label]) => ({ id, label })),
  featuredCaseStudies: [
    { industry: 'construction', slug: 'cdm-london-development' },
    { industry: 'manufacturing', slug: 'iso-45001-certification' },
    { industry: 'healthcare', slug: 'coshh-multi-site-trust' },
    { industry: 'oil-gas', slug: 'offshore-process-safety' },
  ],
  featuredSuccessStories: [
    'construction-excellence',
    'manufacturing-transformation',
    'healthcare-compliance',
    'multi-sector-impact',
  ],
  aggregateMetrics: [
    {
      type: 'incident-reduction',
      label: 'Focus area',
      value: 'Risk',
      description: 'Practical risk reduction and safer working practices',
    },
    {
      type: 'certification-achievement',
      label: 'Focus area',
      value: 'ISO',
      description: 'Management system and certification support',
    },
    {
      type: 'training-completion',
      label: 'Focus area',
      value: 'Training',
      description: 'Role-relevant workplace training support',
    },
    {
      type: 'compliance-score',
      label: 'Focus area',
      value: 'Assurance',
      description: 'Audits and reviews to identify gaps and actions',
    },
  ],
  industryStatistics: [
    { label: 'Industries served', value: '12+' },
    { label: 'Case studies published', value: '8' },
    { label: 'Delivery model', value: 'UK-wide' },
    { label: 'Service focus', value: 'HSE' },
  ],
  clientLogos: [
    { name: 'London Development Consortium', industry: 'construction' },
    { name: 'Midlands Automotive Group', industry: 'manufacturing' },
    { name: 'NHS Foundation Trust', industry: 'healthcare' },
    { name: 'North Sea Energy Operator', industry: 'oil-gas' },
    { name: 'National Logistics Group', industry: 'logistics' },
    { name: 'UK Retail Chain', industry: 'retail' },
  ],
  awards: [],
  successTimeline: [
    {
      year: '2026',
      title: 'Public website and knowledge hub',
      description:
        'Launched the CKBHSE public website to support UK organisations seeking HSE advisory, training and assurance.',
    },
  ],
  relatedResources: [
    { type: 'articles', slug: 'understanding-cdm-2015' },
    { type: 'articles', slug: 'iso-45001-implementation' },
    { type: 'publications', slug: 'hse-maturity-white-paper' },
  ],
  faqs: [
    {
      question: 'Can CKBHSE share case studies relevant to our sector?',
      answer:
        'Yes. Use the industry and service filters above, or contact us for sector-specific examples and references.',
    },
    {
      question: 'Are client names anonymised?',
      answer:
        'Some case studies use anonymised client profiles where confidentiality agreements apply. Outcomes and metrics remain verified.',
    },
    {
      question: 'Can we request a downloadable summary?',
      answer:
        'Where available, executive summaries can be downloaded from individual case study pages. Contact us for bespoke presentations.',
    },
  ],
  consultationCta: {
    title: 'Ready to achieve similar results?',
    description:
      "Let's discuss how CKBHSE can help your organisation improve safety performance, achieve compliance, and create lasting value.",
    buttonLabel: 'Book Consultation',
    buttonHref: '/contact',
    action: 'book-consultation',
  },
} satisfies CaseStudiesHubPageContent;
