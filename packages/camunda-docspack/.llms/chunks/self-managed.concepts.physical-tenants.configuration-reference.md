# Configuration reference

Configure Physical Tenants in Self-Managed deployments with root defaults, per-tenant overrides, and startup validation rules.


## Configuration model

Configuration is static. You define Physical Tenants in application configuration, then apply changes with a rolling restart.

At startup, Camunda resolves tenant configuration using this model:

1. Root-level `camunda.*` acts as the implicit base configuration.
2. The `default` Physical Tenant is always present.
3. Optional `camunda.physical-tenants.default.*` overrides the root-level values for the default Physical Tenant.
4. Additional tenants are configured under `camunda.physical-tenants.<tenant-key>.*`.


## Section structure

Use this structure for Physical Tenants:

```yaml
camunda:
  # Root-level defaults (implicit default tenant base)
  data:
    secondary-storage:
      rdbms:
        url: jdbc:postgresql://db/shared
  security:
    authentication:
      method: oidc
      providers:
        # Cluster-level provider definitions
        oidc:
          my-idp:
            issuer-uri: https://my-idp.example.com/realms/camunda
            client-id: camunda-client
            client-secret: ${MY_IDP_CLIENT_SECRET}
            audiences:
              - camunda-api
            username-claim: preferred_username

  physical-tenants:
    # Optional overrides for the always-present default tenant
    default:
      cluster:
        # Required when you override default-tenant values
        partition-count: 3
      data:
        secondary-storage:
          rdbms:
            url: jdbc:postgresql://db/default_tenant
      security:
        authentication:
          providers:
            assigned:
              - my-idp

    # Additional Physical Tenant
    tenanta:
      cluster:
        partition-count: 3
      data:
        secondary-storage:
          rdbms:
            url: jdbc:postgresql://db/tenanta
      security:
        authentication:
          providers:
            assigned:
              - my-idp
```

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/configuration-reference
