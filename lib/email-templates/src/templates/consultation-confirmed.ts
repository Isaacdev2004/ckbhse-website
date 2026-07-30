import { renderDetail, renderParagraph, templateLayoutOptions, withLayout } from '../layout.js';
import {
  EmailTemplateKey,
  type ConsultationConfirmedData,
  type RenderedEmail,
} from '../types.js';

export function renderConsultationConfirmed(
  data: ConsultationConfirmedData,
): RenderedEmail {
  const name = data.recipientName ?? 'there';
  const subject = 'Your consultation is confirmed — CKBHSE';
  const text = [
    `Hello ${name},`,
    '',
    'Your consultation with CKBHSE has been confirmed.',
    '',
    `Date: ${data.consultationDate}`,
    `Time: ${data.consultationTime}`,
    `Location: ${data.location}`,
    `Consultant: ${data.consultantName}`,
  ].join('\n');

  const bodyHtml = [
    renderParagraph(`Hello ${name},`),
    renderParagraph('Your consultation with CKBHSE has been confirmed.'),
    renderDetail('Date', data.consultationDate),
    renderDetail('Time', data.consultationTime),
    renderDetail('Location', data.location),
    renderDetail('Consultant', data.consultantName),
  ].join('');

  return withLayout(subject, text, templateLayoutOptions(data, {
    title: 'Consultation confirmed',
    preheader: `${data.consultationDate} at ${data.consultationTime}.`,
    bodyHtml,
  }));
}

export const consultationConfirmedKey = EmailTemplateKey.ConsultationConfirmed;
