import type {
  ContentBlock,
  ResourcePageContent,
  ResourceTypeId,
} from '../../schemas/resources.js';
import {
  RESOURCE_TYPE_LABELS,
  buildResourcePath,
} from '../../schemas/resources.js';
import type { CourseRelationRef } from '../../schemas/training.js';

type ServiceRef = ResourcePageContent['relatedServices'][number];
type IndustryRef = ResourcePageContent['industries'][number];
type TrainingRef = NonNullable<ResourcePageContent['relatedTraining']>[number];
type ResourceRef = NonNullable<ResourcePageContent['relatedResources']>[number];

const DEFAULT_FAQS = [
  {
    question: 'Can CKBHSE help implement guidance from this resource?',
    answer:
      'Yes. Our consultants can support you in applying the guidance to your specific operations through audits, training, and documentation support.',
  },
  {
    question: 'Are downloadable files free to use?',
    answer:
      'Templates and checklists are provided for internal use. Contact us for bespoke versions aligned to your organisation.',
  },
];

export interface DefineResourceInput {
  slug: string;
  type: ResourceTypeId;
  title: string;
  subtitle: string;
  icon: ResourcePageContent['icon'];
  summary: string;
  author: string;
  publishDate: string;
  updatedDate?: string;
  readingTime: string;
  body: ContentBlock[];
  tags: string[];
  industrySlugs: string[];
  relatedServices?: ServiceRef[];
  relatedTraining?: TrainingRef[];
  relatedCourses?: CourseRelationRef[];
  relatedResources?: ResourceRef[];
  downloadableFiles?: ResourcePageContent['downloadableFiles'];
  webinar?: ResourcePageContent['webinar'];
  regulatoryType?: ResourcePageContent['regulatoryType'];
  references?: ResourcePageContent['references'];
  featured?: boolean;
  keywords?: string[];
  faqs?: ResourcePageContent['faqs'];
}

const INDUSTRY_NAMES: Record<string, string> = {
  construction: 'Construction',
  manufacturing: 'Manufacturing',
  logistics: 'Logistics & Transport',
  healthcare: 'Healthcare',
  education: 'Education',
  retail: 'Retail & Commercial',
  'public-sector': 'Public Sector',
  'oil-gas': 'Oil & Gas',
};

function industryRef(slug: string): IndustryRef {
  return { slug, name: INDUSTRY_NAMES[slug] ?? slug };
}

export function defineResource(
  input: DefineResourceInput,
): ResourcePageContent {
  const path = buildResourcePath(input.type, input.slug);
  const typeLabel = RESOURCE_TYPE_LABELS[input.type];

  return {
    slug: input.slug,
    type: input.type,
    path,
    title: input.title,
    subtitle: input.subtitle,
    icon: input.icon,
    summary: input.summary,
    author: input.author,
    publishDate: input.publishDate,
    updatedDate: input.updatedDate ?? input.publishDate,
    readingTime: input.readingTime,
    body: input.body,
    downloadableFiles: input.downloadableFiles,
    webinar: input.webinar,
    regulatoryType: input.regulatoryType,
    tags: input.tags,
    industries: input.industrySlugs.map(industryRef),
    relatedServices: input.relatedServices ?? [],
    relatedTraining: input.relatedTraining,
    relatedCourses: input.relatedCourses,
    relatedResources: input.relatedResources,
    references: input.references,
    faqs: input.faqs ?? DEFAULT_FAQS,
    cta: {
      title: 'Need expert support?',
      description:
        'Speak to a CKBHSE consultant about applying this guidance to your organisation.',
      buttonLabel: 'Book Consultation',
      buttonHref: '/contact',
    },
    seo: {
      title: `${input.title} | CKBHSE Knowledge Centre`,
      description: input.summary,
    },
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Resources', href: '/resources' },
      { label: typeLabel, href: `/resources?type=${input.type}` },
      { label: input.title, href: path },
    ],
    keywords: input.keywords,
    featured: input.featured,
  };
}

export function p(text: string): ContentBlock {
  return { type: 'paragraph', text };
}

export function h2(text: string): ContentBlock {
  return { type: 'heading', level: '2', text };
}

export function h3(text: string): ContentBlock {
  return { type: 'heading', level: '3', text };
}

export function ul(items: string[]): ContentBlock {
  return { type: 'list', items, ordered: false };
}

export function serviceRef(
  category: ServiceRef['category'],
  slug: string,
): ServiceRef {
  return { category, slug };
}

export function trainingRef(
  slug: string,
  title: string,
  href: string,
): TrainingRef {
  return { slug, title, href };
}

export function courseRef(
  category: CourseRelationRef['category'],
  slug: string,
): CourseRelationRef {
  return { category, slug };
}

export function resourceRef(type: ResourceTypeId, slug: string): ResourceRef {
  return { type, slug };
}

export function download(
  name: string,
  fileType: 'pdf' | 'docx' | 'xlsx' | 'zip',
  url: string,
  description?: string,
): NonNullable<ResourcePageContent['downloadableFiles']>[number] {
  return { name, fileType, url, description, size: 'Placeholder' };
}
