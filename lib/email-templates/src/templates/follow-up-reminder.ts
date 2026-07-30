import { renderDetail, renderParagraph, templateLayoutOptions, withLayout } from '../layout.js';
import {
  EmailTemplateKey,
  type FollowUpReminderData,
  type RenderedEmail,
} from '../types.js';

export function renderFollowUpReminder(data: FollowUpReminderData): RenderedEmail {
  const name = data.recipientName ?? 'there';
  const subject = `Follow-up reminder — ${data.leadName}`;
  const notesLine =
    data.notes === undefined || data.notes.trim() === ''
      ? ''
      : `\nNotes: ${data.notes}`;
  const text = [
    `Hello ${name},`,
    '',
    `This is a reminder to follow up with ${data.leadName} by ${data.dueAt}.${notesLine}`,
    '',
    `View lead: ${data.portalUrl}`,
  ].join('\n');

  const bodyHtml = [
    renderParagraph(`Hello ${name},`),
    renderParagraph(
      `This is a reminder to follow up with ${data.leadName} by ${data.dueAt}.`,
    ),
    ...(data.notes === undefined || data.notes.trim() === ''
      ? []
      : [renderDetail('Notes', data.notes)]),
  ].join('');

  return withLayout(subject, text, templateLayoutOptions(data, {
    title: 'Follow-up reminder',
    preheader: `Follow up with ${data.leadName} by ${data.dueAt}.`,
    bodyHtml,
    cta: { label: 'View lead', href: data.portalUrl },
  }));
}

export const followUpReminderKey = EmailTemplateKey.FollowUpReminder;
