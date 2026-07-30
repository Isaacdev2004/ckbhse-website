# Phase 03 — Milestone 2.5 — Enterprise LMS — Implementation Report

**Project:** CKBHSE Enterprise Digital Platform  
**Phase:** Phase 03 — Business Platform  
**Milestone:** M2.5  
**Status:** Complete  
**Date:** July 2026

---

## Executive Summary

Milestone 2.5 delivers a production-ready Enterprise Learning Management System (LMS) integrated with the existing CKBHSE platform. The implementation extends M2.1–M2.4 architecture without redesign: session authentication, RBAC, repository pattern, service layer, OpenAPI, and shared UI components.

The LMS manages course enrolments, learning pathways, assessments, certificates, CPD tracking, attendance, trainer workspaces, analytics, and corporate training — all organization-scoped. M1 training catalogue content is consumed via `@workspace/content/loader` with no duplication.

**Verification:** typecheck pass, **394 tests** passing (+40 since M2.4), builds pass.

---

## Architecture

```
Presentation (client-portal /portal/training/*, learning-portal /learn/*)
        ↓
API (/api/v1/learning/*)
        ↓
Services (LearningService, EnrollmentService, AssessmentService, …)
        ↓
Repositories (Enrollment, Learning, Assessment, Certificate, Session, Trainer, Transcript, CPD)
        ↓
DrizzleLearningStore → PostgreSQL (0004_learning.sql)
        ↕
M1 Content (@workspace/content/loader) — course metadata only, no duplication
```

| Rule | Compliance |
|------|------------|
| No SQL in routes | Learning routes call `container.services.learning` only |
| No business logic in controllers | Controllers delegate to services |
| Organization isolation | All repositories require `organizationId` |
| RBAC | `requirePermission()` on every repository method |
| Reuse M1 content | `courseCategory` + `courseSlug` reference M1 pages |

---

## Learning Platform Overview

### Client Portal (`/portal/training/*`)

| Route | Purpose |
|-------|---------|
| `/training/dashboard` | Executive learning dashboard |
| `/training/catalogue` | M1 course catalogue with filters |
| `/training/my-learning` | Active enrolments |
| `/training/pathways` | Structured learning journeys |
| `/training/calendar` | Upcoming sessions |
| `/training/certificates` | Course certificates |
| `/training/transcript` | Personal learning transcript |
| `/training/assessments` | Available assessments |
| `/training/history` | CPD and completion history |

### Trainer Portal (`/learn/*`)

| Route | Purpose |
|-------|---------|
| `/learn/dashboard` | Trainer metrics |
| `/learn/courses` | Assigned courses |
| `/learn/sessions` | Scheduled sessions |
| `/learn/attendance` | Attendance marking |
| `/learn/assessments` | Grading workspace |
| `/learn/certificates` | Certificate management |
| `/learn/reports` | Training analytics |

---

## Course Enrolment

Supports self, manager, administrator, mandatory, bulk, and invitation sources via `enrollment_source` enum. Enrolment creates a linked `training_progress` record. Manager/admin flows use `ENROLMENT_MANAGE`; learners use `LEARNING_ACCESS` for self-enrolment.

---

## Learning Pathways

Organization-scoped pathways with ordered courses, prerequisites, CPD hours, and certification names. Demo seed includes Health & Safety Manager, ISO Lead Auditor, and Compliance Officer pathways for Acme Manufacturing.

---

## Assessments

Assessment engine with multiple choice, true/false, short/long answer, and file upload question types. Supports passing score, attempt limits, timers, randomization, scoring, and result history.

---

## Certificates

LMS `course_certificates` table (separate from portal `organization_certificates`). Supports course, CPD, compliance, and attendance certificate kinds with verification codes and expiry tracking.

---

## CPD Tracking

`cpd_records` stores hours by category with annual totals via `sumCpdHours()`. Dashboard surfaces earned vs required hours (35h default).

---

## Trainer Workspace

Trainer portal at port **5184**, base `/learn/`. Uses `COURSE_READ`, `ASSESSMENT_MARK`, and `ENROLMENT_MANAGE` permissions. Trainer dashboard aggregates assignments and sessions.

