# Physical Tenant isolation model — Isolation model

Isolation applies differently at each layer of the stack:

| Layer             | Isolation model                                                                                          | Shared or isolated    |
| :---------------- | :------------------------------------------------------------------------------------------------------- | :-------------------- |
| Primary storage   | Dedicated Raft groups per Physical Tenant. A single tenant can span multiple brokers.                    | Isolated              |
| Brokers           | Brokers are co-located and can host more than one Physical Tenant.                                       | Shared infrastructure |
| Gateways          | Gateways route requests to the targeted tenant.                                                          | Shared                |
| Secondary storage | Use a tenant-specific schema, index prefix, or separate backend, depending on the storage type.          | Isolated              |
| Document store    | Use a tenant-specific bucket, container, or subpath. The exact convention depends on the cloud provider. | Isolated              |

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index
