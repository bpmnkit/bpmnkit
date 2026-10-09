# Cold Recovery — Architecture

In Cold Recovery, a single active region runs the Camunda Orchestration Cluster.

- Automated backup jobs export Zeebe partition snapshots and secondary storage backups (Elasticsearch, OpenSearch) to an S3-compatible object storage bucket replicated to a separate region. RDBMS secondary storage relies on database backup tools and must ensure durability across multiple regions.
- There is no warm standby. For example, a second cluster does not run during normal operations.
- On primary-region failure, an operator provisions a new environment in the secondary region and restores from the most recent consistent backup set.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/cold-recovery