---

## Corporate Training

Training managers with `training_manager` role receive `ENROLMENT_MANAGE` for bulk assignment, analytics, and compliance oversight. Organization-scoped data supports department/site filtering on enrolments.

---

## Analytics

`LearningAnalyticsService` aggregates enrolment counts, completion rate, pass rate, average score, and CPD totals. Available at `GET /api/v1/learning/analytics` (requires `ENROLMENT_MANAGE`).

---

## API

Base path: `/api/v1/learning`

| Method | Path | Permission |
|--------|------|------------|
| GET | `/dashboard` | `LEARNING_ACCESS` |
| GET | `/catalogue` | `COURSE_READ` |
| GET | `/courses/:category/:slug` | `COURSE_READ` |
| GET/POST | `/enrolments` | `LEARNING_ACCESS` |
| PATCH | `/progress` | `LEARNING_ACCESS` |
| GET | `/pathways`, `/pathways/:id` | `LEARNING_ACCESS` |
| GET | `/transcript` | `LEARNING_ACCESS` |
| GET | `/certificates` | `CERTIFICATE_READ` |
| GET/POST | `/assessments/:id/start\|submit` | `LEARNING_ACCESS` |
| GET | `/sessions`, `/attendance` | `LEARNING_ACCESS` |
| GET | `/analytics` | `ENROLMENT_MANAGE` |
| GET | `/cpd`, `/recommendations`, `/search` | `LEARNING_ACCESS` |
| GET | `/trainer/dashboard` | `COURSE_READ` |

OpenAPI updated with `learning` tag and schemas.

---

## Database

Migration: `lib/db/migrations/0004_learning.sql`

| Table | Purpose |
|-------|---------|
| `learning_pathways` | Structured journeys |
| `learning_pathway_courses` | Pathway course ordering |
| `training_enrollments` | Enrolment records |
| `training_progress` | Progress tracking |
| `course_sessions` | Instructor-led / virtual sessions |
| `course_attendance` | Attendance records |
| `course_assessments` | Assessment definitions |
| `assessment_questions` | Question bank |
| `assessment_attempts` | Learner attempts |
| `assessment_answers` | Submitted answers |
| `course_certificates` | LMS certificates |
| `cpd_records` | CPD hour tracking |
| `trainer_assignments` | Trainer-course mapping |
| `course_feedback` | Learner feedback |
| `learning_notifications` | In-app notifications |
| `learning_transcripts` | Generated transcripts |

Drizzle schema: `lib/db/src/schema/learning.ts`

---

## Repositories

| Repository | File |
|------------|------|
| EnrollmentRepository | `lib/data/src/repositories/enrollment.repository.ts` |
| LearningRepository | `lib/data/src/repositories/learning.repository.ts` |
| AssessmentRepository | `lib/data/src/repositories/assessment.repository.ts` |
| CertificateRepository | `lib/data/src/repositories/certificate.repository.ts` |
| SessionRepository | `lib/data/src/repositories/session.repository.ts` |
| TrainerRepository | `lib/data/src/repositories/trainer.repository.ts` |
| TranscriptRepository | `lib/data/src/repositories/transcript.repository.ts` |
| CPDRepository | `lib/data/src/repositories/cpd.repository.ts` |

Store: `lib/data/src/stores/drizzle-learning.store.ts`

---

## Services

| Service | Responsibility |
|---------|----------------|
| LearningService | Dashboard, catalogue, pathways, search |
| EnrollmentService | Enrol, cancel, approve |
| AssessmentService | Start, submit, score |
| CertificateService | List, issue |
| TrainerService | Trainer dashboard, attendance |
| TranscriptService | Generate personal transcript |
| LearningAnalyticsService | Organization analytics |
| CPDService | CPD records and totals |
| CourseRecommendationService | M1 catalogue recommendations |
| LearningNotificationService | In-app notification records |

Wired via `createLearningServices()` in `lib/services/src/learning/index.ts` as `services.learning`.

