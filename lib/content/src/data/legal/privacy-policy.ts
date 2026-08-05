import type { LegalPageContent } from '../../schemas/legal.js';

export const privacyPolicyData = {
  seo: {
    title: 'Privacy Policy | CKBHSE Limited',
    description:
      'How CKBHSE Limited collects, uses, and protects your personal data under UK GDPR.',
  },
  title: 'Privacy Policy',
  lastUpdated: '30 July 2026',
  intro:
    'CKBHSE Limited ("we", "us", "our") is committed to protecting your privacy. This policy explains how we collect, use, store, and share personal data when you visit our website, contact us, or use our consultancy and training services.',
  sections: [
    {
      title: 'Who we are',
      paragraphs: [
        'CKBHSE Limited is a health, safety, environment, and quality (HSEQ) consultancy registered in England and Wales. We provide consultancy, training, and compliance support to organisations across the United Kingdom.',
        'For data protection purposes, CKBHSE Limited (Company No. 17378677) is the data controller. You can contact us at info@ckbhse.co.uk or by post at our registered office: 11 Henley Street, Mataab Business Centre, Birmingham, England, B11 1JB.',
      ],
    },
    {
      title: 'What data we collect',
      paragraphs: [
        'The personal data we collect depends on how you interact with us. We may collect:',
      ],
      items: [
        'Identity and contact details (name, job title, company, email address, telephone number, postal address)',
        'Enquiry and correspondence content (messages you send via contact forms, email, or phone)',
        'Account and portal credentials for staff, client, and learning portals (where applicable)',
        'Technical data (IP address, browser type, device information, and cookies — see our Cookie Policy)',
        'Training and consultancy records (attendance, certificates, assessment outcomes, and project documentation where you are named)',
      ],
    },
    {
      title: 'How we use your data',
      paragraphs: [
        'We use personal data to respond to enquiries, deliver services, manage client relationships, provide training, issue certificates, maintain legal and regulatory records, improve our website, and meet our contractual and legal obligations.',
        'Our lawful bases under UK GDPR include: performance of a contract, legitimate interests (such as operating our business and responding to enquiries), legal obligation, and consent where required (for example, non-essential cookies or marketing communications).',
      ],
    },
    {
      title: 'Sharing your data',
      paragraphs: [
        'We do not sell your personal data. We may share data with trusted processors who help us operate our business — for example, email delivery, cloud hosting, learning platforms, and payment providers. All processors are bound by contract to protect your data.',
        'We may also disclose data where required by law, regulation, court order, or to protect the rights, property, or safety of CKBHSE Limited, our clients, or others.',
      ],
    },
    {
      title: 'International transfers',
      paragraphs: [
        'We primarily store and process data within the United Kingdom and European Economic Area. Where data is transferred outside the UK, we ensure appropriate safeguards are in place, such as UK International Data Transfer Agreements or adequacy regulations.',
      ],
    },
    {
      title: 'Retention',
      paragraphs: [
        'We retain personal data only for as long as necessary for the purposes described in this policy, including to satisfy legal, accounting, and regulatory requirements. Retention periods vary by data type — for example, client project records may be kept for several years in line with industry practice and statutory limitation periods.',
      ],
    },
    {
      title: 'Your rights',
      paragraphs: [
        'Under UK GDPR, you have the right to access, rectify, erase, restrict processing, object to processing, and data portability in certain circumstances. You also have the right to withdraw consent where processing is based on consent.',
        'To exercise your rights, contact us at info@ckbhse.co.uk. You may also lodge a complaint with the Information Commissioner\'s Office (ICO) at ico.org.uk.',
      ],
    },
    {
      title: 'Security',
      paragraphs: [
        'We implement appropriate technical and organisational measures to protect personal data against unauthorised access, alteration, disclosure, or destruction. No method of transmission over the internet is completely secure; we encourage you to use strong passwords and protect your account credentials.',
      ],
    },
    {
      title: 'Changes to this policy',
      paragraphs: [
        'We may update this Privacy Policy from time to time. The "Last updated" date at the top of this page indicates when it was last revised. Material changes will be communicated where appropriate.',
      ],
    },
  ],
} satisfies LegalPageContent;
