import type { TestimonialsHubPageContent } from '../../schemas/testimonials.js';
import { TESTIMONIAL_CATEGORY_LABELS } from '../../schemas/testimonials.js';
import type { TestimonialCategory } from '../../schemas/testimonials.js';

export const testimonialsHubPageData = {
  seo: {
    title: 'Client Testimonials | CKBHSE Limited',
    description:
      'What UK organisations say about working with CKBHSE — verified client testimonials across construction, manufacturing, healthcare, and more.',
  },
  hero: {
    badge: 'Client Voices',
    title: 'Testimonials',
    description:
      'Verified feedback from clients who have achieved measurable safety, compliance, and operational outcomes with CKBHSE.',
  },
  industryFilters: [
    { id: 'construction', label: 'Construction' },
    { id: 'manufacturing', label: 'Manufacturing' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'oil-gas', label: 'Oil & Gas' },
    { id: 'logistics', label: 'Logistics' },
    { id: 'retail', label: 'Retail' },
    { id: 'education', label: 'Education' },
    { id: 'public-sector', label: 'Public Sector' },
  ],
  serviceFilters: [
    { id: 'health-safety', label: 'Health & Safety' },
    { id: 'iso-management', label: 'ISO & Management Systems' },
    { id: 'occupational-health', label: 'Occupational Health' },
    { id: 'compliance-regulatory', label: 'Compliance & Regulatory' },
  ],
  companyFilters: [
    { id: 'London Mixed-Use Development', label: 'London Development' },
    { id: 'Midlands Automotive Group', label: 'Automotive Group' },
    { id: 'NHS Foundation Trust', label: 'NHS Trust' },
    { id: 'National Logistics Group', label: 'Logistics Group' },
  ],
  categoryFilters: (
    Object.entries(TESTIMONIAL_CATEGORY_LABELS) as [TestimonialCategory, string][]
  ).map(([id, label]) => ({ id, label })),
  featuredTestimonials: [
    'construction-director-london',
    'manufacturing-hs-manager',
    'healthcare-safety-lead',
    'offshore-hse-advisor',
    'logistics-fleet-director',
  ],
  trustIndicators: [
    'Verified client testimonials',
    'Measurable outcomes referenced',
    'Cross-linked to published case studies',
    '94% client retention rate',
    '15+ years UK HSEQ consultancy experience',
  ],
  faqs: [
    {
      question: 'Are testimonials verified?',
      answer:
        'All testimonials are collected from confirmed client engagements. Where confidentiality applies, details may be anonymised while outcomes remain verified.',
    },
    {
      question: 'Can I speak to a reference client?',
      answer:
        'Yes. Contact us to arrange a reference conversation relevant to your sector and project type.',
    },
  ],
  consultationCta: {
    title: 'Join our client success stories',
    description:
      'Speak to a CKBHSE consultant about delivering measurable outcomes for your organisation.',
    buttonLabel: 'Book Consultation',
    buttonHref: '/contact',
    action: 'book-consultation',
  },
} satisfies TestimonialsHubPageContent;
