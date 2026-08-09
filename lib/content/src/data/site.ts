import type { SiteConfig } from '../schemas/pages.js';

export const siteConfigData = {
  brand: {
    name: 'CKBHSE Limited',
    tagline: 'Safer workplaces. Stronger compliance. Better business.',
    description:
      'Independent HSE consultancy providing specialist advisory, training and assurance services across the UK.',
  },
  contact: {
    email: 'info@ckbhse.co.uk',
    phone: '01902 908593',
    phoneHref: 'tel:+441902908593',
    location:
      '11 Henley Street, Mataab Business Centre, Birmingham, England, B11 1JB',
  },
  cta: {
    label: 'Book Consultation',
    href: '/contact',
  },
  navigation: [
    {
      id: 'services',
      label: 'Services',
      href: '/services',
      children: [
        { label: 'All Services', href: '/services', available: true },
        {
          label: 'Health & Safety Audits',
          href: '/services/health-safety/health-safety-audits',
          available: true,
        },
        {
          label: 'Risk Assessments',
          href: '/services/health-safety/risk-assessments',
          available: true,
        },
        {
          label: 'ISO Certification',
          href: '/services/iso-management/gap-analysis',
          available: true,
        },
        {
          label: 'Fire Risk Assessments',
          href: '/services/health-safety/fire-risk-assessments',
          available: true,
        },
      ],
    },
    {
      id: 'industries',
      label: 'Industries',
      href: '/industries',
      children: [
        { label: 'All Industries', href: '/industries', available: true },
        {
          label: 'Construction',
          href: '/industries/construction',
          available: true,
        },
        {
          label: 'Manufacturing',
          href: '/industries/manufacturing',
          available: true,
        },
        {
          label: 'Logistics & Transport',
          href: '/industries/logistics',
          available: true,
        },
        { label: 'Oil & Gas', href: '/industries/oil-gas', available: true },
        {
          label: 'Healthcare',
          href: '/industries/healthcare',
          available: true,
        },
      ],
    },
    {
      id: 'training',
      label: 'Training',
      href: '/training',
      children: [
        { label: 'Course Catalogue', href: '/training', available: true },
        {
          label: 'IOSH Managing Safely',
          href: '/training/health-safety/iosh-managing-safely',
          available: true,
        },
        {
          label: 'NEBOSH General Certificate',
          href: '/training/health-safety/nebosh-general-certificate',
          available: true,
        },
        {
          label: 'Fire Warden Training',
          href: '/training/health-safety/fire-warden',
          available: true,
        },
      ],
    },
    {
      id: 'resources',
      label: 'Resources',
      href: '/resources',
      children: [
        { label: 'Knowledge Centre', href: '/resources', available: true },
        { label: 'Case Studies', href: '/case-studies', available: true },
        { label: 'Testimonials', href: '/testimonials', available: true },
        { label: 'Client Success', href: '/client-success', available: true },
        { label: 'Guides', href: '/resources?type=guides', available: true },
        {
          label: 'Downloads',
          href: '/resources?type=templates',
          available: true,
        },
        { label: 'Blog', href: '/blog', available: false },
      ],
    },
    {
      id: 'about',
      label: 'About',
      href: '/about',
      children: [
        { label: 'About CKBHSE', href: '/about', available: true },
        { label: 'Mission', href: '/about/mission', available: true },
        { label: 'Vision', href: '/about/vision', available: true },
        { label: 'Core Values', href: '/about/values', available: true },
        { label: 'Leadership', href: '/about/leadership', available: true },
        {
          label: 'Why Choose CKBHSE',
          href: '/about/why-choose-us',
          available: true,
        },
        {
          label: 'Accreditations',
          href: '/about/accreditations',
          available: true,
        },
        { label: 'Partners', href: '/about/partners', available: true },
        {
          label: 'Corporate Governance',
          href: '/about/governance',
          available: true,
        },
        {
          label: 'Sustainability & ESG',
          href: '/about/sustainability',
          available: true,
        },
        {
          label: 'Health & Safety Commitment',
          href: '/about/health-safety-commitment',
          available: true,
        },
        { label: 'Offices', href: '/about/offices', available: false },
      ],
    },
    {
      id: 'company',
      label: 'Company',
      href: '/contact',
      children: [
        { label: 'Careers', href: '/careers', available: true },
        { label: 'Contact Us', href: '/contact', available: true },
        { label: 'Offices', href: '/about/offices', available: false },
      ],
    },
  ],
  footer: {
    sections: [
      {
        id: 'services',
        title: 'Services',
        links: [
          {
            label: 'Health & Safety Audits',
            href: '/services/health-safety/health-safety-audits',
            available: true,
          },
          {
            label: 'Risk Assessments',
            href: '/services/health-safety/risk-assessments',
            available: true,
          },
          {
            label: 'ISO Certification',
            href: '/services/iso-management/gap-analysis',
            available: true,
          },
          {
            label: 'Fire Risk Assessments',
            href: '/services/health-safety/fire-risk-assessments',
            available: true,
          },
          {
            label: 'Environmental Management',
            href: '/services/environmental/environmental-compliance',
            available: true,
          },
        ],
      },
      {
        id: 'industries',
        title: 'Industries',
        links: [
          {
            label: 'Construction',
            href: '/industries/construction',
            available: true,
          },
          {
            label: 'Manufacturing',
            href: '/industries/manufacturing',
            available: true,
          },
          {
            label: 'Logistics & Transport',
            href: '/industries/logistics',
            available: true,
          },
          { label: 'Oil & Gas', href: '/industries/oil-gas', available: true },
          {
            label: 'Healthcare',
            href: '/industries/healthcare',
            available: true,
          },
        ],
      },
      {
        id: 'resources',
        title: 'Resources',
        links: [
          { label: 'Knowledge Centre', href: '/resources', available: true },
          { label: 'Case Studies', href: '/case-studies', available: true },
          { label: 'Testimonials', href: '/testimonials', available: true },
          { label: 'Client Success', href: '/client-success', available: true },
          { label: 'HTML Sitemap', href: '/sitemap', available: false },
        ],
      },
      {
        id: 'company',
        title: 'Company',
        links: [
          { label: 'About CKBHSE', href: '/about', available: true },
          { label: 'Careers', href: '/careers', available: true },
          { label: 'Contact Us', href: '/contact', available: true },
        ],
      },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy-policy', available: true },
      {
        label: 'Terms & Conditions',
        href: '/terms-conditions',
        available: true,
      },
      { label: 'Cookie Policy', href: '/cookie-policy', available: true },
      {
        label: 'Accessibility Statement',
        href: '/legal/accessibility',
        available: true,
      },
    ],
    utility: [
      { label: 'HTML Sitemap', href: '/sitemap', available: false },
      { label: 'FAQ', href: '/faq', available: false },
    ],
    accreditations: [],
    social: [
      {
        platform: 'linkedin',
        href: 'https://linkedin.com',
        label: 'LinkedIn',
      },
      {
        platform: 'twitter',
        href: 'https://twitter.com',
        label: 'Twitter',
      },
      {
        platform: 'facebook',
        href: 'https://facebook.com',
        label: 'Facebook',
      },
    ],
  },
} satisfies SiteConfig;
