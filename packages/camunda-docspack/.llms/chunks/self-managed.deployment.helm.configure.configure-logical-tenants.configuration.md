# Configure Logical Tenants in Helm chart — Configuration

Multi-tenancy behavior differs depending on the identity component:

- **Management Identity:** Disabled by default. You must enable it. Once enabled, tenant checks are automatically enforced (all requests are validated against the active tenant configuration).

- **Orchestration Cluster Admin:** Enabled by default, with a default tenant created. Tenant checks are not enforced unless explicitly enabled.

### Parameters

| values.yaml option                          | type    | default | description                                                                       |
| ------------------------------------------- | ------- | ------- | --------------------------------------------------------------------------------- |
| `global.multitenancy.enabled`               | boolean | `false` | (Management Identity) Enable multi-tenancy globally.                              |
| `orchestration.multitenancy.checks.enabled` | boolean | `false` | (Orchestration Cluster Admin) Enforce tenant validation across requests.          |
| `orchestration.multitenancy.api.enabled`    | boolean | `true`  | (Orchestration Cluster Admin) Enable the multi-tenancy API for tenant management. |

### Example usage

**Management Identity**

Enable multi-tenancy in Management Identity:

```yaml
global:
  multitenancy:
    enabled: true
```

**Orchestration Cluster Admin**

Enable tenant checks and the multi-tenancy API:

```yaml
orchestration:
  multitenancy:
    checks:
      enabled: true # Enforces tenant checks in all components
    api:
      enabled: true # Enables multi-tenancy API for tenant management
```

**Warning**
Disabling multi-tenancy after it has been enabled can cause unexpected behavior if active tenants exist.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configure-logical-tenants
