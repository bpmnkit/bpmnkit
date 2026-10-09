# Optimize and Physical Tenants — Deploy Optimize per Physical Tenant

Native multi-tenant Helm support does not manage multiple Optimize instances for you. Deploy Optimize separately for each Physical Tenant, as its own release with `global.topology.mode: optimize`, and point it at that tenant's exported records. Optimize doesn't connect to the Orchestration Cluster's `/physical-tenants/{physicalTenantId}` endpoints. It imports records from Elasticsearch or OpenSearch, so its reader prefix must exactly equal the prefix of the exporter configured for that tenant. Each Optimize instance imports records from, and serves data for, exactly one Physical Tenant. See [install an Optimize release](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/optimize-release) for the release-level requirements and a complete `optimize-values.yaml` example.

The Hub release provisions the Management Identity side of this for you: declare each Physical Tenant's Optimize instance under `global.topology.clusters[].physicalTenants[]` in the Hub release, and the chart registers a distinct OAuth2 client and resource server for it. See [configure Physical Tenants across releases](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/physical-tenants) for how this maps across the Hub, Orchestration Cluster, and Optimize releases, including index prefix isolation and release ordering.

```yaml
global:
  topology:
    clusters:
      - id: production-a
        # ...
        physicalTenants:
          - id: tenanta
            components:
              optimize:
                enabled: true
                clientId: optimize-production-a-tenanta
                audience: optimize-production-a-tenanta-api
                roleName: "Optimize Tenant A"
                redirectUrl: https://production-a.example.com/optimize-tenanta
                secret:
                  existingSecret: optimize-production-a-tenanta-oidc
                  existingSecretKey: client-secret
```

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/optimize
