# RDBMS benchmarking results — Key results summary

### Write throughput

- In scale tests, RDBMS write behavior was described as approximately linear with additional cluster capacity.

### Scenario observations

- **Single-task workload**: Stable exporter behavior under low-complexity flow patterns.
- **Multi-step timer workload**: Stable exporter behavior in multi-step flows, with engine pressure becoming visible before exporter pressure in some runs.
- **Complex business workload**: Stable exporter behavior in complex business flows, where engine and workload characteristics can dominate end-to-end throughput.

### Data availability and cleanup

- History cleanup overhead was minimal in short-retention scenarios and did not impact write throughput. With longer retention periods, allocate additional database resources for cleanup operations.

### Read/query behavior

Read performance is currently the main trade-off for RDBMS secondary storage in query-heavy workloads:

- Key-based access patterns scale better.
- Broad filters, sorting, and statistics/count queries can degrade with data growth.
- Statistics queries for process and dashboard views are known sensitive paths in the Orchestration Cluster API, whether called directly through the API or indirectly by Operate dashboards.

Recommended mitigation:

- Validate your most common read queries with production-like data.
- Add and tune indexes for high-frequency filters used in your environment.
- Re-evaluate index strategy as data volume and query patterns evolve.

### RDBMS vs Elasticsearch/OpenSearch comparison

- With the same hardware setup, RDBMS write performance was observed at roughly **~70%** of Elasticsearch/OpenSearch write performance across tested scenarios.
- API read performance (including Operate dashboards) with RDBMS can be significantly slower than Elasticsearch/OpenSearch on large datasets, especially for complex queries, multi-field filtering, and sorting.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/rdbms-benchmark-results
