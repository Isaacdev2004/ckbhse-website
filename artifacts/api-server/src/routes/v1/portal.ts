import { Router, type IRouter } from 'express';
import { AppError } from '@workspace/platform/errors';
import { requirePermission } from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { container } from '../../container';

const router: IRouter = Router();

function requirePortal() {
  if (container.services === null) {
    throw AppError.serviceUnavailable('Portal services are not configured');
  }
  return container.services.portal;
}

function requireAudit() {
  if (container.services === null) {
    throw AppError.serviceUnavailable('Audit services are not configured');
  }
  return container.services.audit;
}

function requireCompliance() {
  if (container.services === null) {
    throw AppError.serviceUnavailable('Compliance services are not configured');
  }
  return container.services.compliance;
}

function requireCapa() {
  if (container.services === null) {
    throw AppError.serviceUnavailable('CAPA services are not configured');
  }
  return container.services.capa;
}

function requireRisk() {
  if (container.services === null) {
    throw AppError.serviceUnavailable('Risk services are not configured');
  }
  return container.services.risk;
}

router.get('/dashboard', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.PORTAL_ACCESS);
    const portal = requirePortal();
    res.json(await portal.getDashboard(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/organisation', async (req, res, next) => {
  try {
    const portal = requirePortal();
    const org = await portal.getOrganization(req.auth);
    if (org === null) {
      throw AppError.notFound('Organization not found');
    }
    res.json(org);
  } catch (error) {
    next(error);
  }
});

router.patch('/organisation', async (req, res, next) => {
  try {
    const portal = requirePortal();
    const profile = await portal.updateOrganizationProfile(req.auth, req.body);
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const portal = requirePortal();
    const keyword =
      typeof req.query.q === 'string' ? req.query.q : undefined;
    const members = await portal.listMembers(req.auth, keyword);
    res.json({ items: members });
  } catch (error) {
    next(error);
  }
});

