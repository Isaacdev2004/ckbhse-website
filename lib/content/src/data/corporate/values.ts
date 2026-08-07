import type { CorporatePageContent } from '../../schemas/corporate.js';

const aboutCrumb = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
];

export const valuesPageData = {
  slug: 'values',
  path: '/about/values',
  seo: {
    title: 'Core Values | CKBHSE Limited',
    description:
      'The core values that guide CKBHSE Limited — integrity, excellence, accountability, and partnership in every HSE engagement.',
  },
  hero: {
    badge: 'Core Values',
    title: 'Values that define how we work',
    description:
      'Our values shape every client interaction, audit finding, training delivery, and advisory recommendation.',
  },
  breadcrumbs: [...aboutCrumb, { label: 'Core Values', href: '/about/values' }],
  sections: [
    {
      type: 'values',
      title: 'Our Core Values',
      description:
        'These principles are embedded in our consultancy methodology and consultant code of conduct.',
      items: [
        {
          icon: 'Shield',
          title: 'Integrity',
          description:
            'We provide honest, evidence-based advice — even when findings are difficult.',
          supportingStatement:
            'Clients trust us because we tell the truth about compliance gaps and risks.',
        },
        {
          icon: 'Award',
          title: 'Excellence',
          description:
            'We hold ourselves to the highest professional and technical standards.',
          supportingStatement:
            'Continuous CPD and peer review ensure our work meets board-level scrutiny.',
        },
        {
          icon: 'Users',
          title: 'Partnership',
          description:
            'We work alongside your teams, not above them — building capability, not dependency.',
          supportingStatement:
            'Knowledge transfer is built into every engagement from day one.',
        },
        {
          icon: 'Scale',
          title: 'Accountability',
          description:
            'We take ownership of deliverables, timelines, and follow-through.',
          supportingStatement:
            'Clear scopes, defined milestones, and transparent reporting at every stage.',
        },
        {
          icon: 'Leaf',
          title: 'Stewardship',
          description:
            'We promote environmental responsibility and sustainable safety practices.',
          supportingStatement:
            'ESG considerations are integrated into our advisory approach.',
        },
        {
          icon: 'Lightbulb',
          title: 'Pragmatism',
          description:
            'Recommendations must be implementable within your operational context.',
          supportingStatement:
            'We balance regulatory rigour with practical, cost-effective solutions.',
        },
      ],
    },
  ],
  cta: {
    title: 'Experience our values in practice',
    description: 'See why organisations choose CKBHSE for HSE consultancy.',
    buttonLabel: 'Why Choose CKBHSE',
    buttonHref: '/about/why-choose-us',
  },
} satisfies CorporatePageContent;
