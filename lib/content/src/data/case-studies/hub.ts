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
      label: 'Average incident reduction',
      value: '42%',
      description: 'Across featured client programmes',
    },
    {
      type: 'certification-achievement',
      label: 'Certifications achieved',
      value: '150+',
      description: 'ISO, IOSH, and sector accreditations',
    },
    {
      type: 'training-completion',
      label: 'Professionals trained',
      value: '12,000+',
      description: 'Delegates across client programmes',
    },
    {
      type: 'compliance-score',
      label: 'Audit pass rate',
      value: '96%',
      description: 'Client regulatory and certification audits',
    },
  ],
  industryStatistics: [
    { label: 'Industries served', value: '12+' },
    { label: 'Case studies published', value: '8' },
    { label: 'Client retention', value: '94%' },
    { label: 'Years of experience', value: '15+' },
  ],
  clientLogos: [
    { name: 'London Development Consortium', industry: 'construction' },
    { name: 'Midlands Automotive Group', industry: 'manufacturing' },
    { name: 'NHS Foundation Trust', industry: 'healthcare' },
    { name: 'North Sea Energy Operator', industry: 'oil-gas' },
    { name: 'National Logistics Group', industry: 'logistics' },
    { name: 'UK Retail Chain', industry: 'retail' },
  ],
  awards: [
    {
      title: 'Health & Safety Excellence',
      issuer: 'British Safety Council',
      year: '2024',
      description: 'Recognised consultancy partner for construction sector programmes.',
    },
    {
      title: 'ISO Implementation Partner',
      issuer: 'UKAS-accredited certification body network',
      year: '2023',
      description: 'Preferred consultancy for ISO 45001 and integrated management systems.',
    },
  ],
  successTimeline: [
    {
      year: '2024',
      title: 'Knowledge Centre launch',
      description: 'Expanded thought leadership and downloadable resources for UK HSEQ professionals.',
    },
    {
      year: '2023',
      title: 'Multi-sector growth',
      description: 'Delivered programmes across construction, healthcare, logistics, and public sector.',
    },
    {
      year: '2022',
      title: 'Training platform expansion',
      description: '29 accredited courses across six training categories.',
    },
    {
      year: '2020',
      title: 'Enterprise platform foundation',
      description: 'Established scalable consultancy delivery model for UK organisations.',
    },
  ],
  relatedResources: [
    { type: 'articles', slug: 'understanding-cdm-2015' },
    { type: 'articles', slug: 'iso-45001-implementation' },
    { type: 'publications', slug: 'hseq-maturity-white-paper' },
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
