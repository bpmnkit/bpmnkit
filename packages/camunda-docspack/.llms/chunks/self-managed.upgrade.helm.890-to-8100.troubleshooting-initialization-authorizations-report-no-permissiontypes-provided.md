# Upgrade Camunda 8.9 to 8.10 using Helm — Troubleshooting — Initialization authorizations report "No permissionTypes provided"

If the Orchestration Cluster pod fails to start with `IdentityInitializationException: Cannot initialize configured authorizations for tenant 'default':` followed by the line `- No permissionTypes provided`, an authorization entry has no `permissions` list. Under `camunda.security.initialization.authorizations`, the permission list field is `permissions`, not `permissionTypes`.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
