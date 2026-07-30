import { z } from 'zod';

/** Localized copy — `default` is required; locale keys added when i18n lands. */
export const localizedStringSchema = z.object({
  default: z.string().min(1),
});

export type LocalizedString = z.infer<typeof localizedStringSchema>;

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case');

export const seoFieldsSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  canonical: z.string().url().optional(),
  ogImage: z.string().optional(),
  noindex: z.boolean().optional(),
});

export type SeoFields = z.infer<typeof seoFieldsSchema>;

export const contentMetadataSchema = z.object({
  slug: slugSchema,
  seo: seoFieldsSchema,
  locale: z.string().default('en-GB'),
  publishedAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type ContentMetadata = z.infer<typeof contentMetadataSchema>;

export const iconNameSchema = z.enum([
  'Shield',
  'FileCheck',
  'Award',
  'Flame',
  'Leaf',
  'Eye',
  'FlaskConical',
  'AlertCircle',
  'ClipboardList',
  'AlertTriangle',
  'Building2',
  'Factory',
  'Truck',
  'Droplet',
  'Heart',
  'GraduationCap',
  'Store',
  'Building',
  'BookOpen',
  'Users',
  'TrendingUp',
  'Briefcase',
  'MapPin',
  'Target',
  'Compass',
  'Scale',
  'ShieldCheck',
  'BadgeCheck',
  'Lightbulb',
  'Handshake',
  'Recycle',
  'Clock',
]);

export type IconName = z.infer<typeof iconNameSchema>;

export const navLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  available: z.boolean().default(true),
});

export type NavLink = z.infer<typeof navLinkSchema>;

export const navGroupSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  href: z.string().min(1),
  children: z.array(navLinkSchema).default([]),
});

export type NavGroup = z.infer<typeof navGroupSchema>;

export const footerLinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  available: z.boolean().default(true),
});

export type FooterLink = z.infer<typeof footerLinkSchema>;

export const footerSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  links: z.array(footerLinkSchema),
});

export type FooterSection = z.infer<typeof footerSectionSchema>;

export const breadcrumbItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().optional(),
});

export type BreadcrumbItem = z.infer<typeof breadcrumbItemSchema>;

export const pageHeroSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  badge: z.string().optional(),
});

export type PageHero = z.infer<typeof pageHeroSchema>;

export const statItemSchema = z.object({
  icon: iconNameSchema,
  value: z.string().min(1),
  label: z.string().min(1),
});

export type StatItem = z.infer<typeof statItemSchema>;

export const simpleStatSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

export type SimpleStat = z.infer<typeof simpleStatSchema>;
