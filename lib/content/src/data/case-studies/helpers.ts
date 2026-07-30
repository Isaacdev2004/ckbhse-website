import type {
  CaseStudyIndustryId,
  CaseStudyPageContent,
  ProjectTypeId,
  SuccessMetric,
} from '../../schemas/case-studies.js';
import {
  CASE_STUDY_INDUSTRY_LABELS,
  buildCaseStudyPath,
} from '../../schemas/case-studies.js';
import type { CourseRelationRef } from '../../schemas/training.js';
import type { ResourceRelationRef } from '../../schemas/resources.js';

type ServiceRef = CaseStudyPageContent['relatedServices'][number];
type IndustryRef = CaseStudyPageContent['relatedIndustries'][number];
type CaseStudyRef = NonNullable<CaseStudyPageContent['relatedCaseStudies']>[number];

const INDUSTRY_NAMES: Record<string, string> = {
  construction: 'Construction',
  manufacturing: 'Manufacturing',
  healthcare: 'Healthcare',
  'oil-gas': 'Oil & Gas',
  logistics: 'Logistics & Transport',
  retail: 'Retail & Commercial',
  education: 'Education',
  'public-sector': 'Public Sector',
};

export interface DefineCaseStudyInput {
  slug: string;
  industry: CaseStudyIndustryId;
  title: string;
  subtitle: string;
  icon: CaseStudyPageContent['icon'];
  overview: string;
  clientProfile: string;
  clientSector: string;
  projectType: ProjectTypeId;
  challenge: string;
  objectives: string[];
  methodology: string[];
  servicesDelivered?: ServiceRef[];
  trainingDelivered?: CourseRelationRef[];
  regulatoryFramework: string[];
  timeline: string;
  projectPhases: CaseStudyPageContent['projectPhases'];
  riskProfile: string;
  complianceJourney: string[];
  deliverables: string[];
  measurableResults: string[];
  outcomeMetrics: SuccessMetric[];
  keyStatistics: CaseStudyPageContent['keyStatistics'];
  clientQuote?: CaseStudyPageContent['clientQuote'];
  testimonialReference?: string;
  downloadableSummary?: CaseStudyPageContent['downloadableSummary'];
  relatedServices?: ServiceRef[];
  relatedIndustries?: string[];
  relatedResources?: ResourceRelationRef[];
  relatedCaseStudies?: CaseStudyRef[];
  publishDate?: string;
  featured?: boolean;
  keywords?: string[];
  faqs?: CaseStudyPageContent['faqs'];
}

const DEFAULT_FAQS = [
  {
    question: 'Can CKBHSE deliver similar outcomes for our organisation?',
    answer:
      'Yes. We tailor our approach to your sector, scale, and regulatory context. Contact us for a confidential discussion about your objectives.',
  },
  {
    question: 'Is a downloadable summary available?',
    answer:
      'Where available, case study summaries can be downloaded from the detail page. Contact us for bespoke presentations for board or procurement review.',
  },
];

function industryRef(slug: string): IndustryRef {
  return { slug, name: INDUSTRY_NAMES[slug] ?? slug };
}

export function defineCaseStudy(
  input: DefineCaseStudyInput,
): CaseStudyPageContent {
  const path = buildCaseStudyPath(input.industry, input.slug);
  const industryLabel = CASE_STUDY_INDUSTRY_LABELS[input.industry];

  return {
    slug: input.slug,
    industry: input.industry,
    path,
    title: input.title,
    subtitle: input.subtitle,
    icon: input.icon,
    overview: input.overview,
    clientProfile: input.clientProfile,
    clientSector: input.clientSector,
    projectType: input.projectType,
    challenge: input.challenge,
    objectives: input.objectives,
    methodology: input.methodology,
    servicesDelivered: input.servicesDelivered ?? [],
    trainingDelivered: input.trainingDelivered,
    regulatoryFramework: input.regulatoryFramework,
    timeline: input.timeline,
    projectPhases: input.projectPhases,
    riskProfile: input.riskProfile,
    complianceJourney: input.complianceJourney,
    deliverables: input.deliverables,
    measurableResults: input.measurableResults,
    outcomeMetrics: input.outcomeMetrics,
    keyStatistics: input.keyStatistics,
    clientQuote: input.clientQuote,
    testimonialReference: input.testimonialReference,
    downloadableSummary: input.downloadableSummary,
    relatedServices: input.relatedServices ?? input.servicesDelivered ?? [],
    relatedIndustries: (input.relatedIndustries ?? [input.industry]).map(
      industryRef,
    ),
    relatedResources: input.relatedResources,
    relatedCaseStudies: input.relatedCaseStudies,
    faqs: input.faqs ?? DEFAULT_FAQS,
    cta: {
      title: 'Achieve similar results',
      description:
        'Speak to a CKBHSE consultant about delivering measurable outcomes for your organisation.',
      buttonLabel: 'Book Consultation',
      buttonHref: '/contact',
      action: 'book-consultation',
    },
    seo: {
      title: `${input.title} | CKBHSE Case Study`,
      description: input.overview,
    },
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Case Studies', href: '/case-studies' },
      { label: industryLabel, href: `/case-studies?industry=${input.industry}` },
      { label: input.title, href: path },
    ],
    keywords: input.keywords,
    featured: input.featured,
    publishDate: input.publishDate ?? '2024',
  };
}

export function serviceRef(
  category: ServiceRef['category'],
  slug: string,
): ServiceRef {
  return { category, slug };
}

export function courseRef(
  category: CourseRelationRef['category'],
  slug: string,
): CourseRelationRef {
  return { category, slug };
}

export function resourceRef(
  type: ResourceRelationRef['type'],
  slug: string,
): ResourceRelationRef {
  return { type, slug };
}

export function caseStudyRef(
  industry: CaseStudyIndustryId,
  slug: string,
): CaseStudyRef {
  return { industry, slug };
}

export function metric(
  type: SuccessMetric['type'],
  label: string,
  value: string,
  extra?: Pick<SuccessMetric, 'description' | 'before' | 'after'>,
): SuccessMetric {
  return { type, label, value, ...extra };
}

export function downloadSummary(
  name: string,
  url: string,
): NonNullable<CaseStudyPageContent['downloadableSummary']> {
  return {
    name,
    description: 'Executive summary of project outcomes and methodology.',
    fileType: 'pdf',
    url,
    size: 'Placeholder',
  };
}
