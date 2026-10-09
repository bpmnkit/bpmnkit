# Configure Physical Tenants across releases — Map tenants in the Hub release

In the Hub release, map the default tenant through the cluster-level `components.optimize` record, and map each non-default Physical Tenant through a `physicalTenants` entry. The tenant ID must exactly match the ID under `camunda.physical-tenants` in the Orchestration Cluster configuration.

```yaml
global:
  topology:
    mode: hub
    clusters:
      - id: production-a
        # namespace, releaseName, host, version, contextPaths, and other components omitted
        components:
          optimize: # Optimize for the default tenant
            enabled: true
            clientId: optimize-production-a-default
            audience: optimize-production-a-default-api
            roleName: Optimize production-a default
            redirectUrl: https://production-a.example.com/optimize-default
            secret:
              existingSecret: optimize-production-a-default-oidc
              existingSecretKey: client-secret
        physicalTenants:
          - id: tenanta
            components:
              optimize:
                enabled: true
                clientId: optimize-production-a-tenanta
                audience: optimize-production-a-tenanta-api
                roleName: Optimize production-a tenanta
                redirectUrl: https://production-a.example.com/optimize-tenanta
                secret:
                  existingSecret: optimize-production-a-tenanta-oidc
                  existingSecretKey: client-secret
```

Give every Optimize release its own OIDC client ID, audience, role name, redirect URL, and secret. Set the same client ID, audience, redirect URL, and secret on that tenant's Optimize release under `optimize.security.authentication.oidc`. Setting a dedicated `roleName` avoids adding the audience to the shared `Optimize` role.

A `physicalTenants` entry registers the tenant's Optimize client and role in Management Identity. It doesn't add the tenant's Optimize to the Camunda Hub cluster inventory.

A distinct `roleName` isolates the Optimize role per tenant, but it doesn't isolate Optimize's logical tenants, which are a separate mechanism. See [Optimize and Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/optimize#known-limitation-logical-tenants-with-the-same-id-across-physical-tenants) if you reuse the same logical tenant ID across Physical Tenants behind one shared Management Identity.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/physical-tenants
