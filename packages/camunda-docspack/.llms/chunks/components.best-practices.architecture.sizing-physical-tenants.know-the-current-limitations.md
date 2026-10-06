# Size clusters with Physical Tenants — Know the current limitations

These limitations apply to Camunda 8.10.0:

- Per-tenant RDBMS infrastructure on every broker: The Physical Tenant count is bounded by single-broker heap and database connections. Adding brokers doesn't add tenant capacity and increases total connections. See [camunda/camunda#61935](https://github.com/camunda/camunda/issues/61935).
- Tested range: Sizing tests cover tens of Physical Tenants per cluster. Load test your own target if you plan for more.
- No performance guarantee for each tenant: If one Physical Tenant needs high throughput or strict latency on its own, validate it with dedicated load tests or use a separate cluster.
- Single secondary storage type: All tenants must use the same type. See [storage isolation](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation#known-limitations).

---
Source: https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-physical-tenants
