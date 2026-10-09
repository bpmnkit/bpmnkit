# Connectors runtime: Physical Tenant support — Configuration

Use the `camunda.clients.*` multi-client configuration to connect the runtime to multiple Physical Tenants. The shared `camunda.client.*` block sets base connection details inherited by all entries; per-client entries override only what differs (typically `physical-tenant-id` and `auth.*`).

```yaml
camunda:
  client:
    # Shared base inherited by all client entries
    grpc-address: https://your-cluster.example.com:26500
    rest-address: https://your-cluster.example.com
  clients:
    default:
      mode: self-managed
      physical-tenant-id: default
      auth:
        client-id: connector-default
        client-secret: ${SECRET_DEFAULT}
      primary: true # resolves the default @Autowired CamundaClient
    tenanta:
      mode: self-managed
      physical-tenant-id: tenanta
      auth:
        client-id: connector-tenanta
        client-secret: ${SECRET_TENANTA}
    tenantb:
      mode: self-managed
      physical-tenant-id: tenantb
      auth:
        client-id: connector-tenantb
        client-secret: ${SECRET_TENANTB}
```

- The client name (`tenanta`) is a free-form label and does not have to match the `physical-tenant-id`.
- `physical-tenant-id` must be lowercase alphanumeric, maximum 64 characters.
- Mark one entry `primary: true` when configuring multiple clients. With a single client, it is the primary implicitly.
- Existing single-client deployments using `camunda.client.*` are unaffected. At startup, `camunda.client.*` transparently maps to `camunda.clients.default.*`.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/connectors-runtime
