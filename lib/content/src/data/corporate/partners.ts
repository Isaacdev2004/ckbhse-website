import type { CorporatePageContent } from '../../schemas/corporate.js';

const aboutCrumb = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
];

export const partnersPageData = {
  slug: 'partners',
  path: '/about/partners',
  seo: {
    title: 'Partnerships | CKBHSE Limited',
    description:
      'CKBHSE Limited strategic partnerships — technology, industry, training, and strategic alliances supporting HSEQ excellence.',
  },
  hero: {
    badge: 'Partnerships',
    title: 'Stronger together',
    description:
      'We collaborate with technology providers, industry bodies, and training organisations to deliver comprehensive HSEQ solutions for our clients.',
  },
  breadcrumbs: [
    ...aboutCrumb,
    { label: 'Partnerships', href: '/about/partners' },
  ],
  sections: [
    {
      type: 'partners',
      title: 'Technology Partners',
      description:
        'Digital platforms that enhance audit, reporting, and compliance management.',
      items: [
        {
          slug: 'compliance-cloud',
          name: 'ComplianceCloud Platform',
          category: 'technology',
          description:
            'Integrated audit management and corrective action tracking for multi-site clients.',
        },
        {
          slug: 'safety-digital',
          name: 'SafetyDigital Analytics',
          category: 'technology',
          description:
            'Data visualisation and trend analysis for HSEQ performance dashboards.',
        },
      ],
    },
    {
      type: 'partners',
      title: 'Industry Partners',
      description:
        'Sector bodies and associations supporting standards and best practice.',
      items: [
        {
          slug: 'construction-safety-group',
          name: 'UK Construction Safety Group',
          category: 'industry',
          description:
            'Collaborative safety initiatives and shared learning across Tier 1 contractors.',
        },
        {
          slug: 'manufacturing-hseq-alliance',
          name: 'Manufacturing HSEQ Alliance',
          category: 'industry',
          description:
            'Cross-sector forum for machinery safety and ISO integration guidance.',
        },
      ],
    },
    {
      type: 'partners',
      title: 'Strategic Partners',
      description:
        'Alliances that extend our advisory and delivery capabilities.',
      items: [
        {
          slug: 'legal-advisory-network',
          name: 'Legal Advisory Network',
          category: 'strategic',
          description:
            'Specialist health and safety law firms for enforcement and litigation support.',
        },
        {
          slug: 'insurance-risk-panel',
          name: 'Insurance Risk Panel',
          category: 'strategic',
          description:
            'Broker partnerships supporting client risk transfer and premium optimisation.',
        },
      ],
    },
    {
      type: 'partners',
      title: 'Training Partners',
      description: 'Collaborations extending our accredited training reach.',
      items: [
        {
          slug: 'regional-training-centre',
          name: 'Regional Training Centre Network',
          category: 'training',
          description:
            'Approved venues delivering IOSH and NEBOSH courses across the UK.',
        },
        {
          slug: 'elearning-provider',
          name: 'E-Learning Provider Alliance',
          category: 'training',
          description:
            'Blended learning modules complementing classroom-based qualifications.',
        },
      ],
    },
  ],
  cta: {
    title: 'Interested in partnering with CKBHSE?',
    description: 'Contact us to explore strategic collaboration opportunities.',
    buttonLabel: 'Get in Touch',
    buttonHref: '/contact',
  },
} satisfies CorporatePageContent;
