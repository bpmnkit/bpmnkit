# Custom exporters for Physical Tenants — What a tenant can and cannot override

When a tenant is assigned a root-declared exporter ID:

| Field        | Overridable per tenant                                                                                                        |
| :----------- | :---------------------------------------------------------------------------------------------------------------------------- |
| `class-name` | No — must match the root value if restated; startup fails otherwise                                                           |
| `jar-path`   | No — must match the root value if restated; startup fails otherwise                                                           |
| `args`       | Yes — deep-merged with the root args when the exporter supports it, otherwise replaces the root args entirely for that tenant |

Assigning a root exporter ID means running the root's exporter implementation, optionally with adjusted arguments. To run a different exporter class, declare it under a new, tenant-private exporter ID instead of reusing a root ID.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/custom-exporters
