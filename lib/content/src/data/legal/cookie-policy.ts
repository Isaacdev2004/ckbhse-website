import type { LegalPageContent } from '../../schemas/legal.js';

export const cookiePolicyData = {
  seo: {
    title: 'Cookie Policy | CKBHSE Limited',
    description:
      'Information about cookies and similar technologies used on the CKBHSE Limited website.',
  },
  title: 'Cookie Policy',
  lastUpdated: '30 July 2026',
  intro:
    'This Cookie Policy explains how CKBHSE Limited uses cookies and similar technologies when you visit our website. It should be read alongside our Privacy Policy.',
  sections: [
    {
      title: 'What are cookies?',
      paragraphs: [
        'Cookies are small text files placed on your device when you visit a website. They help websites function, remember preferences, and understand how visitors use the site. Similar technologies include local storage and session storage.',
      ],
    },
    {
      title: 'How we use cookies',
      paragraphs: [
        'We use cookies to operate the website, maintain security, remember preferences, and understand usage so we can improve content and performance. We group cookies as follows:',
      ],
      items: [
        'Strictly necessary — required for core site functionality, security, and load balancing. These cannot be switched off.',
        'Functional — remember choices such as cookie consent and accessibility preferences.',
        'Analytics — help us understand how visitors use the site (aggregated, anonymised where possible).',
        'Marketing — used only if we run campaigns and you have given consent.',
      ],
    },
    {
      title: 'Cookies we may use',
      paragraphs: [
        'The specific cookies in use may change as we develop the site. Typical examples include:',
      ],
      items: [
        'Session cookies — maintain your session while browsing',
        'Consent cookies — record your cookie preferences',
        'Analytics cookies — measure page views and navigation patterns (only with consent where required)',
      ],
    },
    {
      title: 'Managing cookies',
      paragraphs: [
        'When you first visit our site, you can accept or reject non-essential cookies through our consent banner. You can also control cookies through your browser settings — most browsers allow you to block or delete cookies.',
        'Blocking strictly necessary cookies may affect site functionality. For guidance on managing cookies, visit allaboutcookies.org or your browser\'s help pages.',
      ],
    },
    {
      title: 'Third-party cookies',
      paragraphs: [
        'Some embedded content or analytics tools may set third-party cookies. We aim to use reputable providers and limit data collection to what is necessary. Third-party services are subject to their own privacy and cookie policies.',
      ],
    },
    {
      title: 'Updates',
      paragraphs: [
        'We may update this Cookie Policy to reflect changes in technology, regulation, or our practices. Please check the "Last updated" date above for the latest version.',
      ],
    },
    {
      title: 'Contact',
      paragraphs: [
        'If you have questions about our use of cookies, contact us at info@ckbhse.co.uk.',
      ],
    },
  ],
} satisfies LegalPageContent;
