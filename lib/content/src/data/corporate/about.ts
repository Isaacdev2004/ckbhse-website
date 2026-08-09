import type { CorporatePageContent } from '../../schemas/corporate.js';

export const aboutPageData = {
  slug: 'about',
  path: '/about',
  seo: {
    title: 'About CKBHSE Limited | UK HSE Consultancy',
    description:
      'CKBHSE Limited is an independent HSE consultancy providing specialist advisory, training and assurance services to organisations across the UK.',
  },
  hero: {
    badge: 'About CKBHSE',
    title: 'Safer workplaces. Stronger compliance. Better business.',
    description:
      'CKBHSE Limited is an independent HSE consultancy providing specialist advisory, training and assurance services to organisations across the UK. We help businesses strengthen health, safety and environmental performance, meet regulatory obligations and build robust management systems that support operational excellence.',
  },
  breadcrumbs: [
    { label: 'Home', href: '/' },
    { label: 'About CKBHSE', href: '/about' },
  ],
  sections: [
    {
      type: 'prose',
      title: 'Company Overview',
      paragraphs: [
        'CKBHSE Limited is an independent HSE consultancy providing specialist advisory, training and assurance services to organisations across the UK.',
        'We help businesses strengthen health, safety and environmental performance, meet regulatory obligations and build robust management systems that support operational excellence.',
      ],
    },
    {
      type: 'prose',
      title: 'How we work',
      paragraphs: [
        'Our approach is practical and evidence-based. We focus on clear recommendations that can be implemented in real workplaces — supporting compliance without overstating outcomes we cannot guarantee.',
        'Every engagement is scoped transparently, with agreed deliverables and honest advice on what is required to meet applicable UK health, safety and environmental obligations.',
      ],
    },
    {
      type: 'prose',
      title: 'Registered office',
      paragraphs: [
        'CKBHSE Limited (Company No. 17378677) is registered in England and Wales. Our registered office is 11 Henley Street, Mataab Business Centre, Birmingham, England, B11 1JB.',
      ],
    },
    {
      type: 'features',
      title: 'What we support',
      description:
        'Specialist HSE advisory aligned to UK regulatory expectations and client operational needs.',
      items: [
        {
          icon: 'ShieldCheck',
          title: 'Health & Safety',
          description:
            'Advisory support to help organisations manage workplace risk and meet applicable legal duties.',
        },
        {
          icon: 'Leaf',
          title: 'Environment',
          description:
            'Guidance to strengthen environmental performance and support responsible operational practice.',
        },
        {
          icon: 'FileCheck',
          title: 'Assurance',
          description:
            'Audits, reviews and assurance activity to identify gaps and support continuous improvement.',
        },
        {
          icon: 'GraduationCap',
          title: 'Training',
          description:
            'Practical training support to help teams understand their responsibilities and work more safely.',
        },
      ],
    },
    {
      type: 'cta',
      title: 'Ready to talk about your HSE priorities?',
      description:
        'Contact our team to discuss advisory, training or assurance support for your organisation.',
      buttonLabel: 'Book Consultation',
      buttonHref: '/contact',
    },
  ],
  cta: {
    title: 'Partner with CKBHSE',
    description:
      'Safer workplaces. Stronger compliance. Better business. Speak with us about your requirements.',
    buttonLabel: 'Contact Our Team',
    buttonHref: '/contact',
  },
} satisfies CorporatePageContent;
