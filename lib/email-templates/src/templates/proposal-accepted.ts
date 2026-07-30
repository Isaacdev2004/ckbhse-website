import { renderDetail, renderParagraph, templateLayoutOptions, withLayout } from '../layout.js';
import {
  EmailTemplateKey,
  type ProposalAcceptedData,
  type RenderedEmail,
} from '../types.js';

export function renderProposalAccepted(data: ProposalAcceptedData): RenderedEmail {
  const name = data.recipientName ?? 'there';
  const subject = `Proposal accepted — ${data.proposalTitle}`;
  const text = [
    `Hello ${name},`,
    '',
    `${data.leadName} has accepted the proposal: ${data.proposalTitle}.`,
    '',
    `View lead: ${data.portalUrl}`,
  ].join('\n');

  const bodyHtml = [
    renderParagraph(`Hello ${name},`),
    renderParagraph(
      `${data.leadName} has accepted the proposal: ${data.proposalTitle}.`,
    ),
    renderDetail('Proposal', data.proposalTitle),
  ].join('');

  return withLayout(subject, text, templateLayoutOptions(data, {
    title: 'Proposal accepted',
    preheader: `${data.leadName} accepted ${data.proposalTitle}.`,
    bodyHtml,
    cta: { label: 'View lead', href: data.portalUrl },
  }));
}

export const proposalAcceptedKey = EmailTemplateKey.ProposalAccepted;
