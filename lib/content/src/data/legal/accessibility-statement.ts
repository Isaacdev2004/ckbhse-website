import type { LegalPageContent } from '../../schemas/legal.js';

export const accessibilityStatementData = {
  seo: {
    title: 'Accessibility Statement | CKBHSE Limited',
    description:
      'CKBHSE Limited accessibility statement — our commitment to WCAG 2.2 AA conformance.',
  },
  title: 'Accessibility Statement',
  lastUpdated: '30 July 2026',
  intro:
    'CKBHSE Limited is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards.',
  sections: [
    {
      title: 'Conformance target',
      paragraphs: [
        'We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.2 at Level AA. These guidelines explain how to make web content more accessible to people with disabilities, including visual, auditory, physical, speech, cognitive, and neurological disabilities.',
      ],
    },
    {
      title: 'Current status',
      paragraphs: [
        'This website is partially conformant with WCAG 2.2 Level AA. "Partially conformant" means that some parts of the content do not yet fully conform to the accessibility standard. We are actively working to close identified gaps.',
      ],
    },
    {
      title: 'Assessment method',
      paragraphs: [
        'We assess accessibility through a combination of:',
      ],
      items: [
        'Automated testing with axe-core in our continuous integration pipeline',
        'Manual keyboard-only navigation reviews for primary user journeys',
        'Semantic HTML and ARIA review during development',
        'Periodic review against WCAG 2.2 AA success criteria',
      ],
    },
    {
      title: 'Known limitations',
      paragraphs: [
        'We are aware of the following limitations and are working to address them:',
      ],
      items: [
        'Some marketing imagery may lack descriptive alternative text while assets are being finalised — target remediation: Q3 2026',
        'HTML sitemap and FAQ pages are not yet published — footer links remain disabled until launch',
        'Third-party embedded content (such as maps) may not fully meet WCAG standards — we provide text alternatives where practicable',
      ],
    },
    {
      title: 'Technical specifications',
      paragraphs: [
        'Accessibility relies on the following technologies working with your web browser and assistive technologies:',
      ],
      items: ['HTML', 'WAI-ARIA', 'CSS', 'JavaScript'],
    },
    {
      title: 'Compatibility',
      paragraphs: [
        'This website is designed to be compatible with recent versions of major browsers (Chrome, Firefox, Safari, Edge) and common assistive technologies including screen readers and voice control software. Older browsers may not support all features.',
      ],
    },
    {
      title: 'Feedback and contact',
      paragraphs: [
        'We welcome your feedback on the accessibility of this website. If you encounter a barrier or need content in an alternative format, please contact us:',
      ],
      items: [
        'Email: info@ckbhse.co.uk',
        'Phone: +44 20 1234 5678',
        'Post: CKBHSE Limited, 11 Henley Street, Mataab Business Centre, Birmingham, England, B11 1JB',
      ],
    },
    {
      title: 'Response time',
      paragraphs: [
        'We aim to acknowledge accessibility feedback within two working days and provide a substantive response or remediation plan within ten working days. Complex issues may require longer; we will keep you informed of progress.',
      ],
    },
    {
      title: 'Enforcement procedure',
      paragraphs: [
        'If you are not satisfied with our response, you may contact the Equality Advisory and Support Service (EASS) or, for public sector clients, the Equality and Human Rights Commission (EHRC).',
      ],
    },
    {
      title: 'Review schedule',
      paragraphs: [
        'This statement was last reviewed on 30 July 2026. It is reviewed at least annually and whenever we make significant changes to the website or our portals.',
      ],
    },
  ],
} satisfies LegalPageContent;
