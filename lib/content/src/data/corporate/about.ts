import type { CorporatePageContent } from '../../schemas/corporate.js';

export const aboutPageData = {
  slug: 'about',
  path: '/about',
  seo: {
    title: 'About CKBHSE Limited | UK HSE Consultancy',
    description:
      'Learn about CKBHSE Limited — a premium UK Health, Safety and Environmental consultancy trusted by organisations nationwide.',
  },
  hero: {
    badge: 'About CKBHSE',
    title: 'Building safer, compliant organisations across the UK',
    description:
      'CKBHSE Limited is an independent HSE consultancy delivering expert advisory, training, and assurance services to organisations that take safety, compliance, and operational excellence seriously.',
  },
  breadcrumbs: [
    { label: 'Home', href: '/' },
    { label: 'About CKBHSE', href: '/about' },
  ],
  sections: [
    {
      type: 'prose',
      title: 'Company Overview',
      paragraphs: [
        'CKBHSE Limited provides end-to-end Health, Safety and Environment consultancy to UK organisations across construction, manufacturing, logistics, energy, and healthcare sectors.',
        'Our consultants combine regulatory expertise with practical operational experience, helping clients reduce risk, achieve certification, and embed sustainable safety cultures.',
      ],
    },
    {
      type: 'prose',
      title: 'Our Story',
      paragraphs: [
        'Founded by senior HSE practitioners who saw a gap between generic compliance services and the strategic advisory organisations truly need, CKBHSE was established to deliver consultancy at the standard expected by board-level stakeholders.',
        'From our London headquarters, we support clients nationwide with audits, ISO implementation, incident investigation, training, and retained advisory services.',
      ],
    },
    {
      type: 'prose',
      title: 'Our Journey',
      paragraphs: [
        'What began as a specialist audit practice has evolved into a full-service HSE consultancy, supporting over 500 organisations and training more than 2,000 professionals.',
        'We continue to invest in methodology, technology partnerships, and consultant development to stay ahead of regulatory change and industry best practice.',
      ],
    },
    {
      type: 'quote',
      text: 'Safety is not a department — it is a leadership discipline that protects people, reputation, and performance.',
      attribution: 'CKBHSE Leadership Team',
    },
    {
      type: 'prose',
      title: 'Our Philosophy',
      paragraphs: [
        'We believe effective HSE management is a business enabler, not a checkbox exercise. Our approach balances regulatory compliance with operational pragmatism, ensuring recommendations are implementable and measurable.',
      ],
    },
    {
      type: 'prose',
      title: 'Why CKBHSE Exists',
      paragraphs: [
        'Organisations face increasing regulatory scrutiny, complex supply chains, and rising stakeholder expectations. CKBHSE exists to provide clear, expert guidance that reduces uncertainty and delivers defensible compliance.',
      ],
    },
    {
      type: 'timeline',
      title: 'Company Timeline',
      items: [
        {
          year: '2010',
          title: 'Foundation',
          description:
            'CKBHSE established as a specialist health and safety audit practice serving London-based contractors.',
        },
        {
          year: '2014',
          title: 'National Expansion',
          description:
            'Consultancy services extended nationwide with ISO 9001, 14001, and 45001 implementation capabilities.',
        },
        {
          year: '2018',
          title: 'Training Division',
          description:
            'Accredited IOSH and NEBOSH training programmes launched for corporate and public sector clients.',
        },
        {
          year: '2022',
          title: 'Digital Assurance',
          description:
            'Modern compliance platforms and remote audit capabilities integrated into client delivery.',
        },
        {
          year: '2026',
          title: 'Enterprise Platform',
          description:
            'Digital client portal and knowledge hub launched to support ongoing compliance management.',
        },
      ],
    },
    {
      type: 'stats',
      title: 'Corporate Statistics',
      items: [
        { icon: 'Users', value: '500+', label: 'Clients Served' },
        { icon: 'Award', value: '15+', label: 'Years Experience' },
        {
          icon: 'GraduationCap',
          value: '2,000+',
          label: 'Professionals Trained',
        },
        { icon: 'Shield', value: '98.7%', label: 'Compliance Success Rate' },
      ],
    },
    {
      type: 'features',
      title: 'Trust Indicators',
      description:
        'Credentials and commitments that underpin every client engagement.',
      items: [
        {
          icon: 'ShieldCheck',
          title: 'Regulatory Expertise',
          description:
            'Consultants qualified to IOSH, NEBOSH, and IEMA standards with sector-specific experience.',
        },
        {
          icon: 'BadgeCheck',
          title: 'Accredited Training',
          description:
            'IOSH and NEBOSH approved training centre delivering recognised qualifications.',
        },
        {
          icon: 'FileCheck',
          title: 'ISO Capability',
          description:
            'Proven track record supporting ISO 9001, 14001, and 45001 certification and maintenance.',
        },
        {
          icon: 'Handshake',
          title: 'Long-term Partnerships',
          description:
            'Retained advisory relationships with clients across multiple sectors and geographies.',
        },
      ],
    },
    {
      type: 'cta',
      title: 'Ready to work with a trusted HSE partner?',
      description:
        'Speak with our consultants about audits, ISO certification, training, or retained advisory support.',
      buttonLabel: 'Book Consultation',
      buttonHref: '/contact',
    },
  ],
  cta: {
    title: 'Partner with CKBHSE',
    description:
      'Discover how our consultancy services can strengthen your safety culture and compliance posture.',
    buttonLabel: 'Contact Our Team',
    buttonHref: '/contact',
  },
} satisfies CorporatePageContent;
