import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../../app';

const learningRoutes = [
  '/api/v1/learning/dashboard',
  '/api/v1/learning/catalogue',
  '/api/v1/learning/pathways',
  '/api/v1/learning/enrolments',
  '/api/v1/learning/transcript',
  '/api/v1/learning/certificates',
  '/api/v1/learning/assessments',
  '/api/v1/learning/sessions',
  '/api/v1/learning/analytics',
  '/api/v1/learning/cpd',
  '/api/v1/learning/recommendations',
  '/api/v1/learning/trainer/dashboard',
];

describe('learning route authentication', () => {
  it.each(learningRoutes)('rejects unauthenticated GET %s', async (path) => {
    const res = await request(app).get(path);
    expect([401, 503]).toContain(res.status);
  });
});

describe('learning route availability', () => {
  it('rejects learning search when unauthenticated', async () => {
    const res = await request(app).get('/api/v1/learning/search?q=iosh');
    expect([401, 400, 503]).toContain(res.status);
  });

  it('rejects enrolment creation when unauthenticated', async () => {
    const res = await request(app).post('/api/v1/learning/enrolments').send({
      courseCategory: 'health-safety',
      courseSlug: 'iosh-managing-safely',
    });
    expect([401, 503]).toContain(res.status);
  });
});
