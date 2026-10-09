# Connectors runtime: Physical Tenant support — Inbound connectors

The runtime polls each configured Physical Tenant for process definitions using that tenant's own client, and tracks inbound connector state per tenant, so inbound executables and their state stay isolated across tenants.

### Webhook path routing

Set `camunda.connector.webhook.append-physical-tenant-and-tenant-to-path: true` to activate namespaced paths:

```
/inbound/<physicalTenantId>/<tenantId>/<path>
```

Equivalent environment variable: `CAMUNDA_CONNECTOR_WEBHOOK_APPEND_PHYSICAL_TENANT_AND_TENANT_TO_PATH`.

If unset, the property is inferred automatically: multi-client configurations default to `true`, single-client configurations default to `false`. An explicit value always overrides inference.

Without namespaced paths, the first registered inbound connector matching a path claims the request regardless of Physical Tenant. Enable namespaced paths in any multi-tenant deployment.

**Warning: Isolation relies on path uniqueness, not tenant-scoped credentials**
The routing layer performs pure path-segment matching on `physicalTenantId/tenantId/path`. No credential or signature check happens at the routing layer. HMAC and signature verification is handled per connector downstream, inside each webhook element's own logic, and has no awareness of `physicalTenantId`. Tenant isolation depends entirely on each tenant's webhook paths being distinct and unguessable.

### Known limitations

- Each inbound request targets exactly one Physical Tenant. Routing a single webhook event to multiple tenants is not supported.
- Cross-tenant inbound routing is not supported.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/connectors-runtime
