import type { IndustriesHubPageContent } from '../../schemas/industries.js';
import { INDUSTRY_SECTOR_LABELS } from '../../schemas/industries.js';
import type { IndustrySectorId } from '../../schemas/industries.js';

export const industriesHubPageData = {
  seo: {
    title: 'Industry-Specific HSE Expertise | CKBHSE Limited',
    description:
      'Sector-specific health, safety, and environmental consultancy for construction, manufacturing, healthcare, logistics, and more across the UK.',
  },
  hero: {
    badge: 'Industries',
    title: 'Sector expertise that speaks your language',
    description:
      'Every industry faces unique regulations, risks, and compliance pressures. CKBHSE delivers tailored HSE consultancy mapped to your sector — not generic advice.',
  },
  sectors: (
    Object.entries(INDUSTRY_SECTOR_LABELS) as [IndustrySectorId, string][]
  ).map(([id, label]) => ({ id, label })),
  regulatoryThemes: [
    { id: 'cdm', label: 'CDM & Construction' },
    { id: 'iso', label: 'ISO Certification' },
    { id: 'fire', label: 'Fire Safety' },
    { id: 'environmental', label: 'Environmental' },
    { id: 'occupational-health', label: 'Occupational Health' },
    { id: 'process-safety', label: 'Process Safety' },
  ],
  featuredIndustries: [
    'construction',
    'manufacturing',
    'healthcare',
    'logistics',
    'oil-gas',
    'retail',
  ],
  overview: {
    title: 'Why industry expertise matters',
    paragraphs: [
      "Generic compliance advice fails in sector-specific environments. CKBHSE consultants bring deep experience in your industry's legislation, standards, and operational realities.",
      'Each industry page maps sector risks to CKBHSE services, training programmes, and resources — giving you a clear path from understanding to action.',
    ],
  },
  regulatoryLandscape: {
    title: 'UK regulatory landscape',
    description:
      'CKBHSE helps organisations navigate the key regulators and frameworks affecting UK industry sectors.',
    items: [
      {
        name: 'Health and Safety Executive (HSE)',
        description:
          'Primary regulator for workplace health and safety across all sectors.',
      },
      {
        name: 'Environment Agency',
        description:
          'Environmental permitting, pollution prevention, and waste regulation.',
      },
      {
        name: 'Care Quality Commission (CQC)',
        description:
          'Safety regulation for health and social care providers.',
      },
      {
        name: 'ISO Standards Bodies',
        description:
          'International management system standards for environment and OH&S.',
      },
    ],
  },
  industryStatistics: [
    { icon: 'Building2', value: '12', label: 'Industry Sectors Covered' },
    { icon: 'Users', value: 'UK', label: 'Nationwide Support' },
    { icon: 'Award', value: 'HSE', label: 'Advisory Focus' },
    { icon: 'Shield', value: 'Practical', label: 'Workplace Solutions' },
  ],
  clientJourney: {
    title: 'Your sector consultation journey',
    steps: [
      {
        title: 'Identify your sector',
        description:
          'Browse industry pages or contact us to discuss your specific sector challenges.',
      },
      {
        title: 'Review applicable services',
        description:
          'Each industry page maps risks to CKBHSE consultancy services and training.',
      },
      {
        title: 'Book a consultation',
        description:
          'Speak with a sector-experienced consultant about your compliance priorities.',
      },
      {
        title: 'Receive a tailored proposal',
        description:
          'Clear scope, deliverables, and investment aligned to your sector requirements.',
      },
    ],
  },
  featuredCaseStudies: [
    {
      slug: 'cdm-london-development',
      title: 'CDM London Development',
      href: '/case-studies/construction/cdm-london-development',
    },
    {
      slug: 'iso-45001-certification',
      title: 'Manufacturing ISO 45001 Certification',
      href: '/case-studies/manufacturing/iso-45001-certification',
    },
  ],
  relatedResources: [
    {
      slug: 'knowledge-hub',
      title: 'Knowledge Centre',
      href: '/resources',
      available: true,
    },
    {
      slug: 'case-studies',
      title: 'Case Studies',
      href: '/case-studies',
      available: true,
    },
    {
      slug: 'why-choose-us',
      title: 'Why Choose CKBHSE',
      href: '/about/why-choose-us',
      available: true,
    },
  ],
  faqs: [
    {
      question: 'Which industries does CKBHSE serve?',
      answer:
        'We serve twelve primary sectors including construction, manufacturing, logistics, warehousing, oil and gas, energy, healthcare, education, facilities management, food and beverage, retail, and public sector organisations.',
    },
    {
      question: 'Can you support organisations in multiple sectors?',
      answer:
        'Yes. Many clients operate across sectors — for example, logistics with warehousing and manufacturing. We assign consultants with relevant multi-sector experience.',
    },
    {
      question: 'How do industry pages connect to your services?',
      answer:
        'Each industry page lists applicable CKBHSE services and training with direct links to our service catalogue — all relationships are defined in our content model, not hardcoded.',
    },
  ],
  cta: {
    title: "Don't see your exact sector?",
    description:
      'We work across many sub-sectors and niche industries. Contact our team to discuss your specific requirements.',
    buttonLabel: 'Contact Our Team',
    buttonHref: '/contact',
  },
} satisfies IndustriesHubPageContent;
