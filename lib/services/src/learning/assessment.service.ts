import { AppError } from '@workspace/platform/errors';
import type { AuthorizationContext } from '@workspace/platform/authorization';
import type { AssessmentRepository } from '@workspace/data/repositories/assessment';

export class AssessmentService {
  constructor(private readonly assessment: AssessmentRepository) {}

  list(context: AuthorizationContext, courseCategory?: string, courseSlug?: string) {
    return this.assessment.list(context, courseCategory, courseSlug);
  }

  async getDetail(context: AuthorizationContext, assessmentId: string) {
    const assessment = await this.assessment.get(context, assessmentId);
    if (assessment === null) return null;
    const questions = await this.assessment.listQuestions(context, assessmentId);
    return {
      assessment,
      questions: questions.map((q) => ({
        id: q.id,
        questionType: q.questionType,
        prompt: q.prompt,
        options: q.options as string[],
        points: q.points,
        sortOrder: q.sortOrder,
      })),
    };
  }

  async start(context: AuthorizationContext, assessmentId: string, enrollmentId?: string) {
    const assessment = await this.assessment.get(context, assessmentId);
    if (assessment === null) {
      throw AppError.notFound('Assessment not found');
    }
    const prior = await this.assessment.listAttempts(context, assessmentId);
    if (prior.length >= assessment.maxAttempts) {
      throw AppError.conflict('Maximum attempts reached');
    }
    return this.assessment.startAttempt(context, {
      assessmentId,
      enrollmentId: enrollmentId ?? null,
      attemptNumber: prior.length + 1,
    });
  }

  async submit(
    context: AuthorizationContext,
    attemptId: string,
    answers: readonly { questionId: string; answer: string }[],
  ) {
    const questions = await Promise.all(
      answers.map(async (a) => {
        const assessmentRows = await this.assessment.listAttempts(context);
        const attempt = assessmentRows.find((at) => at.id === attemptId);
        if (attempt === null || attempt === undefined) return null;
        const qs = await this.assessment.listQuestions(context, attempt.assessmentId);
        return qs.find((q) => q.id === a.questionId) ?? null;
      }),
    );

    let totalPoints = 0;
    let earnedPoints = 0;
    const answerRows = answers.map((a, i) => {
      const question = questions[i];
      const points = question?.points ?? 1;
      totalPoints += points;
      const isCorrect =
        question?.correctAnswer !== null &&
        question?.correctAnswer !== undefined &&
        a.answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
      const awarded = isCorrect ? points : 0;
      earnedPoints += awarded;
      return {
        attemptId,
        questionId: a.questionId,
        organizationId: context.organizationId!,
        answer: a.answer,
        isCorrect,
        pointsAwarded: awarded,
      };
    });

    const score =
      totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    const attemptRows = await this.assessment.listAttempts(context);
    const attempt = attemptRows.find((a) => a.id === attemptId);
    const assessment = attempt
      ? await this.assessment.get(context, attempt.assessmentId)
      : null;
    const passed = assessment !== null ? score >= assessment.passingScore : false;

    return this.assessment.submitAttempt(
      context,
      attemptId,
      {
        score,
        passed,
        submittedAt: new Date(),
      },
      answerRows,
    );
  }

  listAttempts(context: AuthorizationContext, assessmentId?: string) {
    return this.assessment.listAttempts(context, assessmentId);
  }
}
