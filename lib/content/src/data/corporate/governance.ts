import type { CorporatePageContent } from '../../schemas/corporate.js';

const aboutCrumb = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
];

export const governancePageData = {
  slug: 'governance',
  path: '/about/governance',
  seo: {
    title: 'Corporate Governance | CKBHSE Limited',
    description:
      'CKBHSE Limited corporate governance framework — ethical standards, compliance, risk management, and accountability.',
  },
  hero: {
    badge: 'Governance',
    title: 'Governance built on integrity',
    description:
      'Robust governance ensures our consultancy operates ethically, manages risk effectively, and remains accountable to clients, regulators, and stakeholders.',
  },
  breadcrumbs: [
    ...aboutCrumb,
    { label: 'Corporate Governance', href: '/about/governance' },
  ],
  sections: [
    {
      type: 'governance',
      title: 'Governance Structure',
      description:
        'Clear lines of accountability from the board through to delivery teams.',
      items: [
        {
          icon: 'Users',
          title: 'Board Oversight',
          description:
            'Executive directors provide strategic direction, financial oversight, and assurance governance.',
        },
        {
          icon: 'Scale',
          title: 'Compliance Committee',
          description:
            'Cross-functional committee reviewing regulatory changes, ethical standards, and client complaint resolution.',
        },
        {
          icon: 'ShieldCheck',
          title: 'Standards Review Board',
          description:
            'Independent review of audit methodology, report standards, and consultant competency standards.',
        },
      ],
    },
    {
      type: 'governance',
      title: 'Ethical Standards',
      items: [
        {
          icon: 'Shield',
          title: 'Code of Conduct',
          description:
            'All consultants adhere to a professional code covering conflicts of interest, confidentiality, and honest reporting.',
        },
        {
          icon: 'Eye',
          title: 'Transparency',
          description:
            'Clear scoping, fee structures, and deliverable definitions before engagement commencement.',
        },
      ],
    },
    {
      type: 'governance',
      title: 'Compliance Framework',
      items: [
        {
          icon: 'FileCheck',
          title: 'Regulatory Alignment',
          description:
            'Internal policies aligned to UK health and safety, environmental, and data protection legislation.',
        },
        {
          icon: 'ClipboardList',
          title: 'Policy Management',
          description:
            'Regular review cycle for internal policies, procedures, and consultant guidance documents.',
        },
      ],
    },
    {
      type: 'governance',
      title: 'Risk Management',
      items: [
        {
          icon: 'AlertTriangle',
          title: 'Enterprise Risk Register',
          description:
            'Identified and monitored risks across operational, financial, reputational, and regulatory domains.',
        },
        {
          icon: 'TrendingUp',
          title: 'Continuous Monitoring',
          description:
            'Quarterly risk reviews with escalation protocols for emerging threats or client-critical issues.',
        },
      ],
    },
    {
      type: 'governance',
      title: 'Accountability',
      items: [
        {
          icon: 'BadgeCheck',
          title: 'Client Feedback Loop',
          description:
            'Structured post-engagement reviews and NPS tracking to drive service improvement.',
        },
        {
          icon: 'Briefcase',
          title: 'Professional Indemnity',
          description:
            'Comprehensive professional indemnity insurance appropriate to consultancy scope and scale.',
        },
      ],
    },
  ],
  cta: {
    title: 'Questions about our governance?',
    description:
      'Contact us for further information on our policies and standards.',
    buttonLabel: 'Contact Us',
    buttonHref: '/contact',
  },
} satisfies CorporatePageContent;
