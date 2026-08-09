import { z } from 'zod';
import { seoFieldsSchema } from './base.js';
import { pageHeroSchema } from './base.js';

export const contactFormFieldSchema = z.object({
  label: z.string().min(1),
  placeholder: z.string().min(1),
  required: z.boolean(),
});

export const contactServiceOptionSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});

export const contactPageSchema = z.object({
  seo: seoFieldsSchema,
  hero: pageHeroSchema,
  contactHeading: z.string().min(1),
  form: z.object({
    title: z.string().min(1),
    intro: z.array(z.string().min(1)).min(1),
    detailsHeading: z.string().min(1),
    fields: z.object({
      firstName: contactFormFieldSchema,
      lastName: contactFormFieldSchema,
      email: contactFormFieldSchema,
      phone: contactFormFieldSchema,
      company: contactFormFieldSchema,
      serviceInterest: contactFormFieldSchema,
      message: contactFormFieldSchema,
    }),
    serviceOptions: z.array(contactServiceOptionSchema).min(1),
    submitLabel: z.string().min(1),
    submittingLabel: z.string().min(1),
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
  closingParagraphs: z.array(z.string().min(1)).optional(),
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
