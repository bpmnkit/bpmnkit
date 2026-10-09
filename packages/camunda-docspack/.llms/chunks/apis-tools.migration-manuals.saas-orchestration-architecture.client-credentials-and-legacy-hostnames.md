# SaaS orchestration architecture — Client credentials and legacy hostnames

Existing client credentials downloaded from Console for pre-8.9 clusters may reference legacy hostnames. Because those hostnames remain available in 8.9, existing credentials continue to work after a cluster is upgraded to 8.9. No immediate action is required.

### Recommended action

For long-lived automation and CI/CD systems, Camunda recommends updating credentials to use the new unified `*.api.*` URLs and corresponding token audience values before 8.10. You have two options:

- **Update existing credentials manually:** Edit the hostnames and token audience values in your existing credential configuration to reference the new unified URLs. For example:
  - **Legacy (pre-8.9):**
    - **Base URL:** `https://bru-2.operate.camunda.io/abc123-def456-ghi789`
    - **Audience:** `operate.camunda.io`
  - **New (from 8.9):**
    - **Base URL:** `https://bru-2.api.camunda.io/abc123-def456-ghi789/operate`
    - **Audience:** `api.camunda.io`
- **Create new credentials:** Create a fresh set of client credentials in Camunda Console, which will be generated with the unified API URLs and correct audience values by default.

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/saas-orchestration-architecture
