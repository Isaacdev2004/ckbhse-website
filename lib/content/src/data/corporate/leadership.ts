import type { CorporatePageContent } from '../../schemas/corporate.js';

const aboutCrumb = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
];

export const leadershipPageData = {
  slug: 'leadership',
  path: '/about/leadership',
  seo: {
    title: 'Leadership Team | CKBHSE Limited',
    description:
      'Meet the CKBHSE Limited leadership team — experienced HSE directors, consultants, and advisors serving UK organisations.',
  },
  hero: {
    badge: 'Leadership',
    title: 'Experienced practitioners. Trusted advisors.',
    description:
      'Our leadership team brings decades of combined experience in health and safety, environmental management, ISO systems, and corporate governance.',
  },
  breadcrumbs: [
    ...aboutCrumb,
    { label: 'Leadership', href: '/about/leadership' },
  ],
  sections: [
    {
      type: 'leadership',
      title: 'Executive Team',
      description:
        'Senior leaders responsible for strategy and client delivery.',
      members: [
        {
          slug: 'sarah-mitchell',
          name: 'Sarah Mitchell',
          role: 'Chief Executive Officer',
          group: 'executive',
          bio: 'Chartered safety professional with 20+ years leading HSE transformation programmes across construction and manufacturing sectors.',
        },
        {
          slug: 'james-chen',
          name: 'James Chen',
          role: 'Chief Operating Officer',
          group: 'executive',
          bio: 'Operations leader specialising in scalable consultancy delivery, consultant development, and client success management.',
        },
      ],
    },
    {
      type: 'leadership',
      title: 'Directors',
      description:
        'Practice directors overseeing audit, ISO, training, and incident response.',
      members: [
        {
          slug: 'emma-williams',
          name: 'Emma Williams',
          role: 'Director of Health & Safety',
          group: 'directors',
          bio: 'NEBOSH Diploma holder leading audit and assurance services with expertise in CDM, PUWER, and high-risk operations.',
        },
        {
          slug: 'david-okonkwo',
          name: 'David Okonkwo',
          role: 'Director of Environmental Services',
          group: 'directors',
          bio: 'IEMA practitioner focused on ISO 14001, environmental permitting, and ESG reporting for corporate clients.',
        },
        {
          slug: 'rachel-foster',
          name: 'Rachel Foster',
          role: 'Director of Training',
          group: 'directors',
          bio: 'IOSH-approved trainer managing accredited course delivery and bespoke corporate training programmes.',
        },
      ],
    },
    {
      type: 'leadership',
      title: 'Senior Consultants',
      description: 'Lead consultants delivering client engagements nationwide.',
      members: [
        {
          slug: 'michael-barnes',
          name: 'Michael Barnes',
          role: 'Principal Consultant — Construction',
          group: 'consultants',
          bio: 'Former site safety manager supporting Tier 1 contractors with CDM compliance, RAMS review, and site audits.',
        },
        {
          slug: 'priya-sharma',
          name: 'Priya Sharma',
          role: 'Principal Consultant — ISO Systems',
          group: 'consultants',
          bio: 'Integrated management system specialist for ISO 14001 and 45001 certification and internal audit programmes.',
        },
        {
          slug: 'thomas-hughes',
          name: 'Thomas Hughes',
          role: 'Principal Consultant — Incident Response',
          group: 'consultants',
          bio: 'Incident investigation lead with experience in root cause analysis, regulatory liaison, and corrective action planning.',
        },
      ],
    },
    {
      type: 'leadership',
      title: 'Advisors',
      description:
        'External advisors supporting governance, legal alignment, and sector expertise.',
      members: [
        {
          slug: 'helen-crawford',
          name: 'Helen Crawford',
          role: 'Legal & Regulatory Advisor',
          group: 'advisors',
          bio: 'Health and safety law specialist advising on enforcement response, due diligence, and director liability.',
        },
        {
          slug: 'andrew-patel',
          name: 'Andrew Patel',
          role: 'Technology Advisor',
          group: 'advisors',
          bio: 'Digital compliance strategist guiding platform selection and data integration for HSE assurance.',
        },
      ],
    },
  ],
  cta: {
    title: 'Work with our leadership team',
    description:
      'Book a consultation to discuss your HSE requirements with a senior consultant.',
    buttonLabel: 'Book Consultation',
    buttonHref: '/contact',
  },
} satisfies CorporatePageContent;
