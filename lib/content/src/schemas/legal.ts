import { z } from 'zod';
import { seoFieldsSchema } from './base.js';
import { pageHeroSchema } from './base.js';

export const contactPageSchema = z.object({
  seo: seoFieldsSchema,
  hero: pageHeroSchema,
  contactHeading: z.string().min(1),
  form: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    successTitle: z.string().min(1),
    successMessage: z.string().min(1),
    disclaimer: z.string().min(1),
  }),
  office: z.object({
    lines: z.array(z.string().min(1)),
    mapLabel: z.string().min(1),
    mapAddress: z.string().min(1),
  }),
  officeHours: z.object({
    title: z.string().min(1),
    schedule: z.array(
      z.object({
        days: z.string().min(1),
        hours: z.string().min(1),
      }),
    ),
  }),
});

export type ContactPageContent = z.infer<typeof contactPageSchema>;

export const legalSectionSchema = z.object({
  title: z.string().min(1),
  paragraphs: z.array(z.string().min(1)),
  items: z.array(z.string().min(1)).optional(),
});

export type LegalSection = z.infer<typeof legalSectionSchema>;

export const legalPageSchema = z.object({
  seo: seoFieldsSchema,
  title: z.string().min(1),
  lastUpdated: z.string().min(1),
  intro: z.string().min(1).optional(),
  sections: z.array(legalSectionSchema).min(1),
});

export type LegalPageContent = z.infer<typeof legalPageSchema>;
