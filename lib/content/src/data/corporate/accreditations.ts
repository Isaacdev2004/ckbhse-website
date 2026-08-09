import type { CorporatePageContent } from '../../schemas/corporate.js';

const aboutCrumb = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
];

export const accreditationsPageData = {
  slug: 'accreditations',
  path: '/about/accreditations',
  seo: {
    title: 'Accreditations & Certifications | CKBHSE Limited',
    description:
      'CKBHSE Limited accreditations — ISO certifications, industry memberships, awards, and professional body affiliations.',
  },
  hero: {
    badge: 'Accreditations',
    title: 'Recognised standards. Verified credentials.',
    description:
      'Our accreditations and professional memberships demonstrate our commitment to competence, and industry best practice.',
  },
  breadcrumbs: [
    ...aboutCrumb,
    { label: 'Accreditations', href: '/about/accreditations' },
  ],
  sections: [
    {
      type: 'accreditations',
      title: 'ISO Certifications',
      description:
        'International management system certifications held by CKBHSE Limited.',
      items: [
        {
          slug: 'iso-14001',
          name: 'ISO 14001:2015',
          category: 'iso',
          description:
            'Environmental Management Systems — internal environmental operations.',
          icon: 'Leaf',
        },
        {
          slug: 'iso-45001',
          name: 'ISO 45001:2018',
          category: 'iso',
          description:
            'Occupational Health and Safety Management Systems alignment.',
          icon: 'Shield',
        },
      ],
    },
    {
      type: 'accreditations',
      title: 'Industry Memberships',
      items: [
        {
          slug: 'iosh',
          name: 'Institution of Occupational Safety and Health',
          category: 'membership',
          description:
            'Corporate membership and accredited training centre status.',
          icon: 'GraduationCap',
        },
        {
          slug: 'iema',
          name: 'Institute of Environmental Management & Assessment',
          category: 'membership',
          description: 'Environmental practitioner network and CPD framework.',
          icon: 'Leaf',
        },
        {
          slug: 'bsi',
          name: 'BSI Associate Consultant Programme',
          category: 'membership',
          description:
            'Aligned to British Standards for management system consultancy.',
          icon: 'FileCheck',
        },
      ],
    },
    {
      type: 'accreditations',
      title: 'Awards',
      items: [
        {
          slug: 'safety-excellence-2024',
          name: 'Safety Excellence Award 2024',
          category: 'award',
          description:
            'Recognised for outstanding client safety improvement outcomes.',
          icon: 'Award',
        },
        {
          slug: 'training-provider-2023',
          name: 'Training Provider of the Year 2023',
          category: 'award',
          description:
            'Industry recognition for accredited training delivery excellence.',
          icon: 'GraduationCap',
        },
      ],
    },
    {
      type: 'accreditations',
      title: 'Professional Bodies',
      items: [
        {
          slug: 'nebosh',
          name: 'NEBOSH Accredited Learning Partner',
          category: 'professional-body',
          description:
            'Approved to deliver NEBOSH General Certificate and specialist qualifications.',
          icon: 'BadgeCheck',
        },
        {
          slug: 'cibse',
          name: 'CIBSE Affiliated Consultant',
          category: 'professional-body',
          description:
            'Building services engineering safety and compliance advisory alignment.',
          icon: 'Building2',
        },
      ],
    },
  ],
  cta: {
    title: 'Need certified consultancy support?',
    description:
      'Our accredited team is ready to discuss your compliance requirements.',
    buttonLabel: 'Contact Us',
    buttonHref: '/contact',
  },
} satisfies CorporatePageContent;
