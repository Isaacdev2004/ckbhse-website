import { z } from 'zod';
import {
  breadcrumbItemSchema,
  iconNameSchema,
  seoFieldsSchema,
  slugSchema,
} from './base.js';
import { pageHeroSchema, statItemSchema } from './base.js';

export const ctaBlockSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  buttonLabel: z.string().min(1),
  buttonHref: z.string().min(1),
});

export const valueCardSchema = z.object({
  icon: iconNameSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  supportingStatement: z.string().optional(),
});

export const featureItemSchema = z.object({
  icon: iconNameSchema,
  title: z.string().min(1),
  description: z.string().min(1),
});

export const timelineItemSchema = z.object({
  year: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const leaderSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  role: z.string().min(1),
  group: z.enum(['executive', 'directors', 'consultants', 'advisors']),
  bio: z.string().min(1),
});

export const accreditationItemSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  category: z.enum(['iso', 'membership', 'award', 'professional-body']),
  description: z.string().min(1),
  icon: iconNameSchema,
});

export const partnerItemSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  category: z.enum(['technology', 'industry', 'strategic', 'training']),
  description: z.string().min(1),
});

export const governanceItemSchema = z.object({
  icon: iconNameSchema,
  title: z.string().min(1),
  description: z.string().min(1),
});

const proseSectionSchema = z.object({
  type: z.literal('prose'),
  title: z.string().min(1),
  paragraphs: z.array(z.string().min(1)),
});

const valuesSectionSchema = z.object({
  type: z.literal('values'),
  title: z.string().min(1),
  description: z.string().optional(),
  items: z.array(valueCardSchema),
});

const timelineSectionSchema = z.object({
  type: z.literal('timeline'),
  title: z.string().min(1),
  items: z.array(timelineItemSchema),
});

const statsSectionSchema = z.object({
  type: z.literal('stats'),
  title: z.string().optional(),
  items: z.array(statItemSchema),
});

const leadershipSectionSchema = z.object({
  type: z.literal('leadership'),
  title: z.string().min(1),
  description: z.string().optional(),
  members: z.array(leaderSchema),
});

const featuresSectionSchema = z.object({
  type: z.literal('features'),
  title: z.string().min(1),
  description: z.string().optional(),
  items: z.array(featureItemSchema),
});

const accreditationsSectionSchema = z.object({
  type: z.literal('accreditations'),
  title: z.string().min(1),
  description: z.string().optional(),
  items: z.array(accreditationItemSchema),
});

const partnersSectionSchema = z.object({
  type: z.literal('partners'),
  title: z.string().min(1),
  description: z.string().optional(),
  items: z.array(partnerItemSchema),
});

const governanceSectionSchema = z.object({
  type: z.literal('governance'),
  title: z.string().min(1),
  description: z.string().optional(),
  items: z.array(governanceItemSchema),
});

const quoteSectionSchema = z.object({
  type: z.literal('quote'),
  text: z.string().min(1),
  attribution: z.string().optional(),
});

const listSectionSchema = z.object({
  type: z.literal('list'),
  title: z.string().min(1),
  items: z.array(z.string().min(1)),
});

const ctaSectionSchema = z.object({
  type: z.literal('cta'),
  title: z.string().min(1),
  description: z.string().min(1),
  buttonLabel: z.string().min(1),
  buttonHref: z.string().min(1),
});

export const corporateSectionSchema = z.discriminatedUnion('type', [
  proseSectionSchema,
  valuesSectionSchema,
  timelineSectionSchema,
  statsSectionSchema,
  leadershipSectionSchema,
  featuresSectionSchema,
  accreditationsSectionSchema,
  partnersSectionSchema,
  governanceSectionSchema,
  quoteSectionSchema,
  listSectionSchema,
  ctaSectionSchema,
]);

export type CorporateSection = z.infer<typeof corporateSectionSchema>;

export type ValueCard = z.infer<typeof valueCardSchema>;
export type FeatureItem = z.infer<typeof featureItemSchema>;
export type TimelineItem = z.infer<typeof timelineItemSchema>;
export type Leader = z.infer<typeof leaderSchema>;
export type AccreditationItem = z.infer<typeof accreditationItemSchema>;
export type PartnerItem = z.infer<typeof partnerItemSchema>;
export type GovernanceItem = z.infer<typeof governanceItemSchema>;
export type CtaBlock = z.infer<typeof ctaBlockSchema>;

export const corporatePageSchema = z.object({
  slug: slugSchema,
  path: z.string().min(1),
  seo: seoFieldsSchema,
  hero: pageHeroSchema,
  breadcrumbs: z.array(breadcrumbItemSchema),
  sections: z.array(corporateSectionSchema),
  cta: ctaBlockSchema.optional(),
});

export type CorporatePageContent = z.infer<typeof corporatePageSchema>;