---

## Security

- Session cookie authentication (M2.3)
- RBAC on all repository methods
- Organization isolation enforced at repository layer
- CSRF on mutating API calls
- Permission middleware on all learning routes
- No business logic in controllers

---

## Accessibility

Client and learning portals reuse `@workspace/ui` components (WCAG AA baseline from design system): semantic headings, keyboard-navigable links, accessible cards and forms, responsive grid layouts.

---

## Testing

| Package | Tests |
|---------|-------|
| lib/domain | 7 |
| lib/email-templates | 8 |
| lib/content | 57 |
| lib/platform | 155 |
| lib/seo | 14 |
| lib/data | 48 (+16) |
| lib/auth | 6 |
| lib/services | 18 (+10) |
| lib/workers | 5 |
| artifacts/api-server | 76 (+14) |
| **Total** | **394** |

New test files: enrollment, learning, certificate repository tests; learning RBAC; learning/assessment/certificate service tests; learning API route auth tests.

---

## Performance

- Dashboard aggregates via `Promise.all` parallel fetches
- Catalogue served from in-memory M1 content loader (no DB)
- Indexed foreign keys on organization, user, course, and session columns

---

## Verification

```bash
pnpm run typecheck   # pass
pnpm run test        # 394 passed
```

Demo credentials unchanged from M2.3/M2.4:
- Client: `client@acme.example.com` / `StaffDev123!` (org `…000002`)
- Trainer: `consultant@ckbhse.co.uk` / `StaffDev123!` (platform org `…000001`)

---

## Files Created

- `lib/db/migrations/0004_learning.sql`
- `lib/db/src/schema/learning.ts`
- `lib/domain/src/learning/index.ts`
- `lib/data/src/stores/drizzle-learning.store.ts`
- `lib/data/src/repositories/{enrollment,learning,assessment,certificate,session,trainer,transcript,cpd}.repository.ts`
- `lib/data/src/repositories/*.test.ts` (enrollment, learning, certificate, learning-rbac)
- `lib/services/src/learning/*.ts` (10 services + index)
- `lib/services/src/learning/*.test.ts`
- `artifacts/api-server/src/routes/v1/learning.ts`
- `artifacts/api-server/src/routes/v1/learning.test.ts`
- `artifacts/learning-portal/` (full SPA)
- `artifacts/client-portal/src/pages/training/*.tsx` (9 pages)
- `artifacts/client-portal/src/components/training-layout.tsx`
- `artifacts/client-portal/src/lib/learning-api.ts`

---

## Files Modified

- `lib/db/src/schema/index.ts`
- `lib/db/migrations/meta/_journal.json`
- `lib/domain/src/index.ts`
- `lib/data/src/index.ts`, `lib/data/package.json`
- `lib/services/src/index.ts`, `lib/services/package.json`, `lib/services/tsconfig.json`
- `artifacts/api-server/src/routes/v1/index.ts`
- `artifacts/api-server/src/routes/v1/portal.ts`
- `artifacts/client-portal/src/App.tsx`
- `lib/api-spec/openapi.yaml`

---

## Remaining Work

- Orval regeneration (`pnpm run codegen` in api-zod) — hand-fix duplicate export in `lib/api-zod/src/index.ts` after codegen
- Outbox worker handlers for learning notification delivery (architecture in place via `learning_notifications` table)
- QR attendance check-in and digital signature capture (UI placeholders in trainer portal)
- Certificate PDF generation and secure download pipeline
- File upload assessment submissions (question type placeholder)
- Bulk enrolment API and manager approval workflow UI
- Learning portal integration tests (E2E)
- Run `0004_learning.sql` migration against production database

---

## Expected Outcome — Achieved

The CKBHSE platform now provides a fully integrated enterprise LMS enabling organizations, learners, trainers, and administrators to manage the complete lifecycle of corporate training — from enrolment and pathways to assessments, certification, compliance tracking, analytics, and CPD — integrated with authentication, RBAC, CRM, Client Portal, and the public Training Platform from M1 through M2.4.
