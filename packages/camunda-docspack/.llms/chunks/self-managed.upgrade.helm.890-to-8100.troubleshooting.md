# Upgrade Camunda 8.9 to 8.10 using Helm — Troubleshooting

### Upgrade failed due to missing secrets

If your upgrade fails due to missing credentials, see [Extract plaintext values and reference them as Kubernetes Secrets](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/secret-management#extract-plaintext-values-and-reference-them-as-kubernetes-secrets). For additional context, see Helm chart Bitnami legacy values file.

### Upgrade failed with secondary storage validation error

If Helm fails with a validation error about secondary storage type, set it explicitly:

```yaml
orchestration:
  data:
    secondaryStorage:
      type: elasticsearch # or "opensearch" or "rdbms"
```

Alternatively, if you do not need secondary storage, set `global.noSecondaryStorage: true`.

### Backwards-compatible audiences replace the audience list

The deprecated `orchestration.security.authentication.oidc.backwardsCompatibleAudiences` appended its values to the default audiences, but its target, `camunda.security.authentication.oidc.audiences`, replaces the whole list. If you migrate it verbatim, the broker only accepts your extra audience and rejects tokens for the chart's default audiences (by default `orchestration`, `orchestration-api`, and `web-modeler-api`) with `UNAUTHENTICATED: Expected a valid token`. List the full default audience set alongside your backwards-compatible audience in `audiences`.

### Initialization authorizations report "No permissionTypes provided"

If the orchestration pod fails to start with `IdentityInitializationException: Cannot initialize configured authorizations: No permissionTypes provided`, the authorization entry uses the wrong field name. Under `camunda.security.initialization.authorizations`, the permission list field is `permissions`, not `permissionTypes`.

### Custom document store ID

A non-default `global.documentStore.type.inmemory.storeId` (or `aws`/`gcp`) cannot be used through the deprecated key alone: the default store ID is derived from `global.documentStore.activeStoreId` (the store type), never the custom store ID, so the app fails with `Default document store ID does not match any configured document store`. Migrate the whole document configuration to `camunda.document.*` (`default-store-id` plus the store definition) in each document-consuming component's `extraConfiguration`.

### Multi-tenancy with an unprotected API

`camunda.security.multiTenancy.checksEnabled: true` cannot be combined with `camunda.security.authentication.unprotectedApi: true`; the orchestration pod fails with `Multi-tenancy is enabled ... but the API is unprotected`. Protect the API when multi-tenancy is enabled.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
