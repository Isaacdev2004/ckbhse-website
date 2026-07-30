import type { ClientSuccessPageContent } from '../../schemas/client-success.js';
import { buildClientSuccessPath } from '../../schemas/client-success.js';
import type { SuccessMetric } from '../../schemas/case-studies.js';

export interface DefineClientSuccessInput {
  slug: string;
  title: string;
  subtitle: string;
  overview: string;
  statistics: ClientSuccessPageContent['statistics'];
  beforeAfter: ClientSuccessPageContent['beforeAfter'];
  outcomeMetrics: SuccessMetric[];
  clientJourney: ClientSuccessPageContent['clientJourney'];
  methodology: string[];
  improvementMetrics: SuccessMetric[];
  riskReductionMetrics: SuccessMetric[];
  complianceAchievements: string[];
  testimonialSlugs: string[];
  relatedCaseStudies?: ClientSuccessPageContent['relatedCaseStudies'];
  featured?: boolean;
  keywords?: string[];
  faqs?: ClientSuccessPageContent['faqs'];
}

const DEFAULT_FAQS = [
  {
    question: 'How does CKBHSE measure client success?',
    answer:
      'We define success metrics at project outset and track measurable outcomes including incident reduction, compliance scores, training completion, and certification achievement.',
  },
];

export function defineClientSuccess(
  input: DefineClientSuccessInput,
): ClientSuccessPageContent {
  const path = buildClientSuccessPath(input.slug);

  return {
    slug: input.slug,
    path,
    title: input.title,
    subtitle: input.subtitle,
    overview: input.overview,
    statistics: input.statistics,
    beforeAfter: input.beforeAfter,
    outcomeMetrics: input.outcomeMetrics,
    clientJourney: input.clientJourney,
    methodology: input.methodology,
    improvementMetrics: input.improvementMetrics,
    riskReductionMetrics: input.riskReductionMetrics,
    complianceAchievements: input.complianceAchievements,
    testimonialSlugs: input.testimonialSlugs,
    relatedCaseStudies: input.relatedCaseStudies,
    faqs: input.faqs ?? DEFAULT_FAQS,
    cta: {
      title: 'Start your success journey',
      description:
        'Speak to a CKBHSE consultant about achieving measurable outcomes for your organisation.',
      buttonLabel: 'Request Proposal',
      buttonHref: '/contact',
      action: 'request-proposal',
    },
    seo: {
      title: `${input.title} | CKBHSE Client Success`,
      description: input.overview,
    },
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Client Success', href: '/client-success' },
      { label: input.title, href: path },
    ],
    keywords: input.keywords,
    featured: input.featured,
  };
}

export function metric(
  type: SuccessMetric['type'],
  label: string,
  value: string,
  extra?: Pick<SuccessMetric, 'before' | 'after' | 'description'>,
): SuccessMetric {
  return { type, label, value, ...extra };
}
