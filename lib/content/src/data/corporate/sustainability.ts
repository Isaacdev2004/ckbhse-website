import type { CorporatePageContent } from '../../schemas/corporate.js';

const aboutCrumb = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
];

export const sustainabilityPageData = {
  slug: 'sustainability',
  path: '/about/sustainability',
  seo: {
    title: 'Sustainability & ESG | CKBHSE Limited',
    description:
      'CKBHSE Limited commitment to sustainability and ESG — environmental stewardship, social responsibility, and governance excellence.',
  },
  hero: {
    badge: 'Sustainability & ESG',
    title: 'Responsible consultancy for a sustainable future',
    description:
      'We integrate environmental, social, and governance principles into our own operations and the advisory services we deliver to clients.',
  },
  breadcrumbs: [
    ...aboutCrumb,
    { label: 'Sustainability & ESG', href: '/about/sustainability' },
  ],
  sections: [
    {
      type: 'features',
      title: 'Environmental',
      description:
        'Reducing our footprint and helping clients manage environmental impact.',
      items: [
        {
          icon: 'Leaf',
          title: 'Carbon Reduction',
          description:
            'Remote audit capabilities and digital reporting reduce travel-related emissions.',
        },
        {
          icon: 'Recycle',
          title: 'Waste & Resources',
          description:
            'Office waste minimisation and paperless client deliverables where practicable.',
        },
        {
          icon: 'Droplet',
          title: 'Environmental Advisory',
          description:
            'Client services supporting ISO 14001, permitting, and pollution prevention.',
        },
      ],
    },
    {
      type: 'features',
      title: 'Social',
      description: 'People-first practices internally and in client delivery.',
      items: [
        {
          icon: 'Users',
          title: 'Workforce Wellbeing',
          description:
            'Consultant wellbeing programmes, flexible working, and mental health support.',
        },
        {
          icon: 'GraduationCap',
          title: 'Community Training',
          description:
            'Subsidised safety training for community organisations and apprenticeships.',
        },
        {
          icon: 'Heart',
          title: 'Diversity & Inclusion',
          description:
            'Inclusive recruitment and equal opportunity policies across all roles.',
        },
      ],
    },
    {
      type: 'features',
      title: 'Governance',
      description: 'Transparent, accountable ESG reporting and oversight.',
      items: [
        {
          icon: 'Scale',
          title: 'ESG Oversight',
          description:
            'Board-level review of sustainability targets and progress reporting.',
        },
        {
          icon: 'Eye',
          title: 'Stakeholder Engagement',
          description:
            'Regular consultation with employees, clients, and community partners.',
        },
      ],
    },
    {
      type: 'list',
      title: 'Sustainability Goals',
      items: [
        'Achieve net-zero operational emissions by 2035',
        '100% digital client report delivery by 2027',
        'Expand ESG advisory services for corporate clients',
        'Maintain ISO 14001 certification for internal operations',
        'Publish annual sustainability progress summary',
      ],
    },
  ],
  cta: {
    title: 'Need ESG or environmental advisory support?',
    description:
      'Speak with our environmental services team about your requirements.',
    buttonLabel: 'Contact Us',
    buttonHref: '/contact',
  },
} satisfies CorporatePageContent;
