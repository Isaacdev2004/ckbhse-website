import type { CorporatePageContent } from '../../schemas/corporate.js';

const aboutCrumb = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
];

export const missionPageData = {
  slug: 'mission',
  path: '/about/mission',
  seo: {
    title: 'Our Mission | CKBHSE Limited',
    description:
      'CKBHSE Limited mission: to protect people, strengthen compliance, and enable organisations to operate safely and sustainably across the UK.',
  },
  hero: {
    badge: 'Mission',
    title: 'Protecting people. Enabling performance.',
    description:
      'Our mission is to help organisations manage health, safety, environmental, and quality risks with clarity, confidence, and measurable outcomes.',
  },
  breadcrumbs: [...aboutCrumb, { label: 'Mission', href: '/about/mission' }],
  sections: [
    {
      type: 'quote',
      text: 'To protect people, strengthen compliance, and enable organisations to operate safely, sustainably, and with full regulatory confidence.',
    },
    {
      type: 'prose',
      title: 'Mission Statement',
      paragraphs: [
        'CKBHSE Limited exists to deliver expert HSEQ consultancy that reduces harm, improves operational resilience, and supports long-term business performance.',
        'We partner with leadership teams to translate regulatory requirements into practical systems that work on the ground — not just on paper.',
      ],
    },
    {
      type: 'list',
      title: 'Strategic Objectives',
      items: [
        'Deliver measurable improvements in workplace safety and environmental performance',
        'Support clients through ISO certification and ongoing management system maintenance',
        'Provide accredited training that builds internal HSEQ capability',
        'Respond to incidents and audits with rigorous, evidence-based analysis',
        'Invest in consultant development and industry-leading methodology',
      ],
    },
    {
      type: 'prose',
      title: 'Customer Commitment',
      paragraphs: [
        'Every client receives transparent scoping, clear deliverables, and direct access to qualified consultants. We commit to honest assessments, actionable recommendations, and follow-through that respects your operational realities.',
        'Our retainers and project engagements are structured for accountability — with defined milestones, reporting, and escalation paths when urgent support is required.',
      ],
    },
    {
      type: 'prose',
      title: 'Long-term Vision Alignment',
      paragraphs: [
        'Our mission aligns with a broader vision of industry leadership in HSEQ consultancy — where safety culture, environmental stewardship, and quality management are integrated into strategic decision-making at every level of the organisation.',
      ],
    },
  ],
  cta: {
    title: 'See how our mission translates into client outcomes',
    description:
      'Explore case studies and service capabilities across your sector.',
    buttonLabel: 'View Case Studies',
    buttonHref: '/case-studies',
  },
} satisfies CorporatePageContent;
