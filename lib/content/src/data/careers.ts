import type { CareersPageContent } from '../schemas/pages.js';

export const careersPageData = {
  seo: {
    title: 'Careers | CKBHSE Limited',
    description:
      'Build a rewarding career in HSE consultancy. Work with industry experts, solve complex challenges, and make workplaces safer.',
  },
  hero: {
    title: 'Join Our Team',
    description:
      'Build a rewarding career in HSE consultancy. Work with industry experts, solve complex challenges, and make workplaces safer.',
  },
  benefitsHeading: {
    title: 'Why Work at CKBHSE?',
    description:
      'We invest in our people and create an environment where expertise, collaboration, and professional growth thrive.',
  },
  benefits: [
    {
      icon: 'Heart',
      title: 'Health & Wellbeing',
      description:
        'Comprehensive health insurance, mental health support, and wellbeing programs.',
    },
    {
      icon: 'TrendingUp',
      title: 'Career Development',
      description:
        'Professional development support, accreditation funding, and clear progression paths.',
    },
    {
      icon: 'GraduationCap',
      title: 'Learning & Training',
      description:
        'Access to industry training, conference attendance, and continuous learning opportunities.',
    },
    {
      icon: 'Users',
      title: 'Collaborative Culture',
      description:
        'Work with expert colleagues in a supportive, professional environment.',
    },
  ],
  positionsHeading: {
    title: 'Open Positions',
    description:
      'Explore current opportunities to join our growing consultancy team.',
  },
  positions: [
    {
      slug: 'senior-hse-consultant',
      title: 'Senior HSE Consultant',
      location: 'London / Hybrid',
      type: 'Full-time',
      salary: '£45,000 - £60,000',
      description:
        'Lead client consultancy projects across multiple sectors, conduct audits, deliver training, and support business development.',
      requirements: [
        'NEBOSH Diploma or equivalent',
        'Minimum 5 years HSE consultancy experience',
        'ISO 45001 lead auditor qualification preferred',
        'Strong client-facing and communication skills',
      ],
    },
    {
      slug: 'hse-consultant',
      title: 'HSE Consultant',
      location: 'Manchester / Hybrid',
      type: 'Full-time',
      salary: '£35,000 - £45,000',
      description:
        'Deliver consultancy services including risk assessments, audits, compliance advice, and training to clients across construction and manufacturing sectors.',
      requirements: [
        'NEBOSH General Certificate minimum',
        '2-4 years HSE experience',
        'Experience in construction or manufacturing preferred',
        'Full UK driving licence',
      ],
    },
    {
      slug: 'training-consultant',
      title: 'Training Consultant',
      location: 'Birmingham / Hybrid',
      type: 'Full-time',
      salary: '£32,000 - £42,000',
      description:
        'Deliver accredited health and safety training courses (IOSH, NEBOSH, and specialist programs) to corporate clients.',
      requirements: [
        'NEBOSH qualification and relevant teaching certifications',
        'Proven training delivery experience',
        'Ability to engage diverse audiences',
        'Willingness to travel to client sites',
      ],
    },
    {
      slug: 'graduate-consultant',
      title: 'Graduate HSE Consultant',
      location: 'London',
      type: 'Full-time',
      salary: '£26,000 - £30,000',
      description:
        'Join our team as a graduate consultant and develop your HSE expertise through structured mentoring, client projects, and professional qualifications.',
      requirements: [
        'Degree in relevant field (Health & Safety, Environmental Science, Engineering)',
        'NEBOSH General Certificate desirable',
        'Strong analytical and communication skills',
        'Eagerness to learn and develop professionally',
      ],
    },
  ],
  generalApplicationCta: {
    title: "Don't See the Right Role?",
    description:
      "We're always interested in hearing from talented HSE professionals. Submit a general application and we'll keep you in mind for future opportunities.",
  },
} satisfies CareersPageContent;
