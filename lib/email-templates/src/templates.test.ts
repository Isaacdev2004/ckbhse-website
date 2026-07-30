import { describe, expect, it } from 'vitest';
import { renderTemplate } from './registry.js';
import { EmailTemplateKey } from './types.js';

const portalUrl = 'https://portal.ckbhse.example/leads/lead-1';

describe('email templates', () => {
  it('renders public_enquiry_received', () => {
    const rendered = renderTemplate({
      key: EmailTemplateKey.PublicEnquiryReceived,
      data: {
        recipientName: 'Alex',
        serviceInterest: 'ISO 45001 audit',
      },
    });

    expect(rendered.subject).toContain('received your enquiry');
    expect(rendered.text).toContain('Alex');
    expect(rendered.text).toContain('ISO 45001 audit');
    expect(rendered.html).toContain('CKBHSE');
    expect(rendered.html).toContain('ISO 45001 audit');
  });

  it('renders internal_new_enquiry', () => {
    const rendered = renderTemplate({
      key: EmailTemplateKey.InternalNewEnquiry,
      data: {
        contactName: 'Alex Morgan',
        email: 'alex@example.com',
        serviceInterest: 'Fire risk assessment',
        message: 'We need support across three sites.',
        portalUrl,
      },
    });

    expect(rendered.subject).toContain('Alex Morgan');
    expect(rendered.text).toContain('alex@example.com');
    expect(rendered.html).toContain('Open in CRM');
  });

  it('renders lead_assigned', () => {
    const rendered = renderTemplate({
      key: EmailTemplateKey.LeadAssigned,
      data: {
        recipientName: 'Sam',
        leadName: 'Alex Morgan',
        serviceInterest: 'Training',
        portalUrl,
      },
    });

    expect(rendered.subject).toContain('Lead assigned');
    expect(rendered.text).toContain('Alex Morgan');
    expect(rendered.html).toContain('View lead');
  });

  it('renders lead_status_changed', () => {
    const rendered = renderTemplate({
      key: EmailTemplateKey.LeadStatusChanged,
      data: {
        recipientName: 'Sam',
        leadName: 'Alex Morgan',
        previousStatus: 'new',
        newStatus: 'qualified',
        portalUrl,
      },
    });

    expect(rendered.subject).toContain('status updated');
    expect(rendered.text).toContain('new');
    expect(rendered.text).toContain('qualified');
    expect(rendered.html).toContain('Lead status updated');
  });

  it('renders follow_up_reminder', () => {
    const rendered = renderTemplate({
      key: EmailTemplateKey.FollowUpReminder,
      data: {
        recipientName: 'Sam',
        leadName: 'Alex Morgan',
        dueAt: '30 July 2026',
        notes: 'Call before noon.',
        portalUrl,
      },
    });

    expect(rendered.subject).toContain('Follow-up reminder');
    expect(rendered.text).toContain('Call before noon.');
    expect(rendered.html).toContain('Alex Morgan');
  });

  it('renders consultation_confirmed', () => {
    const rendered = renderTemplate({
      key: EmailTemplateKey.ConsultationConfirmed,
      data: {
        recipientName: 'Alex',
        consultationDate: '5 August 2026',
        consultationTime: '10:00 BST',
        location: 'Microsoft Teams',
        consultantName: 'Jordan Lee',
      },
    });

    expect(rendered.subject).toContain('consultation is confirmed');
    expect(rendered.text).toContain('Jordan Lee');
    expect(rendered.html).toContain('Microsoft Teams');
  });

  it('renders proposal_sent', () => {
    const rendered = renderTemplate({
      key: EmailTemplateKey.ProposalSent,
      data: {
        recipientName: 'Alex',
        leadName: 'Northwind Ltd',
        proposalTitle: 'HSE consultancy programme',
        portalUrl,
      },
    });

    expect(rendered.subject).toContain('Proposal ready');
    expect(rendered.text).toContain('HSE consultancy programme');
    expect(rendered.html).toContain('Review proposal');
  });

  it('renders proposal_accepted', () => {
    const rendered = renderTemplate({
      key: EmailTemplateKey.ProposalAccepted,
      data: {
        recipientName: 'Sam',
        leadName: 'Northwind Ltd',
        proposalTitle: 'HSE consultancy programme',
        portalUrl,
      },
    });

    expect(rendered.subject).toContain('Proposal accepted');
    expect(rendered.text).toContain('Northwind Ltd');
    expect(rendered.html).toContain('Proposal accepted');
  });
});
