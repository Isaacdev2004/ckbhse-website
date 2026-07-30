import { describe, expect, it, vi } from 'vitest';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { CmsService } from './cms.service.js';

const cmsCtx = {
  organizationId: '00000000-0000-4000-8000-000000000001',
  userId: '00000000-0000-4000-8000-000000000011',
  permissions: new Set([
    PERMISSIONS.CONTENT_READ,
    PERMISSIONS.CONTENT_MANAGE,
    PERMISSIONS.CONTENT_PUBLISH,
  ]),
  roles: new Set<string>(),
} as const;

describe('CmsService', () => {
  it('returns dashboard counts from repository', async () => {
    const cms = {
      dashboardCounts: vi.fn(async () => ({
        totalEntries: 120,
        publishedEntries: 100,
        draftEntries: 15,
        archivedEntries: 5,
        pendingReviewEntries: 3,
        pendingClientApprovalEntries: 2,
      })),
    };
    const service = new CmsService(cms as never);
    const dashboard = await service.getDashboard(cmsCtx as never);
    expect(dashboard.totalEntries).toBe(120);
    expect(dashboard.pendingClientApprovalEntries).toBe(2);
  });

  it('maps entry detail with version history', async () => {
    const cms = {
      get: vi.fn(async () => ({
        entry: {
          id: 'entry-1',
          contentType: 'service',
          slug: 'health-safety-audits',
          path: '/services/health-safety/health-safety-audits',
          title: 'Health & Safety Audits',
          status: 'published',
          locale: 'en-GB',
          category: 'health-safety',
          segment: null,
          publishedAt: new Date('2026-07-01T10:00:00.000Z'),
          updatedAt: new Date('2026-07-02T10:00:00.000Z'),
          requiresClientApproval: false,
          seo: { title: 'Health & Safety Audits' },
          reviewDueAt: null,
          scheduledAt: null,
          clientApprovedAt: null,
          currentVersionId: 'ver-2',
          publishedVersionId: 'ver-2',
        },
        versions: [
          {
            id: 'ver-1',
            versionNumber: 1,
            changeSummary: 'Import',
            createdAt: new Date('2026-07-01T09:00:00.000Z'),
            createdBy: null,
            payload: { title: 'Old' },
          },
          {
            id: 'ver-2',
            versionNumber: 2,
            changeSummary: 'Updated copy',
            createdAt: new Date('2026-07-02T10:00:00.000Z'),
            createdBy: 'user-1',
            payload: { title: 'Health & Safety Audits' },
          },
        ],
        currentVersion: {
          id: 'ver-2',
          versionNumber: 2,
          payload: { title: 'Health & Safety Audits' },
        },
      })),
    };
    const service = new CmsService(cms as never);
    const detail = await service.getEntry(cmsCtx as never, 'entry-1');
    expect(detail?.versions).toHaveLength(2);
    expect(detail?.payload).toEqual({ title: 'Health & Safety Audits' });
  });

  it('approves client entries through repository', async () => {
    const cms = {
      approveClient: vi.fn(async () => ({
        id: 'entry-1',
        contentType: 'corporate',
        slug: 'about',
        path: '/about',
        title: 'About',
        status: 'draft',
        locale: 'en-GB',
        category: null,
        segment: null,
        publishedAt: null,
        updatedAt: new Date(),
        requiresClientApproval: true,
        clientApprovedAt: new Date(),
      })),
      get: vi.fn(async () => ({
        entry: {},
        versions: [],
        currentVersion: { versionNumber: 3 },
      })),
    };
    const service = new CmsService(cms as never);
    const entry = await service.approveClientEntry(cmsCtx as never, 'entry-1');
    expect(entry?.title).toBe('About');
    expect(cms.approveClient).toHaveBeenCalledWith(cmsCtx, 'entry-1');
  });

  it('runs due workflow and collects publish errors', async () => {
    const cms = {
      listDueScheduledEntries: vi.fn(async () => [
        { id: 'entry-1', path: '/about' },
        { id: 'entry-2', path: '/contact' },
      ]),
      publish: vi
        .fn()
        .mockResolvedValueOnce({ id: 'entry-1' })
        .mockRejectedValueOnce(new Error('Client approval is required before publishing')),
      listDueReviewEntries: vi.fn(async () => [{ id: 'entry-3' }]),
    };
    const service = new CmsService(cms as never);
    const result = await service.runDueWorkflow(cmsCtx as never);
    expect(result.published).toBe(1);
    expect(result.reviewReminders).toBe(1);
    expect(result.errors).toHaveLength(1);
  });
});
