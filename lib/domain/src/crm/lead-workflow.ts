import type { LeadStatus } from './lead.js';

export const LEAD_STATUS_TRANSITIONS: Readonly<
  Record<LeadStatus, readonly LeadStatus[]>
> = {
  new: ['acknowledged', 'qualified', 'lost', 'archived'],
  acknowledged: ['qualified', 'lost', 'archived'],
  qualified: ['proposal_sent', 'lost', 'archived'],
  proposal_sent: ['negotiation', 'won', 'lost', 'archived'],
  negotiation: ['won', 'lost', 'archived'],
  won: ['archived'],
  lost: ['archived', 'new'],
  archived: ['new'],
};

export function canTransitionLeadStatus(
  from: LeadStatus,
  to: LeadStatus,
): boolean {
  return LEAD_STATUS_TRANSITIONS[from].includes(to);
}

export function isTerminalLeadStatus(status: LeadStatus): boolean {
  return status === 'won' || status === 'lost' || status === 'archived';
}

export function isOpenLeadStatus(status: LeadStatus): boolean {
  return !isTerminalLeadStatus(status);
}
