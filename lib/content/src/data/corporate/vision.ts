import type { CorporatePageContent } from '../../schemas/corporate.js';

const aboutCrumb = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
];

export const visionPageData = {
  slug: 'vision',
  path: '/about/vision',
  seo: {
    title: 'Our Vision | CKBHSE Limited',
    description:
      'CKBHSE Limited vision for the future of HSEQ consultancy — innovation, leadership, and sustainable safety excellence across UK industries.',
  },
  hero: {
    badge: 'Vision',
    title: 'Leading the future of HSEQ excellence',
    description:
      'We envision a UK business landscape where every organisation treats health, safety, environment, and quality as strategic priorities — supported by expert advisory and modern compliance tools.',
  },
  breadcrumbs: [...aboutCrumb, { label: 'Vision', href: '/about/vision' }],
  sections: [
    {
      type: 'quote',
      text: 'To be the UK consultancy of choice for organisations that demand rigorous HSEQ advisory, accredited training, and technology-enabled compliance assurance.',
    },
    {
      type: 'prose',
      title: 'Vision Statement',
      paragraphs: [
        'CKBHSE Limited aims to set the benchmark for premium HSEQ consultancy in the United Kingdom — combining deep regulatory expertise with innovation, accessibility, and measurable client impact.',
      ],
    },
    {
      type: 'prose',
      title: 'Future Direction',
      paragraphs: [
        'We are expanding our digital client platform, knowledge resources, and sector-specific advisory capabilities to support organisations through regulatory change, ESG reporting, and evolving workforce expectations.',
        'Our roadmap prioritises scalable delivery models that maintain the personal, senior-level engagement our clients expect.',
      ],
    },
    {
      type: 'features',
      title: 'Innovation Strategy',
      description:
        'Technology and methodology investments that enhance client outcomes.',
      items: [
        {
          icon: 'Lightbulb',
          title: 'Digital Compliance Tools',
          description:
            'Integrating audit platforms and dashboards for real-time visibility of HSEQ performance.',
        },
        {
          icon: 'BookOpen',
          title: 'Knowledge Hub Expansion',
          description:
            'Building accessible guidance, templates, and regulatory updates for client teams.',
        },
        {
          icon: 'TrendingUp',
          title: 'Data-driven Assurance',
          description:
            'Using analytics to identify trends, prioritise interventions, and demonstrate ROI.',
        },
      ],
    },
    {
      type: 'list',
      title: 'Industry Leadership Goals',
      items: [
        'Recognised thought leadership in UK HSEQ regulatory developments',
        'Expanded accredited training portfolio aligned to emerging competencies',
        'Partnerships with technology and industry bodies that raise standards sector-wide',
        'Continued investment in consultant qualifications and CPD',
      ],
    },
  ],
  cta: {
    title: 'Join us on the journey',
    description:
      'Explore careers at CKBHSE or partner with our consultancy team.',
    buttonLabel: 'View Careers',
    buttonHref: '/careers',
  },
} satisfies CorporatePageContent;
