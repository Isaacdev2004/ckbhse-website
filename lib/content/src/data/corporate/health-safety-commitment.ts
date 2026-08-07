import type { CorporatePageContent } from '../../schemas/corporate.js';

const aboutCrumb = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
];

export const healthSafetyCommitmentPageData = {
  slug: 'health-safety-commitment',
  path: '/about/health-safety-commitment',
  seo: {
    title: 'Health & Safety Commitment | CKBHSE Limited',
    description:
      'CKBHSE Limited health and safety commitment — safety culture, employee welfare, continuous improvement, and regulatory compliance.',
  },
  hero: {
    badge: 'Health & Safety',
    title: 'Safety is our foundation',
    description:
      'As HSE specialists, we hold ourselves to the same standards we advise our clients to achieve — a proactive safety culture backed by robust systems.',
  },
  breadcrumbs: [
    ...aboutCrumb,
    {
      label: 'Health & Safety Commitment',
      href: '/about/health-safety-commitment',
    },
  ],
  sections: [
    {
      type: 'prose',
      title: 'Safety Culture',
      paragraphs: [
        'Safety leadership starts at the top. Our executive team actively participates in safety briefings, incident reviews, and hazard identification across office and field operations.',
        'We foster an open reporting culture where consultants are encouraged to raise concerns without fear of reprisal.',
      ],
    },
    {
      type: 'prose',
      title: 'Employee Commitment',
      paragraphs: [
        'Every CKBHSE employee receives induction training, role-specific safety briefings, and ongoing CPD. Field consultants hold valid CSCS cards, DBS checks where required, and appropriate PPE for site visits.',
        'Lone working protocols, travel safety guidance, and ergonomic assessments support office-based and remote staff.',
      ],
    },
    {
      type: 'features',
      title: 'Continuous Improvement',
      items: [
        {
          icon: 'TrendingUp',
          title: 'Safety Performance Review',
          description:
            'Quarterly review of near-miss reports, audit findings, and improvement actions.',
        },
        {
          icon: 'ClipboardList',
          title: 'Competency Tracking',
          description:
            'Maintained records of qualifications, refresher training, and medical fitness where applicable.',
        },
      ],
    },
    {
      type: 'list',
      title: 'Regulatory Compliance',
      items: [
        'Health and Safety at Work etc. Act 1974 compliance',
        'Management of Health and Safety at Work Regulations 1999',
        'COSHH, DSE, and manual handling assessments for all roles',
        'Client site induction and permit-to-work adherence',
        'RIDDOR reporting procedures for reportable incidents',
      ],
    },
  ],
  cta: {
    title: 'Partner with a consultancy that practises what it preaches',
    description: 'Discuss your health and safety requirements with our team.',
    buttonLabel: 'Book Consultation',
    buttonHref: '/contact',
  },
} satisfies CorporatePageContent;
