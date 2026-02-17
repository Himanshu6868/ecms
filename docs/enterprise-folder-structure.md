# Enterprise Domain-Driven Folder Structure

```text
src/
  app/
    api/
      auth/
      tickets/
      workflow/
      sla/
      escalation/
      notifications/
      compliance/
      admin/
  modules/
    case-management/
      domain/
      application/
      infrastructure/
    workflow/
      domain/
      application/
      infrastructure/
    sla/
      domain/
      application/
      infrastructure/
    compliance/
      domain/
      application/
      infrastructure/
    identity-access/
      domain/
      application/
      infrastructure/
  shared/
    db/
    queue/
    observability/
    security/
    validation/
```

## Service boundary rules
- Domain layer has no framework dependencies.
- Application layer owns use-case orchestration and transaction boundaries.
- Infrastructure layer adapts queue/database/providers.
- API handlers call application services only.
- Cron/worker processors call same application contracts as APIs.
