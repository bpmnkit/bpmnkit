# Install the Camunda Hub release — Provider setup outside the chart

Management Identity can administer clients only in an external Keycloak instance, and only when you provide Keycloak administrator credentials.

For Microsoft Entra ID or a generic OIDC provider, first complete the provider setup, including Management Identity's confidential client, initial administrator claims, Hub clients, mapping rules, and each workload client. Then add the matching client IDs and audiences to the topology records. Management Identity initializes only its permission and role model from those records. See [external OIDC provider](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/external-oidc-provider).


## Role assignment across clusters

By default, each cluster record that declares an `orchestration` component adds that component's permissions to the shared `Orchestration` role, and each record that declares an `optimize` component does the same for the shared `Optimize` role. So assigning the `Optimize` role grants access to the Optimize instance of every cluster that declares one, but not to those clusters' Orchestration Clusters.

To authorize users per cluster, give each component its own role name:

```yaml
global:
  topology:
    clusters:
      - id: production-a
        components:
          orchestration:
            roleName: Orchestration production-a
          optimize:
            roleName: Optimize production-a
```

**Warning**
Identity preset initialization is additive. Removing or renaming a topology entry doesn't delete the corresponding clients, resource servers, permissions, or roles from Keycloak or Management Identity. Remove obsolete resources explicitly after the related workload is retired.

Existing Keycloak users don't automatically receive roles added by a later topology update. Assign the canonical roles or configured per-cluster roles through your normal access-management process.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/hub-release