router.get('/projects', async (req, res, next) => {
  try {
    const portal = requirePortal();
    const status =
      typeof req.query.status === 'string' ? req.query.status : undefined;
    const items = await portal.listProjects(req.auth, status);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/projects/:id', async (req, res, next) => {
  try {
    const portal = requirePortal();
    const detail = await portal.getProjectDetail(req.auth, req.params.id);
    if (detail.project === null) {
      throw AppError.notFound('Project not found');
    }
    res.json(detail);
  } catch (error) {
    next(error);
  }
});

router.get('/documents', async (req, res, next) => {
  try {
    const portal = requirePortal();
    const keyword =
      typeof req.query.q === 'string' ? req.query.q : undefined;
    const items = await portal.listDocuments(req.auth, keyword);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/documents', async (req, res, next) => {
  try {
    const portal = requirePortal();
    const name = req.body?.name;
    const storageKey = req.body?.storageKey;
    if (typeof name !== 'string' || typeof storageKey !== 'string') {
      throw AppError.badRequest('name and storageKey are required');
    }
    const document = await portal.createDocument(req.auth, {
      name,
      storageKey,
      category:
        typeof req.body?.category === 'string' ? req.body.category : null,
      mimeType:
        typeof req.body?.mimeType === 'string' ? req.body.mimeType : null,
      sizeBytes:
        typeof req.body?.sizeBytes === 'number' ? req.body.sizeBytes : null,
      ownerUserId: req.auth.userId ?? null,
      tags: Array.isArray(req.body?.tags) ? req.body.tags : [],
    });
    res.status(201).json(document);
  } catch (error) {
    next(error);
  }
});

router.get('/certificates', async (req, res, next) => {
  try {
    const portal = requirePortal();
    const items = await portal.listCertificates(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/compliance', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.COMPLIANCE_READ);
    const portal = requirePortal();
    const compliance = requireCompliance();
    const [tasks, actions, org, workspace, executive] = await Promise.all([
      portal.listComplianceTasks(req.auth),
      portal.listActions(req.auth),
      portal.getOrganization(req.auth),
      compliance.compliance.getWorkspace(req.auth),
      compliance.analytics.getExecutiveDashboard(req.auth),
    ]);
    res.json({
      complianceScore: workspace.overallComplianceScore ?? org?.profile?.complianceScore ?? null,
      tasks,
      actions,
      workspace,
      analytics: executive,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/compliance/analytics/executive', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.COMPLIANCE_READ);
    res.json(await requireCompliance().analytics.getExecutiveDashboard(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/compliance/analytics/regulatory', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.REGULATORY_READ);
    res.json(await requireCompliance().analytics.getRegulatoryMonitoring(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/compliance/analytics/alerts', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.REGULATORY_READ);
    const items = await requireCompliance().analytics.listAlerts(req.auth, 'open');
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/inspections', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.INSPECTION_READ);
    const items = await requireCompliance().inspection.listForPortal(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/inspections/calendar', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.INSPECTION_READ);
    const items = await requireCompliance().inspection.listCalendar(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/inspections/history', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.INSPECTION_READ);
    const items = await requireCompliance().inspection.list(req.auth, 'completed');
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/inspections/:inspectionId', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.INSPECTION_READ);
    res.json(await requireCompliance().inspection.get(req.auth, req.params.inspectionId));
  } catch (error) {
    next(error);
  }
});

router.get('/capa/dashboard', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.CAPA_READ);
    res.json(await requireCapa().capa.getDashboard(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/capa', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.CAPA_READ);
    const items = await requireCapa().capa.listForPortal(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/capa/:capaId', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.CAPA_READ);
    res.json(await requireCapa().capa.get(req.auth, req.params.capaId));
  } catch (error) {
    next(error);
  }
});

router.get('/risk-assessments/dashboard', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.RISK_ASSESSMENT_READ);
    res.json(await requireRisk().risk.getDashboard(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/risk-assessments/heatmap', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.RISK_ASSESSMENT_READ);
    res.json(await requireRisk().risk.getHeatMap(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/risk-assessments', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.RISK_ASSESSMENT_READ);
    const items = await requireRisk().risk.listForPortal(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/risk-assessments/:assessmentId', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.RISK_ASSESSMENT_READ);
    res.json(await requireRisk().risk.get(req.auth, req.params.assessmentId));
  } catch (error) {
    next(error);
  }
});

router.get('/audits', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.AUDIT_READ);
    const audit = requireAudit();
    const items = await audit.audit.listForPortal(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/audits/calendar', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.AUDIT_READ);
    const audit = requireAudit();
    const items = await audit.calendar.listEvents(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/audits/history', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.AUDIT_READ);
    const audit = requireAudit();
    const items = await audit.audit.list(req.auth, 'closed');
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/audits/reports', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.AUDIT_READ);
    const audit = requireAudit();
    const rows = await audit.audit.list(req.auth, 'published');
    res.json({
      items: rows.map((row: { id: string; name: string; status: string; score: number | null }) => ({
        id: row.id,
        title: row.name,
        status: row.status,
        score: row.score,
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/audits/:auditId', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.AUDIT_READ);
    const audit = requireAudit();
    res.json(await audit.audit.get(req.auth, req.params.auditId));
  } catch (error) {
    next(error);
  }
});

router.get('/incidents', async (req, res, next) => {
  try {
    const portal = requirePortal();
    const items = await portal.listIncidents(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/actions', async (req, res, next) => {
  try {
    const portal = requirePortal();
    const status =
      typeof req.query.status === 'string' ? req.query.status : undefined;
    const items = await portal.listActions(req.auth, status);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/support', async (req, res, next) => {
  try {
    const portal = requirePortal();
    const status =
      typeof req.query.status === 'string' ? req.query.status : undefined;
    const items = await portal.listSupportTickets(req.auth, status);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/support', async (req, res, next) => {
  try {
    const portal = requirePortal();
    const subject = req.body?.subject;
    if (typeof subject !== 'string') {
      throw AppError.badRequest('subject is required');
    }
    const ticket = await portal.createSupportTicket(req.auth, {
      subject,
      category:
        typeof req.body?.category === 'string' ? req.body.category : null,
      priority:
        typeof req.body?.priority === 'string'
          ? (req.body.priority as never)
          : 'medium',
    });
    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
});

router.get('/support/:id', async (req, res, next) => {
  try {
    const portal = requirePortal();
    const [ticket, messages] = await Promise.all([
      portal.getSupportTicket(req.auth, req.params.id),
      portal.listTicketMessages(req.auth, req.params.id),
    ]);
    if (ticket === null) {
      throw AppError.notFound('Support ticket not found');
    }
    res.json({ ticket, messages });
  } catch (error) {
    next(error);
  }
});

router.post('/support/:id/messages', async (req, res, next) => {
  try {
    const portal = requirePortal();
    const body = req.body?.body;
    if (typeof body !== 'string') {
      throw AppError.badRequest('body is required');
    }
    const message = await portal.addTicketMessage(
      req.auth,
      req.params.id,
      body,
    );
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
});

router.get('/messages', async (req, res, next) => {
  try {
    const portal = requirePortal();
    const items = await portal.listMessageThreads(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/messages/:threadId', async (req, res, next) => {
  try {
    const portal = requirePortal();
    const items = await portal.listThreadMessages(req.auth, req.params.threadId);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/activity', async (req, res, next) => {
  try {
    const portal = requirePortal();
    const limit = Math.min(Number(req.query.limit ?? 50), 200);
    const items = await portal.listActivities(req.auth, limit);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/settings', async (req, res, next) => {
  try {
    const portal = requirePortal();
    const settings = await portal.getSettings(req.auth);
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

router.patch('/settings', async (req, res, next) => {
  try {
    const portal = requirePortal();
    const settings = await portal.updateSettings(req.auth, req.body);
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.PORTAL_ACCESS);
    const portal = requirePortal();
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    res.json(await portal.globalSearch(req.auth, q));
  } catch (error) {
    next(error);
  }
});

router.get('/training', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEARNING_ACCESS);
    if (container.services === null) {
      throw AppError.serviceUnavailable('Services are not configured');
    }
    const { learning, portal } = container.services;
    const [dashboard, enrollments, orgCerts] = await Promise.all([
      learning.learning.getDashboard(req.auth),
      learning.enrollment.list(req.auth),
      portal.listCertificates(req.auth),
    ]);
    res.json({
      dashboard,
      assignedCourses: enrollments.filter((e) => e.status === 'active'),
      completedCourses: enrollments.filter((e) => e.status === 'completed'),
      certificates: orgCerts.filter((c) => c.certificateType === 'training'),
      mandatoryTraining: enrollments.filter((e) => e.isMandatory),
      upcomingSessions: dashboard.upcomingSessions,
      progressPercent:
        dashboard.currentEnrollments > 0
          ? Math.round(
              (dashboard.completedCourses / dashboard.currentEnrollments) * 100,
            )
          : null,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
