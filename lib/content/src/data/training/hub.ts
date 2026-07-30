import type { TrainingHubPageContent } from '../../schemas/training.js';
import {
  DELIVERY_METHOD_LABELS,
  PATHWAY_LEVEL_LABELS,
  TRAINING_CATEGORY_LABELS,
} from '../../schemas/training.js';
import type {
  DeliveryMethodId,
  PathwayLevelId,
  TrainingCategoryId,
} from '../../schemas/training.js';

export const trainingHubPageData = {
  seo: {
    title: 'Safety Training Courses | CKBHSE Limited',
    description:
      'IOSH, NEBOSH, and specialist health and safety training delivered by qualified professionals. Classroom, online, and on-site options available.',
  },
  hero: {
    badge: 'Accredited Training Provider',
    title: 'Training & Professional Development',
    description:
      'From foundation awareness to professional qualifications — accredited HSE training delivered by qualified practitioners across the UK.',
  },
  categories: (
    Object.entries(TRAINING_CATEGORY_LABELS) as [TrainingCategoryId, string][]
  ).map(([id, label]) => ({
    id,
    label,
    description: `${label} training programmes for UK organisations.`,
  })),
  deliveryMethodFilters: (
    Object.entries(DELIVERY_METHOD_LABELS) as [DeliveryMethodId, string][]
  ).map(([id, label]) => ({ id, label })),
  industryFilters: [
    { id: 'construction', label: 'Construction' },
    { id: 'manufacturing', label: 'Manufacturing' },
    { id: 'logistics', label: 'Logistics & Transport' },
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'oil-gas', label: 'Oil & Gas' },
    { id: 'retail', label: 'Retail & Commercial' },
  ],
  certificationFilters: [
    { id: 'iosh', label: 'IOSH' },
    { id: 'nebosh', label: 'NEBOSH' },
    { id: 'cpd', label: 'CPD Certified' },
    { id: 'hse', label: 'HSE Approved' },
  ],
  durationFilters: [
    { id: 'short', label: 'Under 1 day' },
    { id: 'medium', label: '1–3 days' },
    { id: 'long', label: '4+ days' },
  ],
  pathwayLevels: (
    Object.entries(PATHWAY_LEVEL_LABELS) as [PathwayLevelId, string][]
  ).map(([id, label]) => ({ id, label })),
  featuredCourses: [
    { category: 'health-safety', slug: 'iosh-managing-safely' },
    { category: 'health-safety', slug: 'nebosh-general-certificate' },
    { category: 'health-safety', slug: 'iosh-working-safely' },
    { category: 'leadership-culture', slug: 'safety-leadership' },
    { category: 'iso-management', slug: 'integrated-management-systems' },
    { category: 'compliance-governance', slug: 'cdm-regulations' },
  ],
  overview: {
    title: 'Professional development that drives compliance',
    paragraphs: [
      'CKBHSE delivers accredited and specialist training programmes mapped to UK legislation, industry standards, and your operational context.',
      'Every course connects to our consultancy services and sector expertise — giving your teams a clear path from learning to implementation.',
    ],
  },
  whyTrain: {
    title: 'Why train with CKBHSE',
    description:
      'Training delivered by practising consultants who understand your sector.',
    items: [
      {
        icon: 'Award',
        title: 'Accredited Courses',
        description:
          'IOSH, NEBOSH, HSE approved qualifications and CPD-certified programmes.',
      },
      {
        icon: 'Users',
        title: 'Expert Trainers',
        description:
          'Delivered by qualified safety professionals with real-world sector experience.',
      },
      {
        icon: 'BookOpen',
        title: 'Flexible Delivery',
        description:
          'Classroom, online, on-site, and virtual instructor-led options.',
      },
      {
        icon: 'GraduationCap',
        title: 'Career Pathways',
        description:
          'Structured learning pathways from foundation to leadership level.',
      },
    ],
  },
  learningPathways: {
    title: 'Learning pathways',
    description:
      'Progress from foundation awareness through to advanced qualifications and leadership development.',
    pathways: [
      {
        level: 'foundation',
        title: 'Foundation',
        description:
          'Essential awareness for all employees — hazard recognition and personal responsibility.',
        courses: [
          { category: 'health-safety', slug: 'iosh-working-safely' },
          { category: 'health-safety', slug: 'fire-safety-awareness' },
          { category: 'health-safety', slug: 'manual-handling' },
          { category: 'environmental', slug: 'environmental-awareness' },
        ],
      },
      {
        level: 'intermediate',
        title: 'Intermediate',
        description:
          'Supervisor and manager competence — risk assessment, compliance, and team leadership.',
        courses: [
          { category: 'health-safety', slug: 'iosh-managing-safely' },
          { category: 'health-safety', slug: 'risk-assessment' },
          { category: 'compliance-governance', slug: 'cdm-regulations' },
          { category: 'leadership-culture', slug: 'supervisor-development' },
        ],
      },
      {
        level: 'advanced',
        title: 'Advanced',
        description:
          'Professional qualifications and specialist technical competence.',
        courses: [
          { category: 'health-safety', slug: 'nebosh-general-certificate' },
          { category: 'iso-management', slug: 'iso-45001-internal-auditor' },
          { category: 'compliance-governance', slug: 'incident-investigation' },
          { category: 'occupational-health', slug: 'occupational-hygiene' },
        ],
      },
      {
        level: 'leadership',
        title: 'Leadership',
        description:
          'Executive and cultural leadership for sustained safety excellence.',
        courses: [
          { category: 'leadership-culture', slug: 'safety-leadership' },
          { category: 'leadership-culture', slug: 'safety-culture' },
          { category: 'leadership-culture', slug: 'behavioural-safety' },
        ],
      },
    ],
  },
  corporateTraining: {
    title: 'Corporate training solutions',
    description:
      'Need to train multiple employees? We offer bespoke on-site training, group discounts, and tailored programmes for organisations.',
    offerings: [
      {
        icon: 'Building2',
        title: 'On-site Training',
        description:
          'Delivered at your premises, tailored to your workplace hazards and procedures.',
      },
      {
        icon: 'Users',
        title: 'Virtual Instructor-Led',
        description:
          'Live online sessions for distributed teams with interactive workshops.',
      },
      {
        icon: 'Target',
        title: 'Bespoke Programmes',
        description:
          'Customised curricula aligned to your policies, risks, and industry requirements.',
      },
      {
        icon: 'ClipboardList',
        title: 'Compliance Workshops',
        description:
          'Focused sessions on CDM, ISO, fire safety, and regulatory updates.',
      },
      {
        icon: 'TrendingUp',
        title: 'Workforce Development',
        description:
          'Structured programmes building competence across your organisation.',
      },
      {
        icon: 'GraduationCap',
        title: 'Enterprise Learning',
        description:
          'Multi-site rollouts with consistent standards and centralised reporting.',
      },
    ],
  },
  faqs: [
    {
      question: 'Are CKBHSE training courses accredited?',
      answer:
        'Yes. We deliver IOSH, NEBOSH, and HSE-approved programmes alongside CPD-certified specialist courses. Certificates are issued upon successful completion.',
    },
    {
      question: 'Can courses be delivered on-site for our team?',
      answer:
        'Most courses are available on-site for groups of four or more delegates. We also offer classroom, online, and virtual instructor-led delivery.',
    },
    {
      question: 'Do you offer group discounts?',
      answer:
        'Yes. Contact our training team for corporate pricing, multi-course packages, and retainer arrangements for ongoing workforce development.',
    },
    {
      question: 'How do I book a course?',
      answer:
        'Enquire via our contact form or call our training team. We will confirm dates, delivery format, delegate numbers, and pricing.',
    },
  ],
  consultationCta: {
    title: 'Discuss your training requirements',
    description:
      'Speak to our training team about course selection, group bookings, bespoke programmes, and learning pathway design.',
    buttonLabel: 'Enquire About Training',
    buttonHref: '/contact',
  },
} satisfies TrainingHubPageContent;
