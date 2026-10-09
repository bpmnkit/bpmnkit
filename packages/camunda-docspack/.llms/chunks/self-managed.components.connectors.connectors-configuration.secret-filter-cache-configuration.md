# Configuration — Secret filter — Cache configuration

The secret filter caches process definition lookups to avoid repeated API calls. You can configure the cache with the following properties:

| Property                                                         | Environment variable                                          | Description                                     | Default |
| ---------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------- | ------- |
| `camunda.connector.secret-resolver.secret-filter.cache.enabled`  | `CAMUNDA_CONNECTOR_SECRETRESOLVER_SECRETFILTER_CACHE_ENABLED` | Whether caching is enabled.                     | `true`  |
| `camunda.connector.secret-resolver.secret-filter.cache.max-size` | `CAMUNDA_CONNECTOR_SECRETRESOLVER_SECRETFILTER_CACHE_MAXSIZE` | Maximum number of process definitions to cache. | `1000`  |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration
