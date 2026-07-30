# M2.10 Full Platform GA — Launch Checklist

**Target:** General availability of all five platform ecosystems under one operating model  
**Prerequisite:** M2.9 enterprise hardening complete  
**Reference:** DOCUMENT_05 §M10, DOCUMENT_06 milestone table

---

## Launch gates (§17)

| Gate | Owner | Status |
|------|-------|--------|
| All critical/high defects closed | Engineering | ☐ |
| Production deployment rehearsed with rollback | Platform | ☐ |
| Database migrations tested on staging restore | Platform | ☐ |
| Secrets and API keys rotated for GA cutover | Security | ☐ |
| Monitoring and alerting verified under load | Platform | ☐ |
| Backup restore tested (DR rehearsal PASS) | Platform | ☐ |
| Penetration test findings remediated or accepted | Security | ☐ |
| GDPR retention and deletion policies documented | Compliance | ☐ |

---

## Documentation

| Audience | Deliverable | Status |
|----------|-------------|--------|
| Platform admin | Admin portal user guide | ☐ |
| Staff (consultant/manager) | Staff portal onboarding | ☐ |
| Client users | Client portal help centre | ☐ |
| Students | LMS learner guide | ☐ |
| Engineering | Runbooks (`docs/runbooks/`) | ☐ Partial |
| API consumers | OpenAPI spec + integration notes | ☐ |

---

## Training and support

| Item | Status |
|------|--------|
| Role-based training sessions scheduled | ☐ |
| Support tier-1 playbooks for common issues | ☐ |
| Escalation path to engineering documented | ☐ |
| Service level targets agreed with operations | ☐ |

---

## Technical verification

| Check | Command / reference | Status |
|-------|---------------------|--------|
| Unit and integration tests green | `pnpm run verify` | ☐ |
| OpenAPI codegen in sync | CI codegen step | ☐ |
| Dependency audit clean | `pnpm audit --audit-level=high` | ☐ |
| E2E smoke green | `pnpm run test:e2e` | ☐ |
| DR rehearsal (staging restore) | `pnpm run dr:rehearsal` with `DATABASE_URL` | ☐ |
| File upload scan gate active | `FILE_SCAN_PROVIDER=content-inspection` | ☐ |

---

## Ecosystem readiness

| Ecosystem | GA ready | Notes |
|-----------|----------|-------|
| Public website | ☐ | |
| Staff portal | ☐ | |
| Client portal | ☐ | |
| Admin portal | ☐ | CMS Part 4 workflow live |
| LMS | ☐ | |

---

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product owner | | | |
| Engineering lead | | | |
| Security | | | |
| Operations | | | |
