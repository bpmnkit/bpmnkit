# Use external PostgreSQL — Troubleshooting

### Other components log `401` errors

**Observed behavior:** Applications other than Keycloak log `401` errors.

**Why this happens:** The Keycloak database is misconfigured, so other components can't authenticate against Keycloak.

**How to fix:** Verify the Keycloak database connection settings, and confirm Keycloak itself starts up without errors before checking other components.

### A component logs a `database missing` error

**Observed behavior:** A component logs a `database missing` error at startup.

**Why this happens:** The database it expects hasn't been created yet in your external PostgreSQL instance.

**How to fix:** Create the missing database in your external PostgreSQL instance, matching the name that component expects.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/using-existing-postgres
