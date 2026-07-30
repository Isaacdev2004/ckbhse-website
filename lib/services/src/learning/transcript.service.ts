import type { AuthorizationContext } from '@workspace/platform/authorization';
import type { TranscriptRepository } from '@workspace/data/repositories/transcript';
import type { EnrollmentRepository } from '@workspace/data/repositories/enrollment';
import type { CertificateRepository } from '@workspace/data/repositories/certificate';
import type { CPDRepository } from '@workspace/data/repositories/cpd';
import { contentLoader } from '@workspace/content/loader';

export class TranscriptService {
  constructor(
    private readonly transcript: TranscriptRepository,
    private readonly enrollment: EnrollmentRepository,
    private readonly certificate: CertificateRepository,
    private readonly cpd: CPDRepository,
  ) {}

  async generate(context: AuthorizationContext) {
    const userId = context.userId!;
    const [enrollments, certificates, cpdRecords, cpdTotal] = await Promise.all([
      this.enrollment.list(context, { userId }),
      this.certificate.list(context, userId),
      this.cpd.list(context, userId),
      this.cpd.sumHours(context),
    ]);

    const courses = enrollments.map((e) => {
      const page = contentLoader.getCoursePage(
        e.courseCategory as never,
        e.courseSlug,
      );
      return {
        courseCategory: e.courseCategory,
        courseSlug: e.courseSlug,
        title: page?.title ?? e.courseSlug,
        status: e.status,
        enrolledAt: e.enrolledAt.toISOString(),
        completedAt: e.completedAt?.toISOString() ?? null,
      };
    });

    const summary = {
      courses,
      certificates: certificates.map((c) => ({
        certificateNumber: c.certificateNumber,
        courseSlug: c.courseSlug,
        issuedAt: c.issuedAt.toISOString(),
        status: c.status,
      })),
      cpdRecords: cpdRecords.map((r) => ({
        category: r.category,
        hours: Number(r.hours),
        earnedAt: r.earnedAt.toISOString(),
      })),
      cpdTotalHours: cpdTotal,
      generatedAt: new Date().toISOString(),
    };

    await this.transcript.save(context, summary);
    return summary;
  }

  async get(context: AuthorizationContext) {
    const stored = await this.transcript.get(context);
    if (stored !== null) {
      return stored.summary as Record<string, unknown>;
    }
    return this.generate(context);
  }
}
