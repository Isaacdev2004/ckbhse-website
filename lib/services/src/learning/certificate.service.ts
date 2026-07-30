import type { AuthorizationContext } from '@workspace/platform/authorization';
import type { CertificateRepository } from '@workspace/data/repositories/certificate';

export class CertificateService {
  constructor(private readonly certificate: CertificateRepository) {}

  list(context: AuthorizationContext, userId?: string) {
    return this.certificate.list(context, userId);
  }

  get(context: AuthorizationContext, certificateId: string) {
    return this.certificate.get(context, certificateId);
  }

  issue(
    context: AuthorizationContext,
    input: {
      userId: string;
      courseCategory: string;
      courseSlug: string;
      enrollmentId?: string;
      kind?: 'course' | 'cpd' | 'compliance' | 'attendance';
      expiresAt?: Date;
    },
  ) {
    const number = `CKBHSE-TRN-${Date.now()}`;
    return this.certificate.issue(context, {
      userId: input.userId,
      courseCategory: input.courseCategory,
      courseSlug: input.courseSlug,
      enrollmentId: input.enrollmentId ?? null,
      certificateNumber: number,
      kind: input.kind ?? 'course',
      status: 'issued',
      verificationCode: `VERIFY-${number.slice(-8)}`,
    });
  }
}
