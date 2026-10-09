# Configuration reference — Default tenant behavior and compatibility

The `default` Physical Tenant is always present and immutable.

For backward compatibility:

- Existing root-level single-tenant configuration maps to the `default` Physical Tenant.
- If you upgrade from 8.9 to 8.10, no manual migration step is required for this mapping.
- `camunda.physical-tenants.default.*` is interpreted as overrides for the existing default tenant, not as creation of a new tenant.


## Validation and constraints

At startup, configuration validation enforces tenant-level constraints. Any validation failure prevents the cluster from starting. Most validation failures throw a `UnifiedConfigurationException`. Secret store and cache validation is an exception and throws an `IllegalStateException` or `IllegalArgumentException` directly. These validation failures don't have a separate error code. Camunda reports the message at startup instead of logging it as a warning. For the exact error message when a tenant is missing `providers.assigned`, see [IdP provider assignment](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authentication-authorization#idp-provider-assignment).

Known constraints and behavior:

- Tenant keys in `camunda.physical-tenants.<tenant-key>` must be lowercase alphanumeric (`[a-z0-9]+`) with a maximum length of 64 characters.
- Validation rejects unsupported or colliding storage configurations across tenants.
- For RDBMS-backed secondary storage, the combination of `camunda.data.secondary-storage.rdbms.url` and the effective table prefix must be unique per tenant.
- For Elasticsearch and OpenSearch, the effective index prefix must be unique per tenant.
- For object stores, backend-specific location combinations must be unique per tenant:
  - AWS S3: Bucket name and bucket path.
  - GCP: Bucket name and prefix.
  - Azure: Container name, container path, and endpoint.
  - Local filesystem: Path.
- Validation failures are startup failures, not runtime warnings.
- **Document store**: non-default tenants must declare `document.assigned`. Startup also fails if two tenants resolve to the same provider, bucket or container, and path. The error names the conflicting tenants.
- **Secrets**: each physical tenant supports at most one secret store, and its ID must be `default`; any other ID is rejected. Camunda validates the cache settings per tenant. `ttl` must be at least `1m` and use whole minutes, and `max-size` must be at least `1`. To override the root-level `camunda.secrets.*` defaults for a physical tenant, use `camunda.physical-tenants.<tenant-key>.secrets.*`.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/configuration-reference
