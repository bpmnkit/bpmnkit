# Upgrade Camunda components from 8.9 to 8.10 — Elasticsearch/OpenSearch Exporter

### Default replica count changed

In 8.10, the default value of `number-of-replicas` for Elasticsearch/OpenSearch Exporter indices changed from `0` to `1`.

This applies to new indices created after upgrading. Existing indices are not affected.

- **Single-node clusters:** Set `number-of-replicas: 0` explicitly in your exporter configuration to avoid yellow cluster health. On a single node, replicas cannot be assigned and remain unassigned, which causes the cluster to report yellow health and may trigger monitoring alerts.
- **Multi-node clusters:** No action required. The new default improves fault tolerance. Note that each replica stores a full copy of the shard data, so enabling replicas increases disk usage for new indices.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
