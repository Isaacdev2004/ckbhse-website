import type { AuthorizationContext } from '@workspace/platform/authorization';
import type { TrainerRepository } from '@workspace/data/repositories/trainer';
import { contentLoader } from '@workspace/content/loader';

export class TrainerService {
  constructor(private readonly trainer: TrainerRepository) {}

  async getDashboard(context: AuthorizationContext) {
    const [assignments, sessions] = await Promise.all([
      this.trainer.listAssignments(context),
      this.trainer.listSessions(context),
    ]);

    const courses = assignments.map((a) => {
      const page = contentLoader.getCoursePage(
        a.courseCategory as never,
        a.courseSlug,
      );
      return {
        courseCategory: a.courseCategory,
        courseSlug: a.courseSlug,
        title: page?.title ?? a.courseSlug,
        isPrimary: a.isPrimary,
      };
    });

    return {
      assignedCourses: courses,
      upcomingSessions: sessions
        .filter((s) => s.startsAt >= new Date())
        .slice(0, 10)
        .map((s) => ({
          id: s.id,
          title: s.title,
          startsAt: s.startsAt.toISOString(),
          delivery: s.delivery,
        })),
      totalSessions: sessions.length,
    };
  }

  listSessions(context: AuthorizationContext) {
    return this.trainer.listSessions(context);
  }

  listAttendance(context: AuthorizationContext, sessionId: string) {
    return this.trainer.listAttendance(context, sessionId);
  }

  markAttendance(
    context: AuthorizationContext,
    attendanceId: string,
    status: 'present' | 'absent' | 'late' | 'completed',
    trainerNotes?: string,
  ) {
    return this.trainer.updateAttendance(context, attendanceId, {
      status,
      trainerNotes: trainerNotes ?? null,
      checkedInAt: status === 'present' ? new Date() : undefined,
      attendancePercent: status === 'present' || status === 'completed' ? 100 : 0,
    });
  }
}
