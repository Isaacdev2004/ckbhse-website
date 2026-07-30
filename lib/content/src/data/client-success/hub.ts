import type { ClientSuccessHubPageContent } from '../../schemas/client-success.js';

export const clientSuccessHubPageData = {
  seo: {
    title: 'Client Success | CKBHSE Limited',
    description:
      'Measurable outcomes delivered across UK sectors — incident reduction, compliance achievement, certification success, and long-term client partnerships.',
  },
  hero: {
    badge: 'Measurable Outcomes',
    title: 'Client Success',
    description:
      'Evidence-based results from CKBHSE consultancy programmes — before and after comparisons, outcome dashboards, and verified client testimonials.',
  },
  aggregateStatistics: [
    { label: 'Average incident reduction', value: '42%' },
    { label: 'Certifications achieved', value: '150+' },
    { label: 'Professionals trained', value: '12,000+' },
    { label: 'Client retention', value: '94%' },
  ],
  beforeAfterHighlights: [
    {
      title: 'Safety performance',
      before: 'Reactive incident management',
      after: 'Proactive risk-based programmes with 42% average incident reduction',
    },
    {
      title: 'Compliance posture',
      before: 'Fragmented audits and gaps',
      after: '96% audit pass rate with integrated management systems',
    },
  ],
  outcomeDashboard: [
    {
      type: 'incident-reduction',
      label: 'Incident reduction',
      value: '42%',
      description: 'Average across client portfolio',
    },
    {
      type: 'compliance-score',
      label: 'Audit pass rate',
      value: '96%',
    },
    {
      type: 'certification-achievement',
      label: 'Certifications',
      value: '150+',
    },
    {
      type: 'training-completion',
      label: 'Delegates trained',
      value: '12,000+',
    },
  ],
  clientJourney: [
    {
      step: '1',
      title: 'Consult',
      description: 'Understand your objectives, constraints, and regulatory context.',
    },
    {
      step: '2',
      title: 'Assess',
      description: 'Gap analysis, risk profiling, and baseline measurement.',
    },
    {
      step: '3',
      title: 'Deliver',
      description: 'Implementation through consultancy, training, and assurance.',
    },
    {
      step: '4',
      title: 'Demonstrate',
      description: 'Measure outcomes, report results, and sustain improvement.',
    },
  ],
  deliveryMethodology: [
    'Sector-specific expertise from day one',
    'Integrated consultancy, training, and audit services',
    'Measurable KPIs defined at project outset',
    'Executive reporting and board-ready evidence',
    'Long-term partnership and continuous improvement',
  ],
  improvementMetrics: [
    {
      type: 'operational-efficiency',
      label: 'Process efficiency',
      value: '+25%',
      description: 'Average improvement across transformation programmes',
    },
    {
      type: 'employee-engagement',
      label: 'Safety culture',
      value: '+34%',
      description: 'Average engagement index improvement',
    },
  ],
  riskReductionMetrics: [
    {
      type: 'incident-reduction',
      label: 'Portfolio incident reduction',
      value: '42%',
    },
    {
      type: 'lti-reduction',
      label: 'Lost-time injury reduction',
      value: '58%',
    },
  ],
  complianceAchievements: [
    'ISO 45001, 14001, and 9001 certifications',
    'CDM 2015 and Building Safety Act compliance',
    'CQC Outstanding safety ratings',
    'HSE inspection readiness and clean records',
    'DVSA operator compliance improvement',
  ],
  featuredStories: [
    'construction-excellence',
    'manufacturing-transformation',
    'healthcare-compliance',
    'multi-sector-impact',
  ],
  featuredTestimonials: [
    'construction-director-london',
    'manufacturing-hs-manager',
    'healthcare-safety-lead',
  ],
  clientLogos: [
    { name: 'London Development Consortium', industry: 'construction' },
    { name: 'Midlands Automotive Group', industry: 'manufacturing' },
    { name: 'NHS Foundation Trust', industry: 'healthcare' },
    { name: 'National Logistics Group', industry: 'logistics' },
  ],
  awards: [
    {
      title: 'Health & Safety Excellence',
      issuer: 'British Safety Council',
      year: '2024',
    },
    {
      title: 'ISO Implementation Partner',
      issuer: 'UKAS network',
      year: '2023',
    },
  ],
  successTimeline: [
    {
      year: '2024',
      title: 'Knowledge Centre & Client Success platform',
      description: 'Complete public website with scalable content architecture.',
    },
    {
      year: '2023',
      title: 'Multi-sector portfolio growth',
      description: 'Expanded programmes across 12+ industry sectors.',
    },
    {
      year: '2020',
      title: 'Enterprise delivery model',
      description: 'Established measurable outcome frameworks for all clients.',
    },
  ],
  faqs: [
    {
      question: 'How does CKBHSE define client success?',
      answer:
        'We agree measurable KPIs at project outset — incident rates, compliance scores, training completion, certification achievement — and report against them throughout delivery.',
    },
    {
      question: 'Can we see outcomes relevant to our sector?',
      answer:
        'Yes. Browse client success stories by sector or contact us for a tailored presentation of relevant outcomes and references.',
    },
  ],
  consultationCta: {
    title: 'Ready to become our next success story?',
    description:
      'Request a proposal or book a consultation to discuss measurable outcomes for your organisation.',
    buttonLabel: 'Request Proposal',
    buttonHref: '/contact',
    action: 'request-proposal',
  },
} satisfies ClientSuccessHubPageContent;
