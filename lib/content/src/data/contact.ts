import type { ContactPageContent } from '../schemas/legal.js';

export const contactPageData = {
  seo: {
    title: 'Book a Free 15-Minute Consultation | CKBHSE Limited',
    description:
      'Book a free 15-minute initial consultation with CKBHSE. Tell us about your organisation and HSE support needs — we will contact you within one working day.',
  },
  hero: {
    title: 'Book a Free 15-Minute Initial Consultation',
    description:
      'Need support with a health, safety or environmental challenge?',
  },
  contactHeading: 'Contact Information',
  form: {
    title: 'Book a Free 15-Minute Initial Consultation',
    intro: [
      'Tell us a little about your organisation and the support you need. A member of the CKBHSE team will contact you within one working day to arrange your free 15-minute initial consultation.',
      "During this initial conversation, we'll take the time to understand your requirements, discuss your HSE challenges and identify how CKBHSE may be able to support your organisation.",
      'No obligation — just a focused initial conversation about your HSE needs.',
    ],
    detailsHeading: 'Your Details',
    fields: {
      firstName: {
        label: 'First Name',
        placeholder: 'Enter your first name',
        required: true,
      },
      lastName: {
        label: 'Last Name',
        placeholder: 'Enter your last name',
        required: true,
      },
      email: {
        label: 'Work Email Address',
        placeholder: 'Enter your work email address',
        required: true,
      },
      phone: {
        label: 'Telephone Number',
        placeholder: 'Enter your telephone number',
        required: false,
      },
      company: {
        label: 'Company / Organisation',
        placeholder: 'Enter your company or organisation name',
        required: true,
      },
      serviceInterest: {
        label: 'How Can We Help?',
        placeholder: 'Select a service',
        required: true,
      },
      message: {
        label: 'Tell Us About Your Requirements',
        placeholder:
          'Briefly describe the support you need, any specific HSE concerns and your preferred timescale.',
        required: true,
      },
    },
    serviceOptions: [
      {
        value: 'hse-consultancy-advisory',
        label: 'HSE Consultancy & Advisory Support',
      },
      {
        value: 'hse-audits-compliance',
        label: 'HSE Audits & Compliance Reviews',
      },
      {
        value: 'risk-assessment-management',
        label: 'Risk Assessment & Risk Management',
      },
      {
        value: 'dsear-assessment-compliance',
        label: 'DSEAR Assessment & Compliance',
      },
      {
        value: 'incident-accident-investigation',
        label: 'Incident & Accident Investigation',
      },
      {
        value: 'contractor-management',
        label: 'Contractor Management',
      },
      {
        value: 'iso-45001-support',
        label: 'ISO 45001 Support',
      },
      {
        value: 'iso-14001-environmental',
        label: 'ISO 14001 & Environmental Compliance',
      },
      {
        value: 'hse-training',
        label: 'HSE Training',
      },
      {
        value: 'retained-hse-support',
        label: 'Retained HSE Support',
      },
      {
        value: 'other-not-sure',
        label: 'Other / Not Sure',
      },
    ],
    submitLabel: 'Request My Free Consultation',
    submittingLabel: 'Sending…',
    successTitle: 'Thank You!',
    successMessage:
      'We have received your enquiry and will contact you within one working day to arrange your free 15-minute initial consultation.',
    disclaimer:
      'By submitting this form, you confirm that you have read our Privacy Policy and consent to CKBHSE using the information you provide to respond to your enquiry and arrange your initial consultation.',
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
