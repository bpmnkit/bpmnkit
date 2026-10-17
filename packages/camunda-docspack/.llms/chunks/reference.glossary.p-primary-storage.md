# Glossary — P — Primary storage

Primary storage is the authoritative store for workflow execution state managed by the Orchestration Cluster. In Self-Managed deployments, Zeebe brokers persist partition logs and snapshots on local disk. This data is required to execute workflows, recover after failures, and replicate state across brokers.

Primary storage is not a search or analytics backend, and it is not configured as an external database (such as Elasticsearch/OpenSearch, H2, or an external RDBMS).

See also: [Orchestration Cluster](#orchestration-cluster), [Log](#log), [Partition](#partition), [Snapshot](#snapshot), [Secondary storage](#secondary-storage)

---
Source: https://docs.camunda.io/docs/next/reference/glossary
