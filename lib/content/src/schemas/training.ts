import { z } from 'zod';
import {
  breadcrumbItemSchema,
  iconNameSchema,
  pageHeroSchema,
  seoFieldsSchema,
  slugSchema,
} from './base.js';
import { ctaBlockSchema, featureItemSchema } from './corporate.js';
import {
  faqItemSchema,
  serviceIndustryRefSchema,
  serviceRelationRefSchema,
  serviceTestimonialSchema,
} from './services.js';

export const trainingCategoryIdSchema = z.enum([
  'health-safety',
  'environmental',
  'occupational-health',
  'iso-management',
  'compliance-governance',
  'leadership-culture',
]);

export type TrainingCategoryId = z.infer<typeof trainingCategoryIdSchema>;

export const TRAINING_CATEGORY_LABELS: Record<TrainingCategoryId, string> = {
  'health-safety': 'Health & Safety',
  environmental: 'Environmental',
  'occupational-health': 'Occupational Health',
  'iso-management': 'ISO & Management Systems',
  'compliance-governance': 'Compliance & Governance',
  'leadership-culture': 'Leadership & Culture',
};

export const trainingCategorySchema = z.object({
  id: trainingCategoryIdSchema,
  label: z.string().min(1),
  description: z.string().min(1),
});

export const deliveryMethodIdSchema = z.enum([
  'classroom',
  'online',
  'on-site',
  'virtual-instructor-led',
]);

export type DeliveryMethodId = z.infer<typeof deliveryMethodIdSchema>;

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethodId, string> = {
  classroom: 'Classroom',
  online: 'Online',
  'on-site': 'On-site',
  'virtual-instructor-led': 'Virtual Instructor-Led',
};

export const deliveryMethodSchema = z.object({
  id: deliveryMethodIdSchema,
  label: z.string().min(1),
  description: z.string().min(1),
});

export const pathwayLevelIdSchema = z.enum([
  'foundation',
  'intermediate',
  'advanced',
  'leadership',
]);

export type PathwayLevelId = z.infer<typeof pathwayLevelIdSchema>;

export const PATHWAY_LEVEL_LABELS: Record<PathwayLevelId, string> = {
  foundation: 'Foundation',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  leadership: 'Leadership',
};

export const courseRelationRefSchema = z.object({
  category: trainingCategoryIdSchema,
  slug: slugSchema,
});

export type CourseRelationRef = z.infer<typeof courseRelationRefSchema>;

export const courseOutlineModuleSchema = z.object({
  module: z.string().min(1),
  topics: z.array(z.string().min(1)),
});

export const certificationSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  accreditedBy: z.string().min(1).optional(),
});

export const courseResourceRefSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1),
  href: z.string().min(1),
  available: z.boolean().optional(),
});

export const trainingCatalogItemSchema = z.object({
  category: trainingCategoryIdSchema,
  slug: slugSchema,
  icon: iconNameSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  accreditation: z.string().min(1),
  level: pathwayLevelIdSchema,
  duration: z.string().min(1),
  deliveryMethods: z.array(deliveryMethodIdSchema),
  certification: z.string().min(1),
  industries: z.array(slugSchema),
  pathwayLevel: pathwayLevelIdSchema.optional(),
  featured: z.boolean().optional(),
  keywords: z.array(z.string().min(1)).optional(),
});

export type TrainingCatalogItem = z.infer<typeof trainingCatalogItemSchema>;

export const coursePageSchema = z.object({
  slug: slugSchema,
  category: trainingCategoryIdSchema,
  path: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  icon: iconNameSchema,
  hero: pageHeroSchema,
  overview: z.array(z.string().min(1)),
  learningObjectives: z.array(z.string().min(1)),
  targetAudience: z.array(z.string().min(1)),
  prerequisites: z.array(z.string().min(1)),
  deliveryMethods: z.array(deliveryMethodSchema),
  duration: z.string().min(1),
  certification: certificationSchema,
  assessment: z.string().min(1),
  courseOutline: z.array(courseOutlineModuleSchema),
  learningOutcomes: z.array(z.string().min(1)),
  industries: z.array(serviceIndustryRefSchema),
  relatedServices: z.array(serviceRelationRefSchema),
  relatedIndustries: z.array(serviceIndustryRefSchema).optional(),
  relatedResources: z.array(courseResourceRefSchema).optional(),
  relatedCourses: z.array(courseRelationRefSchema).optional(),
  pathwayLevel: pathwayLevelIdSchema.optional(),
  faqs: z.array(faqItemSchema),
  testimonial: serviceTestimonialSchema.optional(),
  cta: ctaBlockSchema,
  seo: seoFieldsSchema,
  breadcrumbs: z.array(breadcrumbItemSchema),
  keywords: z.array(z.string().min(1)).optional(),
  featured: z.boolean().optional(),
  accreditation: z.string().min(1),
  level: pathwayLevelIdSchema,
  price: z.string().min(1),
});

export type CoursePageContent = z.infer<typeof coursePageSchema>;

export const learningPathwaySchema = z.object({
  level: pathwayLevelIdSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  courses: z.array(courseRelationRefSchema),
});

export type LearningPathway = z.infer<typeof learningPathwaySchema>;

export const trainingHubPageSchema = z.object({
  seo: seoFieldsSchema,
  hero: pageHeroSchema,
  categories: z.array(trainingCategorySchema),
  deliveryMethodFilters: z.array(
    z.object({ id: deliveryMethodIdSchema, label: z.string().min(1) }),
  ),
  industryFilters: z.array(
    z.object({ id: slugSchema, label: z.string().min(1) }),
  ),
  certificationFilters: z.array(
    z.object({ id: z.string().min(1), label: z.string().min(1) }),
  ),
  durationFilters: z.array(
    z.object({ id: z.string().min(1), label: z.string().min(1) }),
  ),
  pathwayLevels: z.array(
    z.object({ id: pathwayLevelIdSchema, label: z.string().min(1) }),
  ),
  featuredCourses: z.array(courseRelationRefSchema),
  overview: z.object({
    title: z.string().min(1),
    paragraphs: z.array(z.string().min(1)),
  }),
  whyTrain: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    items: z.array(featureItemSchema),
  }),
  learningPathways: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    pathways: z.array(learningPathwaySchema),
  }),
  corporateTraining: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    offerings: z.array(
      z.object({
        icon: iconNameSchema,
        title: z.string().min(1),
        description: z.string().min(1),
      }),
    ),
  }),
  faqs: z.array(faqItemSchema),
  consultationCta: ctaBlockSchema,
});

export type TrainingHubPageContent = z.infer<typeof trainingHubPageSchema>;

/** Backward-compatible alias for hub loader. */
export type TrainingPageHubContent = TrainingHubPageContent;

export function buildTrainingPath(
  category: TrainingCategoryId,
  slug: string,
): string {
  return `/training/${category}/${slug}`;
}

export function buildTrainingHref(
  category: TrainingCategoryId,
  slug: string,
): string {
  return buildTrainingPath(category, slug);
}
