# Troubleshoot Physical Tenants — Performance and noisy neighbors

Full performance isolation is out of scope. Some infrastructure is shared, so heavy load in one tenant can affect others.

| Shared resource | Effect under load                                                                 |
| :-------------- | :-------------------------------------------------------------------------------- |
| Gateways        | A saturated gateway affects requests for every tenant it serves.                  |
| Brokers         | Brokers are co-located and host partitions for more than one tenant.              |
| Actor threads   | Partition processing threads are shared. There is no per-tenant thread isolation. |

To identify a noisy neighbor, compare per-tenant throughput and latency over the same window and look for one tenant's load rising as others degrade. Scope every panel by the `physicalTenant` label so a single tenant's behavior is visible on its own.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/troubleshooting
