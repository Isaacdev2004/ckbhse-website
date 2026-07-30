export enum EmailTemplateKey {
  PublicEnquiryReceived = 'public_enquiry_received',
  InternalNewEnquiry = 'internal_new_enquiry',
  LeadAssigned = 'lead_assigned',
  LeadStatusChanged = 'lead_status_changed',
  FollowUpReminder = 'follow_up_reminder',
  ConsultationConfirmed = 'consultation_confirmed',
  ProposalSent = 'proposal_sent',
  ProposalAccepted = 'proposal_accepted',
}

export interface RenderedEmail {
  readonly subject: string;
  readonly text: string;
  readonly html: string;
}

export interface EmailLayoutLabels {
  readonly footerNotice: string;
  readonly viewOnline: string;
  readonly contactSupport: string;
}

export interface BaseTemplateData {
  readonly locale?: string;
  readonly recipientName?: string;
}

export interface PublicEnquiryReceivedData extends BaseTemplateData {
  readonly serviceInterest: string;
}

export interface InternalNewEnquiryData extends BaseTemplateData {
  readonly contactName: string;
  readonly email: string;
  readonly serviceInterest: string;
  readonly message: string;
  readonly portalUrl: string;
}

export interface LeadAssignedData extends BaseTemplateData {
  readonly leadName: string;
  readonly serviceInterest: string;
  readonly portalUrl: string;
}

export interface LeadStatusChangedData extends BaseTemplateData {
  readonly leadName: string;
  readonly previousStatus: string;
  readonly newStatus: string;
  readonly portalUrl: string;
}

export interface FollowUpReminderData extends BaseTemplateData {
  readonly leadName: string;
  readonly dueAt: string;
  readonly notes?: string;
  readonly portalUrl: string;
}

export interface ConsultationConfirmedData extends BaseTemplateData {
  readonly consultationDate: string;
  readonly consultationTime: string;
  readonly location: string;
  readonly consultantName: string;
}

export interface ProposalSentData extends BaseTemplateData {
  readonly leadName: string;
  readonly proposalTitle: string;
  readonly portalUrl: string;
}

export interface ProposalAcceptedData extends BaseTemplateData {
  readonly leadName: string;
  readonly proposalTitle: string;
  readonly portalUrl: string;
}

export type TemplateRenderInput =
  | { readonly key: EmailTemplateKey.PublicEnquiryReceived; readonly data: PublicEnquiryReceivedData }
  | { readonly key: EmailTemplateKey.InternalNewEnquiry; readonly data: InternalNewEnquiryData }
  | { readonly key: EmailTemplateKey.LeadAssigned; readonly data: LeadAssignedData }
  | { readonly key: EmailTemplateKey.LeadStatusChanged; readonly data: LeadStatusChangedData }
  | { readonly key: EmailTemplateKey.FollowUpReminder; readonly data: FollowUpReminderData }
  | { readonly key: EmailTemplateKey.ConsultationConfirmed; readonly data: ConsultationConfirmedData }
  | { readonly key: EmailTemplateKey.ProposalSent; readonly data: ProposalSentData }
  | { readonly key: EmailTemplateKey.ProposalAccepted; readonly data: ProposalAcceptedData };

export type TemplateRenderer<TData extends BaseTemplateData> = (
  data: TData,
) => RenderedEmail;

export const DEFAULT_LAYOUT_LABELS: EmailLayoutLabels = {
  footerNotice:
    'This message was sent by CKBHSE Limited. Replies to this address may not be monitored.',
  viewOnline: 'View in portal',
  contactSupport: 'Contact support',
};
