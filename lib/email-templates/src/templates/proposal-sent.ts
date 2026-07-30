import { renderDetail, renderParagraph, templateLayoutOptions, withLayout } from '../layout.js';
import {
  EmailTemplateKey,
  type ProposalSentData,
  type RenderedEmail,
} from '../types.js';

export function renderProposalSent(data: ProposalSentData): RenderedEmail {
  const name = data.recipientName ?? 'there';
  const subject = `Proposal ready for review — ${data.proposalTitle}`;
  const text = [
    `Hello ${name},`,
    '',
    `We have prepared a proposal for ${data.leadName}: ${data.proposalTitle}.`,
    '',
    `Review proposal: ${data.portalUrl}`,
  ].join('\n');

  const bodyHtml = [
    renderParagraph(`Hello ${name},`),
    renderParagraph(
      `We have prepared a proposal for ${data.leadName}: ${data.proposalTitle}.`,
    ),
    renderDetail('Proposal', data.proposalTitle),
  ].join('');

  return withLayout(subject, text, templateLayoutOptions(data, {
    title: 'Proposal ready for review',
    preheader: `${data.proposalTitle} is available to review.`,
    bodyHtml,
    cta: { label: 'Review proposal', href: data.portalUrl },
  }));
}

export const proposalSentKey = EmailTemplateKey.ProposalSent;
