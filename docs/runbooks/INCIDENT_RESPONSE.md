# Incident Response Runbook

**Scope:** CKBHSE Limited Vision platform (API + five frontends)  
**On-call:** Platform engineering rotation (define roster before GA)

---

## Severity levels

| Level | Definition | Initial response |
|-------|------------|------------------|
| SEV-1 | Complete outage or data breach suspected | Page on-call immediately; war room within 15 min |
| SEV-2 | Major feature degraded for multiple tenants | On-call within 30 min |
| SEV-3 | Single-tenant or non-critical degradation | Next business day unless escalated |
| SEV-4 | Cosmetic / documentation | Backlog |

---

## First 15 minutes

1. Acknowledge the alert and assign an incident commander.
2. Check `/api/v1/health` and `/api/v1/system/health` (when DB configured).
3. Review recent deployments and migration runs.
4. Capture timeline in the incident channel — do not delete messages.

---

## Common scenarios

### API unavailable

- Verify process/container health and load balancer target status.
- Check database connectivity (`DATABASE_URL`, connection pool exhaustion).
- Roll back to last known good deployment if a release correlates with onset.

### Authentication failures spike

- Verify `SESSION_SECRET` has not rotated without coordinated redeploy.
- Check cookie domain/secure settings match the serving hostname.
- Review rate-limit logs for brute-force patterns.

### File upload failures

- Confirm object storage credentials and bucket policy.
- Check `FILE_SCAN_PROVIDER` — failed scans mark uploads `failed` and delete objects.
- Inspect `file_uploads` rows stuck in `pending` beyond TTL.

### Tenant data concern

- Freeze affected accounts via admin portal if isolation breach suspected.
- Pull audit logs for the organisation and actor IDs involved.
- Escalate to security lead before communicating externally.

---

## Recovery verification

After mitigation:

```bash
pnpm run dr:rehearsal
pnpm run test:e2e
```

Document root cause, blast radius, and follow-up tickets before closing the incident.

---

## Post-incident

- Blameless review within 5 business days.
- Update this runbook if a gap was discovered.
- Track remediation items in the engineering backlog with owners and dates.
