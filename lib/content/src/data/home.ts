import type { HomePageContent } from '../schemas/pages.js';

export const homePageData = {
  seo: {
    title: 'CKBHSE Limited — Expert HSEQ Consultancy',
    description:
      'CKBHSE Limited delivers comprehensive Health, Safety, Environment & Quality consultancy services to organisations across the UK.',
  },
  hero: {
    badge: 'UK HSEQ Consultancy',
    title: 'Expert Safety.',
    titleHighlight: 'Real Results.',
    description:
      "CKBHSE Limited delivers comprehensive Health, Safety, Environment & Quality consultancy services to organisations across the UK. From compliance audits to ISO certification, we're the partner you can trust.",
  },
  stats: [
    { icon: 'Users', value: '500+', label: 'Clients Served' },
    { icon: 'Award', value: '15+', label: 'Years Experience' },
    {
      icon: 'GraduationCap',
      value: '2,000+',
      label: 'Professionals Trained',
    },
    {
      icon: 'Shield',
      value: '98.7%',
      label: 'Compliance Success Rate',
    },
  ],
  coreServices: [
    {
      icon: 'Shield',
      title: 'Health & Safety Audits',
      description:
        'Comprehensive workplace inspections and compliance assessments to identify risks and ensure regulatory adherence.',
    },
    {
      icon: 'FileCheck',
      title: 'Risk Assessments & RAMS',
      description:
        'Detailed risk analysis and method statements tailored to your operations and industry requirements.',
    },
    {
      icon: 'Award',
      title: 'ISO Compliance',
      description:
        'Expert guidance for ISO 9001, 14001, and 45001 certification, implementation, and ongoing management.',
    },
    {
      icon: 'AlertTriangle',
      title: 'Incident Investigation',
      description:
        'Professional analysis of workplace incidents with actionable recommendations to prevent recurrence.',
    },
  ],
  industries: [
    {
      icon: 'Building2',
      name: 'Construction',
      description: 'CDM compliance, site safety, RAMS',
    },
    {
      icon: 'Factory',
      name: 'Manufacturing',
      description: 'Machinery safety, ISO systems',
    },
    {
      icon: 'Truck',
      name: 'Logistics',
      description: 'Fleet safety, driver compliance',
    },
    {
      icon: 'Droplet',
      name: 'Oil & Gas',
      description: 'High-risk procedures, PTW systems',
    },
  ],
  trustSignals: [
    'ISO 9001 Certified Consultancy',
    'IOSH Accredited Training',
    'NEBOSH Qualified Consultants',
    'CDM 2015 Specialists',
    'HSE Regulatory Expertise',
    'RIDDOR Compliance',
  ],
  sections: {
    services: {
      title: 'Complete HSEQ Solutions',
      description:
        'From compliance audits to ongoing safety management, we provide end-to-end consultancy services that keep your business safe and compliant.',
    },
    industries: {
      title: 'Industries We Serve',
      description:
        'Sector-specific expertise across high-risk and regulated industries.',
    },
    training: {
      title: 'Accredited Safety Training',
      description:
        'IOSH, NEBOSH, and specialist courses delivered by qualified professionals. Classroom and online options available.',
    },
    finalCta: {
      title: 'Ready to improve workplace safety?',
      description:
        "Book a free consultation with one of our HSEQ experts. We'll assess your needs and recommend tailored solutions.",
    },
  },
} satisfies HomePageContent;
