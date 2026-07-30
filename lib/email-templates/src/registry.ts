import { renderConsultationConfirmed } from './templates/consultation-confirmed.js';
import { renderFollowUpReminder } from './templates/follow-up-reminder.js';
import { renderInternalNewEnquiry } from './templates/internal-new-enquiry.js';
import { renderLeadAssigned } from './templates/lead-assigned.js';
import { renderLeadStatusChanged } from './templates/lead-status-changed.js';
import { renderProposalAccepted } from './templates/proposal-accepted.js';
import { renderProposalSent } from './templates/proposal-sent.js';
import { renderPublicEnquiryReceived } from './templates/public-enquiry-received.js';
import {
  EmailTemplateKey,
  type RenderedEmail,
  type TemplateRenderInput,
} from './types.js';

const TEMPLATE_REGISTRY = {
  [EmailTemplateKey.PublicEnquiryReceived]: renderPublicEnquiryReceived,
  [EmailTemplateKey.InternalNewEnquiry]: renderInternalNewEnquiry,
  [EmailTemplateKey.LeadAssigned]: renderLeadAssigned,
  [EmailTemplateKey.LeadStatusChanged]: renderLeadStatusChanged,
  [EmailTemplateKey.FollowUpReminder]: renderFollowUpReminder,
  [EmailTemplateKey.ConsultationConfirmed]: renderConsultationConfirmed,
  [EmailTemplateKey.ProposalSent]: renderProposalSent,
  [EmailTemplateKey.ProposalAccepted]: renderProposalAccepted,
} as const;

export function getTemplate<K extends EmailTemplateKey>(
  key: K,
): (typeof TEMPLATE_REGISTRY)[K] {
  return TEMPLATE_REGISTRY[key];
}

export function renderTemplate(input: TemplateRenderInput): RenderedEmail {
  switch (input.key) {
    case EmailTemplateKey.PublicEnquiryReceived:
      return renderPublicEnquiryReceived(input.data);
    case EmailTemplateKey.InternalNewEnquiry:
      return renderInternalNewEnquiry(input.data);
    case EmailTemplateKey.LeadAssigned:
      return renderLeadAssigned(input.data);
    case EmailTemplateKey.LeadStatusChanged:
      return renderLeadStatusChanged(input.data);
    case EmailTemplateKey.FollowUpReminder:
      return renderFollowUpReminder(input.data);
    case EmailTemplateKey.ConsultationConfirmed:
      return renderConsultationConfirmed(input.data);
    case EmailTemplateKey.ProposalSent:
      return renderProposalSent(input.data);
    case EmailTemplateKey.ProposalAccepted:
      return renderProposalAccepted(input.data);
  }
}

export const templateKeys = Object.values(EmailTemplateKey);
