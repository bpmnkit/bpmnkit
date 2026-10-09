# Troubleshoot Physical Tenants — Authentication and authorization problems

### Browser login fails for a non-default tenant

When a user logs in to a non-default tenant through the browser, the OAuth redirect URI includes the tenant path prefix, such as `/physical-tenants/tenanta/sso-callback`. If your identity provider does not have that URI registered, the redirect fails.

Register the redirect URI for every Physical Tenant you add. Some identity providers support wildcard matching, which avoids a change per tenant.

### A user cannot access a tenant they should have access to

Each Physical Tenant applies its own mapping rules independently. The same token claim can grant a role in one tenant and nothing in another. Confirm the following for the specific tenant:

- The tenant assigns the identity provider that issued the token, through `providers.assigned`.
- The tenant's mapping rules cover the claim present in the token.
- The user's authorizations are defined within that tenant, not only in the default tenant.

### Cluster-wide operations are rejected

Endpoints under `/cluster/v2/...` require the cluster-admin role, except `GET /cluster/v2/status`, which is deliberately unauthenticated so load balancers can use it as a health check (see [health and status endpoints](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index#health-and-status-endpoints)). Brokers start successfully when the role is not configured, so a missing cluster-admin configuration only surfaces when someone calls a cluster-wide endpoint other than `/status`.

Configure cluster-admin access under `camunda.security.cluster-admin.oidc.*` for OIDC, or `camunda.security.cluster-admin.basic.users` for Basic authentication.

### Backup or exporting requests are rejected

Per-tenant backup and exporting endpoints are governed by two resource types, described in the [authorization model](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authorization-model): `BACKUP` (`CREATE`, `READ`, `DELETE`, `RESTORE`) and `EXPORTER` (`PAUSE`).

An Elasticsearch or OpenSearch history backup needs **both** `BACKUP:CREATE` and `EXPORTER:PAUSE`, because exporting is paused for the duration of the backup. A role granted only `BACKUP:CREATE` fails partway through. The default **admin** role holds both; **readonly-admin** holds only `BACKUP:READ`.

A `403` on a history backup endpoint has two possible causes, and the problem detail states which one applies:

- The caller lacks the required `BACKUP` permission.
- The tenant's secondary storage is neither Elasticsearch nor OpenSearch, so it cannot serve history backups at all. Granting permissions will not resolve this one.

Permissions apply to the whole resource type. There is no per-backup-ID or per-exporter grant, so only the `*` resource ID is supported.

### Sessions behave unexpectedly across tenants

Each tenant has its own path-scoped session cookie, scoped to `/physical-tenants/<id>`. A session established for one tenant is not sent to another. Logging in to a second tenant in the same browser creates a second, independent session rather than replacing the first.

For the full model, see [authentication and authorization](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authentication-authorization).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/troubleshooting
