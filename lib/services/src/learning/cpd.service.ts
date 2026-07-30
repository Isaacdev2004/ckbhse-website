import type { AuthorizationContext } from '@workspace/platform/authorization';
import type { CPDRepository } from '@workspace/data/repositories/cpd';

export class CPDService {
  constructor(private readonly cpd: CPDRepository) {}

  list(context: AuthorizationContext, userId?: string) {
    return this.cpd.list(context, userId);
  }

  sumHours(context: AuthorizationContext, year?: number) {
    return this.cpd.sumHours(context, year);
  }

  record(
    context: AuthorizationContext,
    input: {
      userId: string;
      category: string;
      hours: number;
      courseCategory?: string;
      courseSlug?: string;
    },
  ) {
    return this.cpd.create(context, {
      userId: input.userId,
      category: input.category,
      hours: String(input.hours),
      courseCategory: input.courseCategory ?? null,
      courseSlug: input.courseSlug ?? null,
    });
  }
}
