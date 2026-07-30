import {
  defineResource,
  p,
  h2,
  ul,
  serviceRef,
  courseRef,
} from './helpers.js';

export const webinarResources = [
  defineResource({
    slug: 'cdm-2024-update-briefing',
    type: 'webinars',
    title: 'CDM Regulations Update Briefing',
    subtitle:
      'Live briefing on CDM enforcement trends and client duty holder focus.',
    icon: 'Users',
    summary:
      'Recorded webinar covering recent HSE CDM enforcement activity and practical client compliance steps.',
    author: 'Sarah Mitchell',
    publishDate: 'April 10, 2024',
    readingTime: '45 min',
    body: [
      p(
        'This recorded webinar explores recent CDM enforcement trends and practical steps for clients and principal contractors.',
      ),
      h2('Topics covered'),
      ul([
        'Client duty focus',
        'Pre-construction information quality',
        'Construction phase plan reviews',
        'HSE inspection outcomes',
      ]),
    ],
    tags: ['webinar', 'CDM', 'construction'],
    industrySlugs: ['construction'],
    webinar: { status: 'recorded', duration: '45 minutes' },
    relatedServices: [serviceRef('health-safety', 'cdm-consultancy')],
    featured: true,
    keywords: ['CDM webinar'],
  }),
  defineResource({
    slug: 'iso-45001-transition-webinar',
    type: 'webinars',
    title: 'ISO 45001 Transition Masterclass',
    subtitle: 'On-demand masterclass for organisations implementing ISO 45001.',
    icon: 'ShieldCheck',
    summary:
      'On-demand webinar walking through ISO 45001 implementation from gap analysis to certification.',
    author: 'Dr. James Parker',
    publishDate: 'March 22, 2024',
    readingTime: '60 min',
    body: [
      p(
        'Comprehensive masterclass on ISO 45001 implementation phases and common certification pitfalls.',
      ),
    ],
    tags: ['webinar', 'ISO 45001'],
    industrySlugs: ['manufacturing'],
    webinar: { status: 'on-demand', duration: '60 minutes' },
    relatedServices: [serviceRef('iso-management', 'iso-45001')],
    keywords: ['ISO 45001 webinar'],
  }),
  defineResource({
    slug: 'fire-safety-reform-webinar',
    type: 'webinars',
    title: 'Fire Safety Reform: What Building Owners Need to Know',
    subtitle:
      'Upcoming webinar on fire safety reform and building safety act implications.',
    icon: 'Flame',
    summary:
      'Upcoming live webinar on fire safety reform, responsible person duties, and building safety requirements.',
    author: 'Michael Chen',
    publishDate: 'May 15, 2024',
    readingTime: '50 min',
    body: [
      p(
        'Register for this upcoming webinar on fire safety reform and evolving building safety requirements.',
      ),
    ],
    tags: ['webinar', 'fire safety', 'building safety'],
    industrySlugs: ['retail', 'healthcare', 'facilities-management'],
    webinar: {
      status: 'upcoming',
      scheduledDate: 'May 15, 2024',
      duration: '50 minutes',
      registrationUrl: '/contact',
    },
    relatedServices: [serviceRef('health-safety', 'fire-risk-assessments')],
    keywords: ['fire safety webinar'],
  }),
  defineResource({
    slug: 'behavioural-safety-masterclass',
    type: 'webinars',
    title: 'Behavioural Safety Masterclass',
    subtitle:
      'Recorded session on designing effective behaviour-based safety programmes.',
    icon: 'Lightbulb',
    summary:
      'Recorded webinar on human factors, observation programmes, and sustaining behavioural change.',
    author: 'Emma Richardson',
    publishDate: 'February 20, 2024',
    readingTime: '55 min',
    body: [
      p(
        'Learn how to design and sustain behaviour-based safety programmes that deliver measurable improvement.',
      ),
    ],
    tags: ['webinar', 'behavioural safety', 'culture'],
    industrySlugs: ['manufacturing', 'oil-gas'],
    webinar: { status: 'recorded', duration: '55 minutes' },
    relatedCourses: [courseRef('leadership-culture', 'behavioural-safety')],
    keywords: ['behavioural safety webinar'],
  }),
];

