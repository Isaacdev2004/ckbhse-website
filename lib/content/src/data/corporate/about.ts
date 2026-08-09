import type { CorporatePageContent } from '../../schemas/corporate.js';

export const aboutPageData = {
  slug: 'about',
  path: '/about',
  seo: {
    title: 'About CKBHSE Limited | UK HSE Consultancy',
    description:
      'CKBHSE Limited is an independent Health, Safety and Environment (HSE) consultancy providing specialist support to organisations across the UK.',
  },
  hero: {
    badge: 'About CKBHSE',
    title: 'Safer workplaces. Stronger compliance. Better business.',
    description:
      'CKBHSE Limited is an independent Health, Safety and Environment (HSE) consultancy providing specialist support to organisations across the UK.',
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
        'CKBHSE Limited is an independent Health, Safety and Environment (HSE) consultancy providing specialist support to organisations across the UK.',
        'We work across sectors including construction, manufacturing, engineering, logistics, energy and healthcare, helping organisations manage risk, strengthen regulatory compliance and improve health, safety and environmental performance.',
        'Our approach combines regulatory expertise with extensive operational experience, ensuring our advice is technically robust, practical, proportionate and achievable.',
      ],
    },
    {
      type: 'prose',
      title: 'Our Story',
      paragraphs: [
        'CKBHSE was founded by experienced HSE professionals with a clear purpose: to provide organisations with practical, commercially aware HSE support that goes beyond generic compliance advice.',
        'Having worked within complex and highly regulated environments, our consultants understand the challenges organisations face in translating legislation, standards and corporate requirements into effective day-to-day practice.',
        'CKBHSE brings this experience together to provide consultancy, assurance and training that supports operational teams, managers and senior leaders.',
      ],
    },
    {
      type: 'prose',
      title: 'Our Expertise',
      paragraphs: [
        'CKBHSE is built on extensive professional experience across diverse and demanding industries.',
        'Our expertise spans health and safety management, environmental compliance, risk management, DSEAR, incident investigation, auditing, contractor safety, workplace inspections, training and the development and implementation of effective HSE management systems.',
        'We continue to strengthen our methodologies, technical knowledge and industry insight to ensure clients receive responsive, practical and dependable HSE support.',
      ],
    },
    {
      type: 'quote',
      text: 'Safety is not simply a department — it is a leadership discipline that protects people, reputation and performance.',
      attribution: 'CKBHSE',
    },
    {
      type: 'prose',
      title: 'Our Philosophy',
      paragraphs: [
        'We believe effective HSE management should enable better business, not create unnecessary bureaucracy.',
        'Our approach balances regulatory compliance with operational reality. We work with clients to develop solutions that are proportionate, practical and measurable — helping organisations move beyond simply meeting requirements towards stronger systems, greater accountability and sustainable improvement.',
      ],
    },
    {
      type: 'prose',
      title: 'Why CKBHSE Exists',
      paragraphs: [
        'Organisations operate within an increasingly complex environment of regulatory requirements, supply-chain pressures, workforce expectations and corporate accountability.',
        'Navigating these responsibilities requires more than policies and paperwork.',
        'CKBHSE exists to provide clear, competent and practical HSE expertise that helps organisations understand their obligations, manage risk effectively and demonstrate robust compliance.',
        'Whether supporting a specific project, undertaking an audit, investigating an incident, strengthening environmental compliance or providing ongoing HSE advisory support, our objective is simple: to help clients protect their people, strengthen their organisations and operate with confidence.',
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
