import type { FaqPageContent } from '../schemas/pages.js';

export const faqPageData = {
  seo: {
    title: 'Frequently Asked Questions | CKBHSE Limited',
    description:
      'Answers to common questions about CKBHSE Limited HSE consultancy services, industries, audits, DSEAR, training, ISO support and how to get started.',
  },
  hero: {
    badge: 'FAQ',
    title: 'Frequently Asked Questions',
    description:
      'Clear answers about our Health, Safety and Environment consultancy services, how we work, and how to get started with CKBHSE.',
  },
  faqs: [
    {
      question: 'What services does CKBHSE provide?',
      answer:
        'CKBHSE provides specialist Health, Safety and Environment (HSE) consultancy, including HSE audits and inspections, risk assessments, DSEAR support, incident investigation, contractor management, environmental compliance, management systems, training and ongoing HSE advisory support. Services can be tailored to individual projects or provided on a retained basis.',
    },
    {
      question: 'What industries do you work with?',
      answer:
        'We support organisations across a range of sectors, including manufacturing, engineering, construction, logistics, energy, facilities management and healthcare. Our approach is tailored to the regulatory requirements, operational risks and working environment of each client.',
    },
    {
      question: 'Do you work with businesses of all sizes?',
      answer:
        'Yes. CKBHSE can support organisations ranging from SMEs requiring access to competent HSE advice to larger organisations needing specialist expertise, additional resource or support with complex HSE projects.',
    },
    {
      question: 'Can CKBHSE act as our competent Health and Safety adviser?',
      answer:
        'Yes, subject to the scope and requirements of your organisation. We can provide competent health and safety support to help businesses understand their legal obligations, manage workplace risks and maintain appropriate HSE arrangements.',
    },
    {
      question:
        'Can you provide ongoing HSE support rather than a one-off consultancy project?',
      answer:
        'Yes. We offer both project-based consultancy and retained HSE support. A retained arrangement can provide ongoing access to professional HSE advice without the cost of employing a full-time in-house specialist.',
    },
    {
      question: 'Can you carry out an HSE audit or compliance review of our business?',
      answer:
        'Yes. We can undertake independent audits and compliance reviews to identify gaps, areas of good practice and opportunities for improvement. Findings can be presented with prioritised, practical recommendations to help your organisation address identified risks.',
    },
    {
      question: 'Do you provide DSEAR assessments and support?',
      answer:
        'Yes. CKBHSE can support organisations in assessing risks associated with dangerous substances and explosive atmospheres, reviewing existing DSEAR arrangements and identifying appropriate control measures to support compliance.',
    },
    {
      question: 'Can you help us prepare for an HSE inspection?',
      answer:
        'Yes. We can review your existing arrangements, documentation and workplace practices, identify potential compliance gaps and help your organisation prepare for regulatory scrutiny. We can also provide support following an inspection where corrective actions or improvements are required.',
    },
    {
      question: 'Can you investigate workplace accidents and incidents?',
      answer:
        'Yes. We provide independent incident investigation support to help organisations establish immediate and underlying causes, identify corrective actions and reduce the likelihood of recurrence. Support can also include reviewing RIDDOR considerations and existing investigation processes.',
    },
    {
      question: 'Can you help with ISO 45001 and ISO 14001?',
      answer:
        'Yes. CKBHSE can support organisations developing, implementing or improving occupational health and safety and environmental management systems aligned with ISO 45001 and ISO 14001. This can include gap analysis, documentation review, implementation support and audit preparation.',
    },
    {
      question: 'Do you provide HSE training?',
      answer:
        'Yes. We provide practical HSE training tailored to organisational and workforce requirements. Training can be developed around specific workplace risks, management responsibilities and areas where additional competence or awareness is required.',
    },
    {
      question: 'Do you provide environmental compliance support?',
      answer:
        'Yes. Our environmental support can help organisations understand and manage their environmental responsibilities, identify compliance risks and strengthen environmental management arrangements.',
    },
    {
      question: 'Can you review our existing HSE policies and procedures?',
      answer:
        'Yes. We can review existing policies, procedures, risk assessments and management arrangements to determine whether they remain suitable, proportionate and aligned with applicable UK legislation and recognised good practice.',
    },
    {
      question: "Can you support us if we don't have an internal HSE team?",
      answer:
        "Yes. Many organisations do not require a full-time HSE professional but still need access to competent advice. CKBHSE can provide flexible support based on your organisation's size, risk profile and operational requirements.",
    },
    {
      question: 'Can you work alongside our existing HSE team?',
      answer:
        'Yes. We can provide additional capacity or specialist expertise to complement an existing internal HSE function, including support with audits, investigations, compliance projects, DSEAR, management systems and periods of increased workload.',
    },
    {
      question: 'Do you provide services across the UK?',
      answer:
        'Yes. CKBHSE supports organisations across the UK. Depending on the nature of the work, services can be delivered on-site, remotely or through a combination of both.',
    },
    {
      question: 'How much does HSE consultancy cost?',
      answer:
        'Costs depend on the scope, complexity, location and duration of the work required. Following an initial discussion, we can define the scope of support and provide a clear quotation before work begins.',
    },
    {
      question: 'How do we get started?',
      answer:
        'Contact CKBHSE to discuss your requirements. We will arrange an initial conversation to understand your organisation, the issue you need support with and the desired outcome. We can then recommend an appropriate scope of work and provide a proposal or quotation.',
    },
  ],
  cta: {
    title: 'Still have a question?',
    description:
      'Speak with our team about your HSE requirements. We will help you define the right scope of support.',
    buttonLabel: 'Contact Us',
    buttonHref: '/contact',
  },
} satisfies FaqPageContent;
