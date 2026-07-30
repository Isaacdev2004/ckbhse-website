import type { ServicesHubPageContent } from '../../schemas/services.js';
import { SERVICE_CATEGORY_LABELS } from '../../schemas/services.js';
import type { ServiceCategoryId } from '../../schemas/services.js';

const categoryDescriptions: Record<ServiceCategoryId, string> = {
  'health-safety':
    'Workplace safety audits, risk assessments, CDM, fire safety, and safety management systems.',
  environmental:
    'Environmental compliance, ISO 14001, waste management, sustainability, and carbon reduction.',
  'occupational-health':
    'Workplace health, wellbeing, health surveillance, and occupational hygiene.',
  'iso-management':
    'ISO 9001, 14001, 45001 certification, integrated systems, and internal audits.',
  'compliance-regulatory':
    'Legal compliance, policy development, contractor management, and competent person services.',
  'business-risk':
    'Enterprise risk, business continuity, crisis management, governance, and ESG advisory.',
};

export const servicesHubPageData = {
  seo: {
    title: 'HSEQ Consultancy Services | CKBHSE Limited',
    description:
      'Comprehensive health, safety, environmental, and quality consultancy services. Expert audits, ISO certification, risk assessments, and retained advisory across the UK.',
  },
  hero: {
    badge: 'Consultancy Services',
    title: 'Enterprise HSEQ consultancy that delivers results',
    description:
      'From health and safety audits to ISO certification and ESG advisory — CKBHSE provides the expert consultancy UK organisations trust to stay compliant, reduce risk, and protect their people.',
  },
  categories: (
    Object.entries(SERVICE_CATEGORY_LABELS) as [ServiceCategoryId, string][]
  ).map(([id, label]) => ({
    id,
    label,
    description: categoryDescriptions[id],
  })),
  industryFilters: [
    { id: 'construction', label: 'Construction' },
    { id: 'manufacturing', label: 'Manufacturing' },
    { id: 'logistics', label: 'Logistics & Transport' },
    { id: 'oil-gas', label: 'Oil & Gas' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'retail', label: 'Retail & Commercial' },
  ],
  featuredServices: [
    { category: 'health-safety', slug: 'health-safety-audits' },
    { category: 'health-safety', slug: 'risk-assessments' },
    { category: 'health-safety', slug: 'cdm-consultancy' },
    { category: 'iso-management', slug: 'gap-analysis' },
    { category: 'compliance-regulatory', slug: 'competent-person-services' },
    { category: 'business-risk', slug: 'esg-advisory' },
  ],
  overview: {
    title: 'Consultancy built for UK organisations',
    paragraphs: [
      'CKBHSE Limited delivers end-to-end HSEQ consultancy across six specialist practice areas. Every engagement is led by qualified consultants with sector-specific experience.',
      'Whether you need a one-off audit, ISO certification support, or retained competent person services, our team provides clear scoping, rigorous delivery, and measurable outcomes.',
    ],
  },
  whyChoose: {
    title: 'Why choose CKBHSE',
    description:
      'Premium consultancy without the bureaucracy — senior expertise, transparent delivery, and results you can measure.',
    items: [
      {
        icon: 'Award',
        title: '15+ Years Experience',
        description: 'Established UK consultancy with 500+ clients nationwide.',
      },
      {
        icon: 'BadgeCheck',
        title: 'Qualified Consultants',
        description:
          'IOSH, NEBOSH, and IEMA qualified practitioners on every engagement.',
      },
      {
        icon: 'ShieldCheck',
        title: '98.7% Compliance Success',
        description:
          'Proven track record supporting certification and audit outcomes.',
      },
      {
        icon: 'Clock',
        title: 'Responsive Support',
        description:
          'Rapid mobilisation for audits, incidents, and urgent compliance needs.',
      },
    ],
  },
  methodology: {
    title: 'Our delivery methodology',
    description:
      'Every service follows a structured methodology ensuring consistency, quality, and measurable outcomes.',
    steps: [
      {
        step: '01',
        title: 'Consultation',
        description: 'Understand your requirements, scope, and objectives.',
      },
      {
        step: '02',
        title: 'Assessment',
        description:
          'Structured analysis against regulations and best practice.',
      },
      {
        step: '03',
        title: 'Recommendations',
        description: 'Prioritised findings with clear action plans.',
      },
      {
        step: '04',
        title: 'Implementation',
        description: 'Support your team to embed improvements.',
      },
      {
        step: '05',
        title: 'Review',
        description: 'Verify outcomes and continuous improvement.',
      },
    ],
  },
  engagementProcess: {
    title: 'How to engage CKBHSE',
    steps: [
      {
        title: 'Book a consultation',
        description:
          'Contact our team to discuss your requirements. We respond within one working day.',
      },
      {
        title: 'Receive a tailored proposal',
        description:
          'Clear scope, deliverables, timeline, and investment — no hidden costs.',
      },
      {
        title: 'Mobilise your consultant',
        description:
          'Senior consultant assigned and engagement commenced within agreed timeframe.',
      },
      {
        title: 'Review outcomes',
        description:
          'Receive deliverables, action plans, and optional follow-up support.',
      },
    ],
  },
  faqs: [
    {
      question: 'What industries do you serve?',
      answer:
        'We serve construction, manufacturing, logistics, oil and gas, healthcare, and retail sectors across the UK. Many services apply across multiple industries.',
    },
    {
      question: 'Do you offer retained advisory packages?',
      answer:
        'Yes. Retainer packages provide ongoing competent person support, regular site visits, compliance monitoring, and priority access to our consultancy team.',
    },
    {
      question: 'Can you support ISO certification?',
      answer:
        'We support ISO 9001, 14001, and 45001 certification including gap analysis, implementation, internal audit, and certification audit preparation.',
    },
    {
      question: 'How do I request a proposal?',
      answer:
        'Book a consultation via our contact page or call our team. We will scope your requirements and provide a tailored proposal within 3–5 working days.',
    },
  ],
  retainerCta: {
    title: 'Need ongoing HSEQ support?',
    description:
      'Our retainer packages provide dedicated consultancy support, regular site visits, compliance monitoring, and priority access to our team.',
    buttonLabel: 'Discuss Retainer Options',
    buttonHref: '/contact',
  },
} satisfies ServicesHubPageContent;
