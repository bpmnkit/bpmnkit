# Install an Orchestration Cluster release — Choose which applications run

`orchestration.profiles` selects which parts of the Orchestration Cluster are active in the single StatefulSet:

```yaml
orchestration:
  profiles:
    broker: true
    admin: true
    operate: true
    tasklist: true
```

Disabling a profile removes that application from the running cluster. Keep `broker` enabled in any release that executes processes.


## Pin the issuer

Set `global.identity.auth.issuer`, or `orchestration.security.authentication.oidc.issuer`, to the exact `iss` claim your identity provider mints. This value can't be derived from `publicIssuerUrl` or `issuerBackendUrl`, because those are network routes: a Keycloak started without a pinned hostname mints a different `iss` per route, so in-cluster callers and browsers would present different issuers. Setting only `publicIssuerUrl` doesn't satisfy the requirement.

Pin your provider to one issuer. For Keycloak, set `KC_HOSTNAME`.

**Warning**
A pinned issuer is optional for a single-tenant cluster but required as soon as you declare Physical Tenants. The Orchestration Cluster rejects a provider without `issuerUri` once tenants exist, and the chart fails the render rather than deploying a cluster that can't validate tokens.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/orchestration-release
