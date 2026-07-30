import { renderDetail, renderParagraph, templateLayoutOptions, withLayout } from '../layout.js';
import {
  EmailTemplateKey,
  type PublicEnquiryReceivedData,
  type RenderedEmail,
} from '../types.js';

export function renderPublicEnquiryReceived(
  data: PublicEnquiryReceivedData,
): RenderedEmail {
  const name = data.recipientName ?? 'there';
  const subject = 'We received your enquiry — CKBHSE';
  const text = [
    `Hello ${name},`,
    '',
    'Thank you for contacting CKBHSE. We have received your enquiry and a member of our team will respond shortly.',
    '',
    `Service interest: ${data.serviceInterest}`,
    '',
    'CKBHSE Limited',
  ].join('\n');

  const bodyHtml = [
    renderParagraph(`Hello ${name},`),
    renderParagraph(
      'Thank you for contacting CKBHSE. We have received your enquiry and a member of our team will respond shortly.',
    ),
    renderDetail('Service interest', data.serviceInterest),
  ].join('');

  return withLayout(subject, text, templateLayoutOptions(data, {
    title: 'Enquiry received',
    preheader: 'Your message is with our team.',
    bodyHtml,
  }));
}

export const publicEnquiryReceivedKey = EmailTemplateKey.PublicEnquiryReceived;
