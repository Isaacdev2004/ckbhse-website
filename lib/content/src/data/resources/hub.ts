import type { ResourcesHubPageContent } from '../../schemas/resources.js';
import { RESOURCE_TYPE_LABELS } from '../../schemas/resources.js';
import type { ResourceTypeId } from '../../schemas/resources.js';

export const resourcesHubPageData = {
  seo: {
    title: 'Knowledge Centre | CKBHSE Limited',
    description:
      'Expert insights, regulatory updates, practical guides, downloadable templates, and webinars on UK health, safety, environment, and quality management.',
  },
  hero: {
    badge: 'Knowledge Centre',
    title: 'Resources & Thought Leadership',
    description:
      'Expert insights, regulatory updates, and practical guidance on health, safety, environment, and quality management — from the CKBHSE consultancy team.',
  },
  resourceTypes: (
    Object.entries(RESOURCE_TYPE_LABELS) as [ResourceTypeId, string][]
  ).map(([id, label]) => ({
    id,
    label,
    description: `${label} from CKBHSE HSEQ experts.`,
  })),
  topicFilters: [
    { id: 'CDM', label: 'CDM & Construction' },
    { id: 'ISO 45001', label: 'ISO 45001' },
    { id: 'fire safety', label: 'Fire Safety' },
    { id: 'COSHH', label: 'COSHH' },
    { id: 'risk assessment', label: 'Risk Assessment' },
    { id: 'wellbeing', label: 'Wellbeing' },
    { id: 'environmental', label: 'Environmental' },
  ],
  industryFilters: [
    { id: 'construction', label: 'Construction' },
    { id: 'manufacturing', label: 'Manufacturing' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'retail', label: 'Retail' },
    { id: 'logistics', label: 'Logistics' },
  ],
  authorFilters: [
    { id: 'Sarah Mitchell', label: 'Sarah Mitchell' },
    { id: 'Dr. James Parker', label: 'Dr. James Parker' },
    { id: 'Emma Richardson', label: 'Emma Richardson' },
    { id: 'Michael Chen', label: 'Michael Chen' },
    { id: 'CKBHSE Team', label: 'CKBHSE Team' },
  ],
  readingTimeFilters: [
    { id: 'short', label: 'Under 5 min' },
    { id: 'medium', label: '5–10 min' },
    { id: 'long', label: 'Over 10 min' },
  ],
  featuredResources: [
    { type: 'articles', slug: 'understanding-cdm-2015' },
    { type: 'articles', slug: 'iso-45001-implementation' },
    { type: 'guides', slug: 'risk-assessment-practitioner-guide' },
    { type: 'templates', slug: 'risk-assessment-template' },
    { type: 'publications', slug: 'hseq-maturity-white-paper' },
    { type: 'webinars', slug: 'cdm-2024-update-briefing' },
  ],
  popularDownloads: [
    { type: 'templates', slug: 'risk-assessment-template' },
    { type: 'checklists', slug: 'site-safety-inspection-checklist' },
    { type: 'templates', slug: 'toolbox-talk-template-pack' },
    { type: 'checklists', slug: 'cdm-client-checklist' },
  ],
  trendingTopics: [
    { label: 'CDM Regulations', tag: 'CDM' },
    { label: 'ISO 45001', tag: 'ISO 45001' },
    { label: 'Fire Safety', tag: 'fire safety' },
    { label: 'Mental Health', tag: 'wellbeing' },
  ],
  regulatoryUpdates: [
    { type: 'news', slug: 'hse-fee-for-intervention-update' },
    { type: 'news', slug: 'building-safety-act-guidance' },
    { type: 'news', slug: 'iso-45001-amendment-2024' },
    { type: 'news', slug: 'hse-workplace-stress-campaign' },
  ],
  webinarSpotlight: [
    { type: 'webinars', slug: 'cdm-2024-update-briefing' },
    { type: 'webinars', slug: 'fire-safety-reform-webinar' },
  ],
  overview: {
    title: 'UK HSEQ authority content',
    paragraphs: [
      'The CKBHSE Knowledge Centre provides original guidance, practical downloads, and regulatory updates to help UK organisations navigate health, safety, environmental, and quality compliance.',
      'Every resource connects to our consultancy services, training programmes, and sector expertise — giving you a clear path from understanding to action.',
    ],
  },
  newsletterCta: {
    title: 'Stay Informed',
    description:
      'Subscribe to receive expert HSEQ insights, regulatory updates, and best practice guidance directly to your inbox.',
  },
  downloadCentre: {
    title: 'Download Centre',
    description:
      'Free templates, checklists, and toolkits to support your compliance programmes. Bespoke versions available on request.',
  },
  faqs: [
    {
      question: 'Are CKBHSE resources free to access?',
      answer:
        'Articles, guides, and news updates are free to read. Templates and checklists are available for download — contact us for bespoke versions aligned to your organisation.',
    },
    {
      question: 'How often is content updated?',
      answer:
        'We publish new articles and regulatory updates regularly. Resource pages show publish and updated dates for transparency.',
    },
    {
      question: 'Can CKBHSE help implement guidance from these resources?',
      answer:
        'Yes. Our consultants provide audits, training, and implementation support across all topics covered in the Knowledge Centre.',
    },
  ],
  consultationCta: {
    title: 'Turn insight into action',
    description:
      'Speak to a CKBHSE consultant about applying Knowledge Centre guidance to your organisation.',
    buttonLabel: 'Book Consultation',
    buttonHref: '/contact',
  },
} satisfies ResourcesHubPageContent;
