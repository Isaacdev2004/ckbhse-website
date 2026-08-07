import type {
  ServiceCategoryId,
  ServicePageContent,
} from '../../schemas/services.js';
import {
  SERVICE_CATEGORY_LABELS,
  buildServicePath,
} from '../../schemas/services.js';

const DEFAULT_METHODOLOGY = [
  {
    step: '01',
    title: 'Discovery & Scoping',
    description:
      'We review your operations, regulatory context, and objectives to define a clear scope and success criteria.',
  },
  {
    step: '02',
    title: 'Assessment & Analysis',
    description:
      'Our consultants conduct structured assessments, site reviews, and gap analysis against applicable standards.',
  },
  {
    step: '03',
    title: 'Recommendations & Planning',
    description:
      'You receive prioritised findings, actionable recommendations, and an implementation roadmap.',
  },
  {
    step: '04',
    title: 'Implementation Support',
    description:
      'We support your team with documentation, training, and practical guidance to embed improvements.',
  },
  {
    step: '05',
    title: 'Verification & Review',
    description:
      'Follow-up reviews verify closure of actions and measure sustained compliance performance.',
  },
];

const DEFAULT_DELIVERABLES = [
  'Detailed consultancy report with findings and recommendations',
  'Prioritised action plan with responsible owners and timelines',
  'Supporting documentation templates where applicable',
  'Executive summary for board and leadership reporting',
  'Optional follow-up review session',
];

const DEFAULT_RESULTS = [
  'Improved regulatory compliance and audit readiness',
  'Reduced workplace risk and incident potential',
  'Clear documentation for directors and stakeholders',
  'Practical improvements your teams can implement',
];

const DEFAULT_FAQS = [
  {
    question: 'How quickly can CKBHSE mobilise?',
    answer:
      'Standard engagements can typically commence within 5–10 working days. Urgent incident or enforcement support is prioritised according to agreed SLAs.',
  },
  {
    question: 'Do you work on-site and remotely?',
    answer:
      'Yes. We combine on-site inspections and workshops with remote document review and reporting to deliver efficiently nationwide.',
  },
  {
    question: 'Can this service be delivered under a retainer?',
    answer:
      'Most services are available as standalone projects or as part of our retained advisory packages for ongoing support.',
  },
];

export interface DefineServiceInput {
  slug: string;
  category: ServiceCategoryId;
  title: string;
  subtitle: string;
  icon: ServicePageContent['icon'];
  summary: string;
  overview: string[];
  objectives: string[];
  keyBenefits: ServicePageContent['keyBenefits'];
  industrySlugs: string[];
  regulations: string[];
  deliverables?: string[];
  timeline?: string;
  expectedResults?: string[];
  methodology?: ServicePageContent['methodology'];
  faqs?: ServicePageContent['faqs'];
  relatedServices?: ServicePageContent['relatedServices'];
  relatedTraining?: ServicePageContent['relatedTraining'];
  relatedCaseStudies?: ServicePageContent['relatedCaseStudies'];
  testimonial?: ServicePageContent['testimonial'];
  keywords?: string[];
  featured?: boolean;
  seo?: ServicePageContent['seo'];
}

const INDUSTRY_NAMES: Record<string, string> = {
  construction: 'Construction',
  manufacturing: 'Manufacturing',
  logistics: 'Logistics & Transport',
  'oil-gas': 'Oil & Gas',
  healthcare: 'Healthcare',
  retail: 'Retail & Commercial',
};

export function defineService(input: DefineServiceInput): ServicePageContent {
  const path = buildServicePath(input.category, input.slug);
  const categoryLabel = SERVICE_CATEGORY_LABELS[input.category];

  return {
    slug: input.slug,
    category: input.category,
    path,
    title: input.title,
    subtitle: input.subtitle,
    icon: input.icon,
    hero: {
      badge: categoryLabel,
      title: input.title,
      description: input.subtitle,
    },
    summary: input.summary,
    overview: input.overview,
    objectives: input.objectives,
    keyBenefits: input.keyBenefits,
    industries: input.industrySlugs.map((slug) => ({
      slug,
      name: INDUSTRY_NAMES[slug] ?? slug,
    })),
    regulations: input.regulations,
    methodology: input.methodology ?? DEFAULT_METHODOLOGY,
    deliverables: input.deliverables ?? DEFAULT_DELIVERABLES,
    timeline:
      input.timeline ?? 'Typical engagement: 2–6 weeks depending on scope',
    expectedResults: input.expectedResults ?? DEFAULT_RESULTS,
    faqs: input.faqs ?? DEFAULT_FAQS,
    relatedServices: input.relatedServices ?? [],
    relatedTraining: input.relatedTraining,
    relatedCaseStudies: input.relatedCaseStudies,
    testimonial: input.testimonial,
    keywords: input.keywords ?? [
      input.title,
      categoryLabel,
      'HSE consultancy',
    ],
    featured: input.featured,
    seo: input.seo ?? {
      title: `${input.title} | CKBHSE Limited`,
      description: input.summary,
    },
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Services', href: '/services' },
      {
        label: categoryLabel,
        href: `/services?category=${input.category}`,
      },
      { label: input.title, href: path },
    ],
    cta: {
      title: `Book a consultation for ${input.title}`,
      description:
        'Speak with a senior consultant about your requirements and receive a tailored proposal.',
      buttonLabel: 'Book Consultation',
      buttonHref: '/contact',
    },
  };
}

export const benefit = (
  icon: ServicePageContent['keyBenefits'][number]['icon'],
  title: string,
  description: string,
) => ({ icon, title, description });
