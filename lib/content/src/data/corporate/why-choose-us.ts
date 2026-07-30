import type { CorporatePageContent } from '../../schemas/corporate.js';

const aboutCrumb = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
];

export const whyChooseUsPageData = {
  slug: 'why-choose-us',
  path: '/about/why-choose-us',
  seo: {
    title: 'Why Choose CKBHSE | UK HSEQ Consultancy',
    description:
      'Discover why organisations choose CKBHSE Limited — experience, expertise, certifications, methodology, and proven client success.',
  },
  hero: {
    badge: 'Why CKBHSE',
    title: 'The consultancy organisations trust',
    description:
      'When compliance, safety, and reputation are on the line, organisations choose CKBHSE for rigorous advisory, responsive support, and measurable results.',
  },
  breadcrumbs: [
    ...aboutCrumb,
    { label: 'Why Choose CKBHSE', href: '/about/why-choose-us' },
  ],
  sections: [
    {
      type: 'stats',
      title: 'Experience',
      items: [
        { icon: 'Award', value: '15+', label: 'Years in Practice' },
        { icon: 'Users', value: '500+', label: 'Clients Nationwide' },
        { icon: 'Briefcase', value: '50+', label: 'Qualified Consultants' },
      ],
    },
    {
      type: 'features',
      title: 'Expertise',
      description: 'Deep capability across HSEQ disciplines and sectors.',
      items: [
        {
          icon: 'Shield',
          title: 'Health & Safety',
          description:
            'Audits, RAMS, CDM, incident investigation, and culture programmes.',
        },
        {
          icon: 'Leaf',
          title: 'Environmental',
          description:
            'ISO 14001, permitting, waste management, and ESG advisory.',
        },
        {
          icon: 'FileCheck',
          title: 'Quality & ISO',
          description:
            'Integrated management systems and certification support.',
        },
        {
          icon: 'GraduationCap',
          title: 'Training',
          description:
            'IOSH, NEBOSH, and bespoke corporate training programmes.',
        },
      ],
    },
    {
      type: 'features',
      title: 'Certifications & Credentials',
      items: [
        {
          icon: 'BadgeCheck',
          title: 'IOSH Accredited',
          description:
            'Approved training centre for recognised safety qualifications.',
        },
        {
          icon: 'Award',
          title: 'NEBOSH Approved',
          description:
            'Delivering the gold standard in occupational health and safety training.',
        },
        {
          icon: 'ShieldCheck',
          title: 'ISO 9001 Certified',
          description:
            'Our own quality management system certified to international standards.',
        },
      ],
    },
    {
      type: 'prose',
      title: 'Our Methodology',
      paragraphs: [
        'Every engagement follows a structured methodology: assess, plan, implement, verify, and improve. We use evidence-based audit techniques, stakeholder interviews, and gap analysis to produce prioritised action plans.',
        'For ISO and retainer clients, we embed continuous improvement cycles with defined KPIs and management review support.',
      ],
    },
    {
      type: 'features',
      title: 'Response Time & Support',
      items: [
        {
          icon: 'Clock',
          title: 'Rapid Mobilisation',
          description:
            'Critical incident and enforcement response within agreed SLA windows.',
        },
        {
          icon: 'Users',
          title: 'Dedicated Account Lead',
          description:
            'Single point of contact for retainer and multi-site clients.',
        },
      ],
    },
    {
      type: 'list',
      title: 'Compliance Assurance',
      items: [
        'HSE and Environment Agency regulatory alignment',
        'CDM 2015 and construction-specific compliance',
        'PUWER, LOLER, and machinery safety assessments',
        'Fire safety and emergency planning support',
        'Director due diligence and governance reporting',
      ],
    },
    {
      type: 'prose',
      title: 'Customer Success',
      paragraphs: [
        'Our 98.7% compliance success rate reflects clients who achieve certification, pass audits, and maintain improved safety performance long after project close.',
        'Case studies across construction, manufacturing, and healthcare demonstrate sustained outcomes — not one-off fixes.',
      ],
    },
    {
      type: 'list',
      title: 'Industries Served',
      items: [
        'Construction & Infrastructure',
        'Manufacturing & Engineering',
        'Logistics & Transport',
        'Oil, Gas & Energy',
        'Healthcare & Facilities',
        'Retail & Commercial',
      ],
    },
    {
      type: 'cta',
      title: 'Ready to experience the CKBHSE difference?',
      description:
        'Book a consultation with our team to discuss your requirements.',
      buttonLabel: 'Book Consultation',
      buttonHref: '/contact',
    },
  ],
  cta: {
    title: 'Start your partnership today',
    description: 'Speak with a senior consultant about your HSEQ priorities.',
    buttonLabel: 'Contact Us',
    buttonHref: '/contact',
  },
} satisfies CorporatePageContent;
