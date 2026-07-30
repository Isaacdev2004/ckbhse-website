import { renderDetail, renderParagraph, templateLayoutOptions, withLayout } from '../layout.js';
import {
  EmailTemplateKey,
  type LeadStatusChangedData,
  type RenderedEmail,
} from '../types.js';

export function renderLeadStatusChanged(
  data: LeadStatusChangedData,
): RenderedEmail {
  const name = data.recipientName ?? 'there';
  const subject = `Lead status updated — ${data.leadName}`;
  const text = [
    `Hello ${name},`,
    '',
    `The status for ${data.leadName} has changed from ${data.previousStatus} to ${data.newStatus}.`,
    '',
    `View lead: ${data.portalUrl}`,
  ].join('\n');

  const bodyHtml = [
    renderParagraph(`Hello ${name},`),
    renderParagraph(
      `The status for ${data.leadName} has changed from ${data.previousStatus} to ${data.newStatus}.`,
    ),
    renderDetail('Previous status', data.previousStatus),
    renderDetail('New status', data.newStatus),
  ].join('');

  return withLayout(subject, text, templateLayoutOptions(data, {
    title: 'Lead status updated',
    preheader: `${data.leadName} is now ${data.newStatus}.`,
    bodyHtml,
    cta: { label: 'View lead', href: data.portalUrl },
  }));
}

export const leadStatusChangedKey = EmailTemplateKey.LeadStatusChanged;
