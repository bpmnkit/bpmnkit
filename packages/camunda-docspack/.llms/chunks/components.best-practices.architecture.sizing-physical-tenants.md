# Size clusters with Physical Tenants

Learn how to size broker memory, secondary storage, and noisy neighbor limits for a Self-Managed Orchestration Cluster that runs multiple Physical Tenants.

Self-Managed only

Learn how to size broker memory, secondary storage, and noisy neighbor limits when you run multiple [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index) on one Orchestration Cluster.

**Note**
This guide covers only what changes when you add tenants. Start from [Self-Managed resource planning](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-self-managed) for the baseline configuration, partitions, disk, RocksDB, and Elasticsearch/OpenSearch. Figures here are directional observations from internal Camunda 8.10 tests, not capacity guarantees. Your limit is whichever resource runs out first in your environment.

---
Source: https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-physical-tenants
