import type { CorporatePageContent } from '../../schemas/corporate.js';

const aboutCrumb = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
];

export const whyChooseUsPageData = {
  slug: 'why-choose-us',
  path: '/about/why-choose-us',
  seo: {
    title: 'Why Choose CKBHSE | UK HSE Consultancy',
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
      title: 'How we support clients',
      items: [
        { icon: 'Award', value: 'HSE', label: 'Specialist Focus' },
        { icon: 'Users', value: 'UK', label: 'Nationwide Support' },
        { icon: 'Briefcase', value: 'Practical', label: 'Workplace Advice' },
      ],
    },
    {
      type: 'features',
      title: 'Expertise',
      description: 'Deep capability across HSE disciplines and sectors.',
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
          title: 'ISO Standards',
          description:
            'Integrated management systems and certification support.',
        },
        {
          icon: 'GraduationCap',
          title: 'Training',
          description:
            'Practical workplace training aligned to client needs and roles.',
        },
      ],
    },
    {
      type: 'features',
      title: 'Our commitments',
      items: [
        {
          icon: 'BadgeCheck',
          title: 'Honest Advice',
          description:
            'Clear recommendations based on applicable UK legal duties and good practice.',
        },
        {
          icon: 'Award',
          title: 'Transparent Scoping',
          description:
            'Agreed deliverables and realistic expectations before work begins.',
        },
        {
          icon: 'ShieldCheck',
          title: 'Evidence-Based Reviews',
          description:
            'Findings supported by observation, documentation review, and practical context.',
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
        'We measure success by practical outcomes: clearer responsibilities, stronger controls, and better preparedness for regulatory scrutiny.',
        'Illustrative case studies across construction, manufacturing, and healthcare show the types of challenges we help organisations address.',
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
    description: 'Speak with a senior consultant about your HSE priorities.',
    buttonLabel: 'Contact Us',
    buttonHref: '/contact',
  },
} satisfies CorporatePageContent;
