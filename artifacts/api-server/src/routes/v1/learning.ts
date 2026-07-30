import { Router, type IRouter } from 'express';
import { AppError } from '@workspace/platform/errors';
import { requirePermission } from '@workspace/platform/authorization';
import { PERMISSIONS } from '@workspace/platform/permissions';
import { container } from '../../container';

const router: IRouter = Router();

function requireLearning() {
  if (container.services === null) {
    throw AppError.serviceUnavailable('Learning services are not configured');
  }
  return container.services.learning;
}

router.get('/dashboard', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEARNING_ACCESS);
    const learning = requireLearning();
    res.json(await learning.learning.getDashboard(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/catalogue', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.COURSE_READ);
    const learning = requireLearning();
    const q = typeof req.query.q === 'string' ? req.query.q : undefined;
    const category =
      typeof req.query.category === 'string' ? req.query.category : undefined;
    const items = learning.learning.getCatalogue({
      ...(q !== undefined ? { query: q } : {}),
      ...(category !== undefined ? { category: category as never } : {}),
    });
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/courses/:category/:slug', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.COURSE_READ);
    const learning = requireLearning();
    const course = learning.learning.getCourse(
      req.params.category,
      req.params.slug,
    );
    if (course === null) {
      throw AppError.notFound('Course not found');
    }
    res.json(course);
  } catch (error) {
    next(error);
  }
});

router.get('/pathways', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEARNING_ACCESS);
    const learning = requireLearning();
    const items = await learning.learning.listPathways(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/pathways/:id', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEARNING_ACCESS);
    const learning = requireLearning();
    const detail = await learning.learning.getPathwayDetail(
      req.auth,
      req.params.id,
    );
    if (detail === null) {
      throw AppError.notFound('Pathway not found');
    }
    res.json(detail);
  } catch (error) {
    next(error);
  }
});

router.get('/enrolments', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEARNING_ACCESS);
    const learning = requireLearning();
    const status =
      typeof req.query.status === 'string' ? req.query.status : undefined;
    const items = await learning.enrollment.list(req.auth, {
      ...(status !== undefined ? { status } : {}),
    });
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.post('/enrolments', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEARNING_ACCESS);
    const learning = requireLearning();
    const enrollment = await learning.enrollment.enroll(req.auth, req.body);
    res.status(201).json(enrollment);
  } catch (error) {
    next(error);
  }
});

router.patch('/enrolments/:id', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.ENROLMENT_MANAGE);
    const learning = requireLearning();
    const action = req.body.action as string | undefined;
    if (action === 'cancel') {
      res.json(await learning.enrollment.cancel(req.auth, req.params.id));
      return;
    }
    if (action === 'approve') {
      res.json(await learning.enrollment.approve(req.auth, req.params.id));
      return;
    }
    throw AppError.badRequest('Unsupported enrolment action');
  } catch (error) {
    next(error);
  }
});

router.patch('/progress', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEARNING_ACCESS);
    const learning = requireLearning();
    const progress = await learning.learning.updateProgress(req.auth, req.body);
    res.json(progress);
  } catch (error) {
    next(error);
  }
});

router.get('/transcript', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEARNING_ACCESS);
    const learning = requireLearning();
    res.json(await learning.transcript.get(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/certificates', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.CERTIFICATE_READ);
    const learning = requireLearning();
    const items = await learning.certificate.list(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/certificates/:id', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.CERTIFICATE_READ);
    const learning = requireLearning();
    const cert = await learning.certificate.get(req.auth, req.params.id);
    if (cert === null) {
      throw AppError.notFound('Certificate not found');
    }
    res.json(cert);
  } catch (error) {
    next(error);
  }
});

router.get('/assessments', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEARNING_ACCESS);
    const learning = requireLearning();
    const category =
      typeof req.query.category === 'string' ? req.query.category : undefined;
    const slug = typeof req.query.slug === 'string' ? req.query.slug : undefined;
    const items = await learning.assessment.list(req.auth, category, slug);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/assessments/:id', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEARNING_ACCESS);
    const learning = requireLearning();
    const detail = await learning.assessment.getDetail(req.auth, req.params.id);
    if (detail === null) {
      throw AppError.notFound('Assessment not found');
    }
    res.json(detail);
  } catch (error) {
    next(error);
  }
});

router.post('/assessments/:id/start', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEARNING_ACCESS);
    const learning = requireLearning();
    const attempt = await learning.assessment.start(
      req.auth,
      req.params.id,
      req.body.enrollmentId,
    );
    res.status(201).json(attempt);
  } catch (error) {
    next(error);
  }
});

router.post('/assessments/:id/submit', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEARNING_ACCESS);
    const learning = requireLearning();
    const result = await learning.assessment.submit(
      req.auth,
      req.body.attemptId,
      req.body.answers ?? [],
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/sessions', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEARNING_ACCESS);
    const learning = requireLearning();
    const upcomingOnly = req.query.upcoming === 'true';
    const items = await learning.learning.listSessions(req.auth, { upcomingOnly });
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/attendance', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEARNING_ACCESS);
    const learning = requireLearning();
    const sessionId =
      typeof req.query.sessionId === 'string' ? req.query.sessionId : undefined;
    if (sessionId === undefined) {
      throw AppError.badRequest('sessionId query parameter is required');
    }
    const items = await learning.trainer.listAttendance(req.auth, sessionId);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/analytics', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.ENROLMENT_MANAGE);
    const learning = requireLearning();
    res.json(await learning.analytics.getAnalytics(req.auth));
  } catch (error) {
    next(error);
  }
});

router.get('/cpd', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEARNING_ACCESS);
    const learning = requireLearning();
    const [records, totalHours] = await Promise.all([
      learning.cpd.list(req.auth),
      learning.cpd.sumHours(req.auth),
    ]);
    res.json({ records, totalHours, requiredHours: 35 });
  } catch (error) {
    next(error);
  }
});

router.get('/recommendations', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEARNING_ACCESS);
    const learning = requireLearning();
    const items = await learning.recommendations.recommend(req.auth);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.LEARNING_ACCESS);
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    if (q.length === 0) {
      throw AppError.badRequest('q query parameter is required');
    }
    const learning = requireLearning();
    res.json(await learning.learning.search(req.auth, q));
  } catch (error) {
    next(error);
  }
});

router.get('/trainer/dashboard', async (req, res, next) => {
  try {
    requirePermission(req.auth, PERMISSIONS.COURSE_READ);
    const learning = requireLearning();
    res.json(await learning.trainer.getDashboard(req.auth));
  } catch (error) {
    next(error);
  }
});

export default router;
