import { z } from 'zod';
import {
  contentMetadataSchema,
  iconNameSchema,
  pageHeroSchema,
  seoFieldsSchema,
  statItemSchema,
} from './base.js';
import { faqItemSchema } from './services.js';

export { pageHeroSchema, statItemSchema };
export type { PageHero, StatItem } from './base.js';

export const serviceSummarySchema = z.object({
  icon: iconNameSchema,
  title: z.string().min(1),
  description: z.string().min(1),
});

export const serviceDetailSchema = z.object({
  slug: z.string().min(1),
  icon: iconNameSchema,
  title: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  features: z.array(z.string().min(1)),
});

export const industryDetailSchema = z.object({
  slug: z.string().min(1),
  icon: iconNameSchema,
  name: z.string().min(1),
  description: z.string().min(1),
  challenges: z.array(z.string().min(1)),
  solutions: z.array(z.string().min(1)),
});

export const industrySummarySchema = z.object({
  icon: iconNameSchema,
  name: z.string().min(1),
  description: z.string().min(1),
});

export const courseSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  accreditation: z.string().min(1),
  level: z.string().min(1),
  duration: z.string().min(1),
  format: z.array(z.string().min(1)),
  description: z.string().min(1),
  outcomes: z.array(z.string().min(1)),
  price: z.string().min(1),
});

export const articleSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  excerpt: z.string().min(1),
  author: z.string().min(1),
  readTime: z.string().min(1),
  date: z.string().min(1),
  featured: z.boolean(),
});

export {
  caseStudiesHubPageSchema,
  caseStudyPageSchema,
  caseStudyCatalogItemSchema,
  caseStudyRelationRefSchema,
  buildCaseStudyPath,
  buildCaseStudyHref,
  CASE_STUDY_INDUSTRY_LABELS,
  PROJECT_TYPE_LABELS,
  SUCCESS_METRIC_LABELS,
  type CaseStudiesHubPageContent,
  type CaseStudyPageContent,
  type CaseStudyCatalogItem,
  type CaseStudyIndustryId,
  type ProjectTypeId,
  type SuccessMetric,
  type SuccessMetricType,
  type ConversionAction,
  type ClientLogo,
  type Award,
} from './case-studies.js';

export {
  testimonialsHubPageSchema,
  testimonialPageSchema,
  testimonialCatalogItemSchema,
  buildTestimonialPath,
  TESTIMONIAL_CATEGORY_LABELS,
  type TestimonialsHubPageContent,
  type TestimonialPageContent,
  type TestimonialCatalogItem,
  type TestimonialCategory,
} from './testimonials.js';

export {
  clientSuccessHubPageSchema,
  clientSuccessPageSchema,
  clientSuccessCatalogItemSchema,
  buildClientSuccessPath,
  type ClientSuccessHubPageContent,
  type ClientSuccessPageContent,
  type ClientSuccessCatalogItem,
  type BeforeAfterComparison,
} from './client-success.js';
export {
  caseStudiesHubPageSchema as caseStudiesPageSchema,
  type CaseStudiesHubPageContent as CaseStudiesPageContent,
} from './case-studies.js';

export const careerBenefitSchema = z.object({
  icon: iconNameSchema,
  title: z.string().min(1),
  description: z.string().min(1),
});

export const jobVacancySchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  location: z.string().min(1),
  type: z.string().min(1),
  salary: z.string().min(1),
  description: z.string().min(1),
  requirements: z.array(z.string().min(1)),
});

export const homePageSchema = z.object({
  seo: seoFieldsSchema,
  hero: z.object({
    badge: z.string().min(1),
    title: z.string().min(1),
    titleHighlight: z.string().min(1),
    description: z.string().min(1),
  }),
  stats: z.array(statItemSchema),
  coreServices: z.array(serviceSummarySchema),
  industries: z.array(industrySummarySchema),
  trustSignals: z.array(z.string().min(1)),
  sections: z.object({
    services: z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    }),
    industries: z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    }),
    training: z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    }),
    finalCta: z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    }),
  }),
});

export type HomePageContent = z.infer<typeof homePageSchema>;

export {
  industriesPageSchema,
  type IndustriesPageContent,
} from './industries.js';

export {
  trainingHubPageSchema,
  coursePageSchema,
  type TrainingHubPageContent,
  type CoursePageContent,
  type TrainingCatalogItem,
  type TrainingCategoryId,
  buildTrainingPath,
  buildTrainingHref,
  PATHWAY_LEVEL_LABELS,
  TRAINING_CATEGORY_LABELS,
} from './training.js';

/** Backward-compatible hub schema alias. */
export { trainingHubPageSchema as trainingPageSchema } from './training.js';
export type { TrainingHubPageContent as TrainingPageContent } from './training.js';

export {
  resourcesHubPageSchema,
  resourcePageSchema,
  type ResourcesHubPageContent,
  type ResourcePageContent,
  type ResourceCatalogItem,
  type ResourceTypeId,
  buildResourcePath,
  RESOURCE_TYPE_LABELS,
} from './resources.js';

/** Backward-compatible hub schema and type aliases. */
export { resourcesHubPageSchema as knowledgePageSchema } from './resources.js';
export type { ResourcesHubPageContent as KnowledgePageContent } from './resources.js';

export const careersPageSchema = z.object({
  seo: seoFieldsSchema,
  hero: pageHeroSchema,
  benefitsHeading: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
  benefits: z.array(careerBenefitSchema),
  positionsHeading: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
  positions: z.array(jobVacancySchema),
  generalApplicationCta: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),
});

export type CareersPageContent = z.infer<typeof careersPageSchema>;

export const faqPageSchema = z.object({
  seo: seoFieldsSchema,
  hero: pageHeroSchema,
  faqs: z.array(faqItemSchema).min(1),
  cta: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    buttonLabel: z.string().min(1),
    buttonHref: z.string().min(1),
  }),
});

export type FaqPageContent = z.infer<typeof faqPageSchema>;

export const siteConfigSchema = z.object({
  brand: z.object({
    name: z.string().min(1),
    tagline: z.string().min(1),
    description: z.string().min(1),
  }),
  contact: z.object({
    email: z.string().email(),
    phone: z.string().min(1),
    phoneHref: z.string().min(1),
    location: z.string().min(1),
  }),
  cta: z.object({
    label: z.string().min(1),
    href: z.string().min(1),
  }),
  navigation: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      href: z.string().min(1),
      children: z.array(
        z.object({
          label: z.string().min(1),
          href: z.string().min(1),
          available: z.boolean().default(true),
        }),
      ),
    }),
  ),
  footer: z.object({
    blurb: z.string().min(1),
    copyright: z.string().min(1),
    sections: z.array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        links: z.array(
          z.object({
            label: z.string().min(1),
            href: z.string().min(1),
            available: z.boolean().default(true),
          }),
        ),
      }),
    ),
    legal: z.array(
      z.object({
        label: z.string().min(1),
        href: z.string().min(1),
        available: z.boolean().default(true),
      }),
    ),
    utility: z.array(
      z.object({
        label: z.string().min(1),
        href: z.string().min(1),
        available: z.boolean().default(true),
      }),
    ),
    accreditations: z.array(
      z.object({
        label: z.string().min(1),
        available: z.boolean().default(false),
      }),
    ),
    social: z.array(
      z.object({
        platform: z.enum(['linkedin', 'twitter', 'facebook']),
        href: z.string().url(),
        label: z.string().min(1),
      }),
    ),
  }),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;

export { contentMetadataSchema };
