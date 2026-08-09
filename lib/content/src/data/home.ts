import type { HomePageContent } from '../schemas/pages.js';

export const homePageData = {
  seo: {
    title: 'CKBHSE Limited — HSE Consultancy',
    description:
      'CKBHSE Limited is an independent HSE consultancy providing specialist advisory, training and assurance services to organisations across the UK.',
  },
  hero: {
    badge: 'UK HSE Consultancy',
    title: 'Safer workplaces.',
    titleHighlight: 'Stronger compliance.',
    description:
      'CKBHSE Limited is an independent HSE consultancy providing specialist advisory, training and assurance services to organisations across the UK. We help businesses strengthen health, safety and environmental performance, meet regulatory obligations and build robust management systems that support operational excellence.',
  },
  stats: [
    { icon: 'Shield', value: 'HSE', label: 'Advisory Focus' },
    { icon: 'FileCheck', value: 'UK', label: 'Regulatory Alignment' },
    {
      icon: 'GraduationCap',
      value: 'Training',
      label: 'Practical Support',
    },
    {
      icon: 'Award',
      value: 'Assurance',
      label: 'Evidence-Based Reviews',
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
    'Independent HSE Consultancy',
    'UK Regulatory Focus',
    'Advisory, Training & Assurance',
    'Practical Workplace Support',
    'Transparent Scoping',
    'Registered in England & Wales',
  ],
  sections: {
    services: {
      title: 'Complete HSE Solutions',
      description:
        'From compliance audits to ongoing safety management, we provide consultancy services that help your business operate more safely and meet regulatory obligations.',
    },
    industries: {
      title: 'Industries We Serve',
      description:
        'Sector-focused support across high-risk and regulated industries.',
    },
    training: {
      title: 'Practical Safety Training',
      description:
        'Training support to help teams understand their responsibilities and strengthen workplace safety practice.',
    },
    finalCta: {
      title: 'Ready to improve workplace safety?',
      description:
        "Book a consultation with our HSE team. We'll discuss your needs and outline practical next steps.",
    },
  },
} satisfies HomePageContent;
