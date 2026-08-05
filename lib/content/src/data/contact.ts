import type { ContactPageContent } from '../schemas/legal.js';

export const contactPageData = {
  seo: {
    title: 'Contact Us | CKBHSE Limited',
    description:
      "Book a free consultation, discuss your HSEQ needs, or enquire about our services. We're here to help.",
  },
  hero: {
    title: 'Get in Touch',
    description:
      "Book a free consultation, discuss your HSEQ needs, or enquire about our services. We're here to help.",
  },
  contactHeading: 'Contact Information',
  form: {
    title: 'Book a Free Consultation',
    description:
      "Fill in the form below and we'll get back to you within 24 hours.",
    successTitle: 'Thank You!',
    successMessage:
      "We've received your enquiry and will be in touch within 24 hours.",
    disclaimer:
      "By submitting this form, you agree to our Privacy Policy. We'll use your information to respond to your enquiry.",
  },
  office: {
    lines: [
      'CKBHSE Limited',
      'Company No. 17378677',
      '11 Henley Street',
      'Mataab Business Centre',
      'Birmingham, England, B11 1JB',
    ],
    mapLabel: 'Office Location',
    mapAddress:
      '11 Henley Street, Mataab Business Centre, Birmingham, England, B11 1JB',
  },
  officeHours: {
    title: 'Office Hours',
    schedule: [
      { days: 'Monday - Friday', hours: '8:00 AM - 6:00 PM' },
      { days: 'Saturday', hours: '9:00 AM - 1:00 PM' },
      { days: 'Sunday', hours: 'Closed' },
    ],
  },
} satisfies ContactPageContent;
