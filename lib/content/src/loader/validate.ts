import type { z } from 'zod';

/** Validates raw content against a Zod schema at load time. */
export function validateContent<T extends z.ZodType>(
  schema: T,
  data: unknown,
  label: string,
): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Content validation failed for ${label}: ${issues}`);
  }
  return result.data;
}
