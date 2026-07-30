import { contentLoader } from '@workspace/content/loader';
import type { AuthorizationContext } from '@workspace/platform/authorization';
import type { EnrollmentRepository } from '@workspace/data/repositories/enrollment';

export class CourseRecommendationService {
  constructor(private readonly enrollment: EnrollmentRepository) {}

  async recommend(context: AuthorizationContext) {
    const catalog = contentLoader.getTrainingCatalog();
    const enrollments = await this.enrollment.list(context, {
      ...(context.userId !== undefined ? { userId: context.userId } : {}),
    });
    const enrolledSlugs = new Set(
      enrollments.map((e: { courseCategory: string; courseSlug: string }) =>
        `${e.courseCategory}/${e.courseSlug}`,
      ),
    );

    const featured = catalog.filter((c) => c.featured === true);
    const notEnrolled = catalog.filter(
      (c) => !enrolledSlugs.has(`${c.category}/${c.slug}`),
    );

    const recommendations = [
      ...featured.filter((c) => !enrolledSlugs.has(`${c.category}/${c.slug}`)),
      ...notEnrolled.filter((c) => !c.featured),
    ].slice(0, 6);

    return recommendations.map((c) => ({
      category: c.category,
      slug: c.slug,
      title: c.title,
      summary: c.summary,
      duration: c.duration,
      certification: c.certification,
    }));
  }
}
