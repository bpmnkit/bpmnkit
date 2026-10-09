# Helm chart user and client setup for Management Identity — Troubleshooting

### Clients or users don't appear after installation

**Observed behavior:** Configured clients or users aren't created.

**Why this happens:** A secret referenced in your configuration doesn't exist, or doesn't match the values in your Helm configuration. Missing secrets prevent creation.

**How to fix:** Verify that all referenced secrets exist and match the values in your Helm configuration.

### A client or user has unexpected permission issues

**Observed behavior:** A user or client can authenticate, but can't perform actions you expect it to be allowed to.

**Why this happens:** Its assigned roles don't grant the access it needs.

**How to fix:** Confirm the roles assigned to that user or client align with the access it should have.

### Management Identity fails to bind configuration with an array-indexing error

**Observed behavior:** Management Identity fails to start, logging an error such as:

```
Binding to target [Bindable@3e595da3 type = java.util.List<io.camunda.identity.impl.keycloak.config.record.KeycloakClient>, value = 'none', annotations = array<Annotation>[[empty]], bindMethod = [null]] failed:
```

**Why this happens:** Users or clients were previously configured using environment variables, and the array indexing in that configuration is incorrect.

**How to fix:** Migrate those definitions into `values.yaml` instead of environment variables.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/custom-users-and-clients
