# Install an Orchestration Cluster release — Declare Physical Tenants

Physical Tenants are application configuration, not chart values. There's no `orchestration.physicalTenants` values key. Declare tenants as `camunda.physical-tenants.*` through `orchestration.extraConfiguration`. For why this is application configuration, see [Helm and application configuration responsibilities](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configuration-responsibilities).

```yaml
orchestration:
  extraConfiguration:
    - file: physical-tenants.yaml
      content: |
        camunda:
          physical-tenants:
            # Optional. Without a default entry, the default tenant is
            # synthesized from the root configuration and keeps its root exporters.
            default:
            riskprod:
              # Tenant configuration.
```

Declaring the `default` tenant explicitly changes how it gets its exporters, and each tenant needs its own Optimize release and index prefixes. Read [configure Physical Tenants across releases](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/physical-tenants) before you add your first tenant.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/orchestration-release
