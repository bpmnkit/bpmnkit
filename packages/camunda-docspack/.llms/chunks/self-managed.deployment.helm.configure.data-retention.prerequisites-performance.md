# Configure data retention — Prerequisites — Performance

The Helm value `orchestration.history.rolloverInterval` controls how often the archiver creates a new dated index for historical data. For example, `1d` creates a new dated index every day for each archivable index type (Operate and Tasklist each have several), resulting in multiple new indices per day. This setting directly affects cluster performance:

- A **shorter interval** (for example, `1d`) creates more, smaller indices. Queries, ILM/ISM operations, and deletions against a single index run faster because each index covers less data, but the cluster carries more shard and index metadata overhead overall.
- A **longer interval** (for example, `30d`) creates fewer, larger indices. This reduces shard and metadata overhead across the cluster, but each index takes longer to query, roll over, and delete, and a spike in completed process instances can make a single index very large.

Choose `rolloverInterval` based on your throughput and retention needs:

- For low-to-moderate throughput clusters with long retention (more than three months), use a longer interval (for example, `7d` or longer) to avoid creating excessive numbers of small indices, which increases cluster management overhead.
- For clusters with a strict shard count limit, prefer longer intervals to stay within your cluster's recommended shard count.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/data-retention
