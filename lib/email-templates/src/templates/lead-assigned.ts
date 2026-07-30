import { renderDetail, renderParagraph, templateLayoutOptions, withLayout } from '../layout.js';
import {
  EmailTemplateKey,
  type LeadAssignedData,
  type RenderedEmail,
} from '../types.js';

export function renderLeadAssigned(data: LeadAssignedData): RenderedEmail {
  const name = data.recipientName ?? 'there';
  const subject = `Lead assigned to you — ${data.leadName}`;
  const text = [
    `Hello ${name},`,
    '',
    `You have been assigned a new lead: ${data.leadName}.`,
    '',
    `Service interest: ${data.serviceInterest}`,
    '',
    `View lead: ${data.portalUrl}`,
  ].join('\n');

  const bodyHtml = [
    renderParagraph(`Hello ${name},`),
    renderParagraph(`You have been assigned a new lead: ${data.leadName}.`),
    renderDetail('Service interest', data.serviceInterest),
  ].join('');

  return withLayout(subject, text, templateLayoutOptions(data, {
    title: 'Lead assigned',
    preheader: `${data.leadName} is now assigned to you.`,
    bodyHtml,
    cta: { label: 'View lead', href: data.portalUrl },
  }));
}

export const leadAssignedKey = EmailTemplateKey.LeadAssigned;
