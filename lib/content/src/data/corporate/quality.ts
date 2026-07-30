import type { CorporatePageContent } from '../../schemas/corporate.js';

const aboutCrumb = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
];

export const qualityPageData = {
  slug: 'quality',
  path: '/about/quality',
  seo: {
    title: 'Quality Assurance | CKBHSE Limited',
    description:
      'CKBHSE Limited quality management — continuous improvement, auditing, client satisfaction, and international standards.',
  },
  hero: {
    badge: 'Quality Assurance',
    title: 'Quality in every deliverable',
    description:
      'Our ISO 9001-certified quality management system ensures consistent, high-standard consultancy delivery across every client engagement.',
  },
  breadcrumbs: [
    ...aboutCrumb,
    { label: 'Quality Assurance', href: '/about/quality' },
  ],
  sections: [
    {
      type: 'prose',
      title: 'Quality Management',
      paragraphs: [
        'CKBHSE operates a documented quality management system certified to ISO 9001. This framework governs engagement scoping, consultant assignment, deliverable review, and client sign-off processes.',
        'Quality objectives are set annually and tracked through management review, internal audit, and client satisfaction metrics.',
      ],
    },
    {
      type: 'features',
      title: 'Continuous Improvement',
      items: [
        {
          icon: 'TrendingUp',
          title: 'Management Review',
          description:
            'Quarterly leadership reviews of KPIs, non-conformities, and improvement opportunities.',
        },
        {
          icon: 'Lightbulb',
          title: 'Lessons Learned',
          description:
            'Post-project debriefs capture insights that refine methodology and training materials.',
        },
      ],
    },
    {
      type: 'prose',
      title: 'Auditing',
      paragraphs: [
        'Internal audits verify adherence to our quality procedures, consultant competency records, and report review workflows. Findings drive corrective actions with defined owners and deadlines.',
      ],
    },
    {
      type: 'prose',
      title: 'Client Satisfaction',
      paragraphs: [
        'We measure client satisfaction through structured feedback surveys, retention rates, and referral metrics. Results inform consultant development, service design, and account management practices.',
      ],
    },
    {
      type: 'list',
      title: 'Standards',
      items: [
        'ISO 9001:2015 Quality Management Systems',
        'ISO 45001 consultancy alignment for occupational health and safety',
        'ISO 14001 environmental management advisory standards',
        'IOSH and NEBOSH training delivery requirements',
        'Professional body CPD and competency frameworks',
      ],
    },
  ],
  cta: {
    title: 'Experience our quality standards',
    description:
      'Request a proposal and see our structured approach in action.',
    buttonLabel: 'Request Consultation',
    buttonHref: '/contact',
  },
} satisfies CorporatePageContent;
