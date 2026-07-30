import { renderDetail, renderParagraph, templateLayoutOptions, withLayout } from '../layout.js';
import {
  EmailTemplateKey,
  type InternalNewEnquiryData,
  type RenderedEmail,
} from '../types.js';

export function renderInternalNewEnquiry(data: InternalNewEnquiryData): RenderedEmail {
  const subject = `New website enquiry — ${data.contactName}`;
  const text = [
    'A new contact enquiry has been submitted on the public website.',
    '',
    `Name: ${data.contactName}`,
    `Email: ${data.email}`,
    `Service interest: ${data.serviceInterest}`,
    '',
    'Message:',
    data.message,
    '',
    `Review in portal: ${data.portalUrl}`,
  ].join('\n');

  const bodyHtml = [
    renderParagraph('A new contact enquiry has been submitted on the public website.'),
    renderDetail('Name', data.contactName),
    renderDetail('Email', data.email),
    renderDetail('Service interest', data.serviceInterest),
    renderParagraph(`Message: ${data.message}`),
  ].join('');

  return withLayout(subject, text, templateLayoutOptions(data, {
    title: 'New website enquiry',
    preheader: `${data.contactName} submitted an enquiry.`,
    bodyHtml,
    cta: { label: 'Open in CRM', href: data.portalUrl },
  }));
}

export const internalNewEnquiryKey = EmailTemplateKey.InternalNewEnquiry;
