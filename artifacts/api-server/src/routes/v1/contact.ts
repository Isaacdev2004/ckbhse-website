import { Router, type IRouter } from 'express';
import { SubmitContactEnquiryBody } from '@workspace/api-zod';
import { AppError } from '@workspace/platform/errors';
import { container } from '../../container';
import { contactRateLimiter } from '../../middleware/security';

const router: IRouter = Router();

/**
 * Accept a public website contact enquiry.
 *
 * Persists the submission, records an audit event, and enqueues an outbox
 * message — all within one transaction via the application service layer.
 */
router.post('/', contactRateLimiter, async (req, res, next) => {
  try {
    const body = SubmitContactEnquiryBody.parse(req.body);

    if (container.services === null) {
      throw AppError.serviceUnavailable(
        'Contact submissions are temporarily unavailable',
      );
    }

    const result = await container.services.contactRequest.submitPublicEnquiry({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone ?? null,
      company: body.company ?? null,
      serviceInterest: body.serviceInterest,
      message: body.message,
      source: 'website',
      ipAddress: req.ip ?? null,
      userAgent:
        typeof req.headers['user-agent'] === 'string'
          ? req.headers['user-agent']
          : null,
      metadata: {
        requestId: req.requestId,
        ...(req.ip !== undefined ? { ipAddress: req.ip } : {}),
        ...(typeof req.headers['user-agent'] === 'string'
          ? { userAgent: req.headers['user-agent'] }
          : {}),
      },
    });

    res.status(201).json({
      id: result.id,
      status: result.status,
      message: 'Enquiry received. We will respond within one business day.',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