export const newsResources = [
  defineResource({
    slug: 'hse-fee-for-intervention-update',
    type: 'news',
    title: 'HSE Fee for Intervention Rates Updated for 2024/25',
    subtitle:
      'Regulatory update on FFI hourly rates and enforcement cost recovery.',
    icon: 'Scale',
    summary:
      'Summary of updated HSE Fee for Intervention rates and implications for businesses subject to material breaches.',
    author: 'CKBHSE Regulatory Team',
    publishDate: 'April 12, 2024',
    readingTime: '4 min read',
    body: [
      p(
        'HSE has updated Fee for Intervention rates for the 2024/25 period. Organisations found in material breach of health and safety law may be charged for HSE investigation time.',
      ),
      h2('Key points'),
      ul([
        'Updated hourly FFI rate',
        'Material breach criteria unchanged',
        'Importance of proactive compliance',
      ]),
    ],
    tags: ['regulatory update', 'HSE', 'FFI'],
    industrySlugs: ['construction', 'manufacturing'],
    regulatoryType: 'hse-guidance',
    featured: true,
    keywords: ['HSE FFI update'],
  }),
  defineResource({
    slug: 'building-safety-act-guidance',
    type: 'news',
    title: 'Building Safety Act: New Guidance for Higher-Risk Buildings',
    subtitle: 'Legislative update on building safety regime requirements.',
    icon: 'Building',
    summary:
      'Overview of Building Safety Act requirements for higher-risk buildings and accountable person duties.',
    author: 'CKBHSE Regulatory Team',
    publishDate: 'March 30, 2024',
    readingTime: '5 min read',
    body: [
      p(
        'The Building Safety Act introduces new duties for higher-risk buildings including safety case requirements and golden thread documentation.',
      ),
    ],
    tags: ['legislation', 'building safety'],
    industrySlugs: ['construction', 'facilities-management'],
    regulatoryType: 'legislation',
    keywords: ['Building Safety Act'],
  }),
  defineResource({
    slug: 'iso-45001-amendment-2024',
    type: 'news',
    title: 'ISO 45001 Amendment Published: What Changed',
    subtitle:
      'ISO update alert for occupational health and safety management systems.',
    icon: 'ShieldCheck',
    summary:
      'Summary of the ISO 45001 amendment and recommended actions for certified organisations.',
    author: 'CKBHSE Regulatory Team',
    publishDate: 'March 18, 2024',
    readingTime: '4 min read',
    body: [
      p(
        'ISO has published an amendment to ISO 45001. Certified organisations should review the changes and update their management systems accordingly.',
      ),
    ],
    tags: ['ISO update', 'ISO 45001'],
    industrySlugs: ['manufacturing'],
    regulatoryType: 'iso-update',
    relatedServices: [serviceRef('iso-management', 'iso-45001')],
    keywords: ['ISO 45001 amendment'],
  }),
  defineResource({
    slug: 'hse-workplace-stress-campaign',
    type: 'news',
    title: 'HSE Launches Workplace Stress Inspection Campaign',
    subtitle: 'Best practice alert on managing work-related stress.',
    icon: 'Heart',
    summary:
      'HSE inspection campaign focusing on work-related stress — prepare with risk assessments and management support.',
    author: 'CKBHSE Regulatory Team',
    publishDate: 'February 28, 2024',
    readingTime: '3 min read',
    body: [
      p(
        'HSE is targeting sectors with high stress-related absence rates. Ensure stress risk assessments and management support are in place.',
      ),
    ],
    tags: ['HSE campaign', 'stress', 'wellbeing'],
    industrySlugs: ['healthcare', 'education', 'public-sector'],
    regulatoryType: 'best-practice',
    relatedCourses: [courseRef('occupational-health', 'workplace-wellbeing')],
    keywords: ['HSE stress campaign'],
  }),
];

export const publicationResources = [
  defineResource({
    slug: 'hseq-maturity-white-paper',
    type: 'publications',
    title: 'HSEQ Maturity Model White Paper',
    subtitle: 'CKBHSE framework for assessing and improving HSEQ maturity.',
    icon: 'BookOpen',
    summary:
      'White paper presenting the CKBHSE HSEQ maturity model for benchmarking organisational performance.',
    author: 'Dr. James Parker',
    publishDate: 'April 1, 2024',
    readingTime: '20 min read',
    body: [
      p(
        'This white paper introduces a five-level maturity model for assessing health, safety, environmental, and quality performance.',
      ),
      h2('Maturity levels'),
      ul(['Reactive', 'Compliant', 'Proactive', 'Managed', 'Leading']),
    ],
    tags: ['white paper', 'maturity model', 'HSEQ'],
    industrySlugs: ['manufacturing', 'oil-gas'],
    downloadableFiles: [
      {
        name: 'HSEQ Maturity Model White Paper',
        fileType: 'pdf',
        url: '/downloads/publications/hseq-maturity-white-paper.pdf',
        description: 'PDF white paper',
        size: '2.4 MB',
      },
    ],
    featured: true,
    keywords: ['HSEQ maturity white paper'],
  }),
  defineResource({
    slug: 'construction-safety-technical-brief',
    type: 'publications',
    title: 'Construction Site Safety: Technical Brief',
    subtitle:
      'Technical publication on high-risk construction activities and controls.',
    icon: 'Building2',
    summary:
      'Technical brief covering work at height, temporary works, and contractor coordination on construction sites.',
    author: 'Sarah Mitchell',
    publishDate: 'March 5, 2024',
    readingTime: '18 min read',
    body: [
      p(
        'Detailed technical guidance on managing high-risk construction activities in line with CDM and HSE expectations.',
      ),
    ],
    tags: ['technical publication', 'construction'],
    industrySlugs: ['construction'],
    downloadableFiles: [
      {
        name: 'Construction Safety Technical Brief',
        fileType: 'pdf',
        url: '/downloads/publications/construction-safety-brief.pdf',
        size: '1.8 MB',
      },
    ],
    keywords: ['construction safety publication'],
  }),
  defineResource({
    slug: 'environmental-permitting-guide',
    type: 'publications',
    title: 'Environmental Permitting: Technical Guide',
    subtitle: 'Guide to UK environmental permitting for industrial operations.',
    icon: 'Leaf',
    summary:
      'Technical guide to environmental permit applications, compliance monitoring, and enforcement response.',
    author: 'Emma Richardson',
    publishDate: 'February 10, 2024',
    readingTime: '22 min read',
    body: [
      p(
        'Comprehensive guide to navigating the UK environmental permitting regime for manufacturing and industrial sites.',
      ),
    ],
    tags: ['technical publication', 'environmental', 'permits'],
    industrySlugs: ['manufacturing', 'oil-gas'],
    downloadableFiles: [
      {
        name: 'Environmental Permitting Guide',
        fileType: 'pdf',
        url: '/downloads/publications/environmental-permitting-guide.pdf',
        size: '3.1 MB',
      },
    ],
    relatedServices: [serviceRef('environmental', 'environmental-compliance')],
    keywords: ['environmental permitting guide'],
  }),
];
