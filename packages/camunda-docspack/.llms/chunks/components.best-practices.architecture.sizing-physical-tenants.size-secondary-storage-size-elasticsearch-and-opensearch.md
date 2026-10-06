# Size clusters with Physical Tenants — Size secondary storage — Size Elasticsearch and OpenSearch

Each tenant that shares an Elasticsearch or OpenSearch cluster has its own index prefix and indices. Size the cluster for:

- Aggregate write load: The combined export load of all tenants, at their combined peak.
- Shard budget: Every tenant adds indices. Count all tenants in the [shard budget](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-your-environment#elasticsearchopensearch-shard-budget).
- Disk: The sum of each tenant's data volume under its own retention settings.

For scale, an internal test split the [realistic baseline workload](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-self-managed#baseline-performance) across five tenants. The workload met the baseline targets, but broker CPU rose 24%, CPU throttling rose about eight times, and Elasticsearch held about 290 indices.

  Elasticsearch test configuration

Five tenants, three partitions each, replication factor three. Three brokers with 3 vCPU and 2 GiB, `memory-fraction` `0.3`. Three Elasticsearch nodes with 7 vCPU and 8 GiB. 40-minute window.

---
Source: https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-physical-tenants
