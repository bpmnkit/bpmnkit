# Migrate to zone-aware brokers — Migrate each zone

Migrate one zone at a time. For each zone, add its zone-aware brokers to the cluster with the management API, then remove the numbered brokers of that zone's release. Removing the numbered brokers right after each zone frees their CPU and memory before you migrate the next zone, which helps when cluster capacity is tight.

In a dual-region cluster, migrate the secondary zone (`zoneIndex: 1`) first, then the primary zone (`zoneIndex: 0`), as described in the [migration overview](#migration-overview). Don't migrate both zones concurrently.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/zone-aware-migration
