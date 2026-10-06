# Size clusters with Physical Tenants — Plan for noisy neighbors

A busy tenant mainly costs tenants that share its brokers and secondary storage latency, not throughput.

### Understand the observed effects

In an internal test on a prerelease 8.10 build, eight tenants shared three brokers (6 vCPU, 8 GiB) and PostgreSQL behind PgBouncer. Quiet tenants ran a typical workload at 6 process instances per second (PI/s) and kept that throughput while one tenant's load increased:

| Noisy tenant offered load | Quiet tenants' request-response p99 |
| :------------------------ | :---------------------------------- |
| 6 PI/s (baseline)         | 0.05–0.06 s                         |
| 24 PI/s                   | 0.15–0.20 s                         |
| 48 PI/s                   | 1.13–1.72 s                         |
| 96 PI/s                   | 2.48–3.20 s                         |

The noisy tenant's throughput leveled off at about 33–35 PI/s. At the highest load, quiet tenants' data availability p99 rose from about 1 s to 3.4–3.9 s. Latency returned to the baseline when the load dropped.

Raising the noisy tenant from three to 12 partitions at 6 PI/s barely changed quiet tenants' p99 (about 50 ms to 54–66 ms). It used about 0.73 more broker CPU cores across the cluster and 2.2–2.5 GiB more disk per broker.

### Limit tenant load with flow control

Use [flow control](https://docs.camunda.io/docs/next/self-managed/operational-guides/configure-flow-control/configure-flow-control) to limit what a tenant can write:

- Static configuration: Override `camunda.processing.flow-control.write.*` under `camunda.physical-tenants.<tenant-id>`.
- Runtime change: Call `POST actuator/flowControl?physicalTenant=<tenant-id>`. Without the parameter, the change applies to every tenant. Runtime changes revert when the broker restarts.

Flow control isn't a direct cap for each tenant:

- The write limit applies to each partition, so a tenant's ceiling is roughly the limit times its partition count.
- Throttling reacts to each partition's export backlog. In the 10-tenant PostgreSQL test described earlier, one slow shared database throttled tenants unevenly.
- Limits count records, not bytes or CPU time. Large payloads or expensive processing can use more shared resources at the same record rate.

Runaway loops and large multi-instance elements are bounded by write limits. Expressions are canceled after [`camunda.expression.timeout`](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#expression) (default `5s`) and raise an incident.

---
Source: https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-physical-tenants
