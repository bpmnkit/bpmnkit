# Authentication and authorization for Physical Tenants — Token claim mappings

Mapping rules define how token claims from the IdP translate into Camunda roles within a Physical Tenant. Each tenant applies its own mapping rules independently, enabling different access levels for the same user across tenants.

For example, a token claim `groups: ["team-a-admins"]` might map to an admin role in one Physical Tenant but have no effect in another tenant where that claim is not configured.


## IdP provider assignment

Every explicitly configured Physical Tenant must declare which identity providers it accepts using `providers.assigned`. If no providers are assigned to a configured tenant, the cluster fails to start with a configuration validation error:

```text
Invalid physical-tenant provider selection: non-default physical tenant '<tenantId>' must declare a
non-empty 'camunda.physical-tenants.<tenantId>.security.authentication.providers.assigned' selecting
which cluster OIDC providers apply to it
```

The one exception is the **implicit default tenant**: when no `camunda.physical-tenants.*` configuration is present, the default tenant falls back to the full cluster provider set. Once the default tenant is explicitly configured under `camunda.physical-tenants.default`, it must also declare its assigned providers.

```yaml
camunda:
  security:
    authentication:
      method: oidc
      providers:
        oidc:
          corp-idp:
            issuer-uri: https://corp-idp.example.com/realms/camunda
            client-id: camunda-client
            client-secret: ${CORP_IDP_CLIENT_SECRET}
            audiences:
              - camunda-api
            username-claim: preferred_username

  physical-tenants:
    tenanta:
      security:
        authentication:
          providers:
            assigned:
              - corp-idp
```

For complete configuration examples, see [configuration reference](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/configuration-reference).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authentication-authorization
