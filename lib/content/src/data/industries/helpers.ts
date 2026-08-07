import type {
  IndustryPageContent,
  IndustrySectorId,
} from '../../schemas/industries.js';
import {
  INDUSTRY_SECTOR_LABELS,
  buildIndustryPath,
} from '../../schemas/industries.js';

type ServiceRef = IndustryPageContent['applicableServices'][number];

const DEFAULT_METHODOLOGY = [
  {
    step: '01',
    title: 'Sector Discovery',
    description:
      'We assess your operations, regulatory profile, and industry-specific hazards before scoping engagement.',
  },
  {
    step: '02',
    title: 'Compliance Gap Analysis',
    description:
      'Structured review against sector legislation, HSE guidance, and recognised standards.',
  },
  {
    step: '03',
    title: 'Prioritised Roadmap',
    description:
      'Findings translated into a practical action plan aligned to your risk appetite and resources.',
  },
  {
    step: '04',
    title: 'Implementation Support',
    description:
      'Documentation, training, and on-site support to embed sustainable compliance.',
  },
  {
    step: '05',
    title: 'Assurance & Review',
    description:
      'Follow-up audits and KPI tracking to verify sustained performance.',
  },
];

const DEFAULT_FAQS = [
  {
    question: 'Do you have consultants with sector experience?',
    answer:
      'Yes. CKBHSE assigns consultants with demonstrable experience in your industry sector, not generalists learning on the job.',
  },
  {
    question: 'Can you support multi-site operations?',
    answer:
      'We deliver nationwide for organisations with single or multiple sites, with consistent methodology and reporting.',
  },
  {
    question: 'How do industry pages relate to your services?',
    answer:
      'Each industry page maps sector risks to specific CKBHSE consultancy services and training programmes — all recommendations are actionable through our service catalogue.',
  },
];

export interface DefineIndustryInput {
  slug: string;
  sector: IndustrySectorId;
  name: string;
  icon: IndustryPageContent['icon'];
  summary: string;
  overview: string[];
  topics: string[];
  challenges: string[];
  regulatoryFramework: IndustryPageContent['regulatoryFramework'];
  commonRisks: IndustryPageContent['commonRisks'];
  complianceRequirements: string[];
  requiredDocumentation: string[];
  applicableServices: ServiceRef[];
  recommendedTraining: IndustryPageContent['recommendedTraining'];
  relevantCaseStudies?: IndustryPageContent['relevantCaseStudies'];
  downloadableResources?: IndustryPageContent['downloadableResources'];
  standards: string[];
  industryStatistics?: IndustryPageContent['industryStatistics'];
  methodology?: IndustryPageContent['methodology'];
  faqs?: IndustryPageContent['faqs'];
  testimonial?: IndustryPageContent['testimonial'];
  keywords?: string[];
  featured?: boolean;
  seo?: IndustryPageContent['seo'];
}

export function defineIndustry(
  input: DefineIndustryInput,
): IndustryPageContent {
  const path = buildIndustryPath(input.slug);
  const sectorLabel = INDUSTRY_SECTOR_LABELS[input.sector];

  return {
    slug: input.slug,
    sector: input.sector,
    path,
    icon: input.icon,
    name: input.name,
    hero: {
      badge: sectorLabel,
      title: input.name,
      description: input.summary,
    },
    overview: input.overview,
    topics: input.topics,
    challenges: input.challenges,
    regulatoryFramework: input.regulatoryFramework,
    commonRisks: input.commonRisks,
    complianceRequirements: input.complianceRequirements,
    requiredDocumentation: input.requiredDocumentation,
    applicableServices: input.applicableServices,
    recommendedTraining: input.recommendedTraining,
    relevantCaseStudies: input.relevantCaseStudies,
    downloadableResources: input.downloadableResources,
    standards: input.standards,
    methodology: input.methodology ?? DEFAULT_METHODOLOGY,
    industryStatistics: input.industryStatistics,
    faqs: input.faqs ?? DEFAULT_FAQS,
    testimonial: input.testimonial,
    keywords: input.keywords ?? [
      input.name,
      sectorLabel,
      'HSE',
      'UK compliance',
    ],
    featured: input.featured,
    seo: input.seo ?? {
      title: `${input.name} HSE Consultancy | CKBHSE Limited`,
      description: input.summary,
    },
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Industries', href: '/industries' },
      { label: input.name, href: path },
    ],
    cta: {
      title: `Discuss ${input.name} compliance with our team`,
      description:
        'Book a consultation to review your sector risks and receive a tailored CKBHSE proposal.',
      buttonLabel: 'Book Consultation',
      buttonHref: '/contact',
    },
  };
}

export const risk = (
  title: string,
  description: string,
  severity?: 'high' | 'medium' | 'low',
) => ({ title, description, severity });

export const regulation = (name: string, description: string) => ({
  name,
  description,
});
