# Multi-tenancy — Configuration

In a Self-Managed Camunda 8 environment, the following two configurations settings are required for multi-tenancy:

| YAML path                    | Environment variable                    | Default value | Description                                                                                                        |
| ---------------------------- | --------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------ |
| `multitenancy.enabled`       | `CAMUNDA_OPTIMIZE_MULTITENANCY_ENABLED` | false         | Enables the Camunda 8 multi-tenancy feature in Optimize.                                                           |
| `security.auth.ccsm.baseUrl` | `CAMUNDA_OPTIMIZE_IDENTITY_BASE_URL`    | null          | The internal URL of the Management Identity service, reachable by Optimize from within the deployment environment. |

The `CAMUNDA_OPTIMIZE_MULTITENANCY_ENABLED` environment variable enables the feature in Optimize. The multi-tenancy feature must be enabled in all other components as well using their respective multi-tenancy feature flags.

Set `CAMUNDA_OPTIMIZE_IDENTITY_BASE_URL` to the Management Identity service URL. Optimize uses this to retrieve tenant authorizations. The URL must be the internal cluster URL reachable by Optimize from within the deployment environment; external-facing URLs may not be accessible from inside the cluster. If this base URL is not configured, Optimize cannot retrieve tenant authorizations and users cannot access any tenant's data in Optimize.

If required, the tenant authorization cache in Optimize can also be configured via these optional settings:

| YAML path                                           | Environment variable                                                             | Default value | Description                                                        |
| --------------------------------------------------- | -------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------ |
| `caches.cloudTenantAuthorizations.maxSize`          | `CAMUNDA_OPTIMIZE_CACHES_CLOUD_TENANT_AUTHORIZATIONS_MAX_SIZE`                   | 10000         | The maximum size of the Camunda 8 tenant authorizations cache.     |
| `caches.cloudTenantAuthorizations.defaultTtlMillis` | `CAMUNDA_OPTIMIZE_CACHES_CLOUD_TENANT_AUTHORIZATIONS_MIN_FETCH_INTERVAL_SECONDS` | 300000        | The time in milliseconds the tenant authorizations will be cached. |

### Troubleshooting

To ensure seamless integration and functionality, the multi-tenancy feature must also be enabled across **all** associated components [if not configured in Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configure-logical-tenants) so users can view any data from tenants for which they have authorizations configured in Identity.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/multi-tenancy
