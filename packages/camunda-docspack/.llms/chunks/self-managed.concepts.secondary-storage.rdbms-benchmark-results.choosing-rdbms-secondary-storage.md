# RDBMS benchmarking results — Choosing RDBMS secondary storage

Choose RDBMS secondary storage when:

- You already operate relational databases at scale.
- You prefer operational consistency with existing database tooling.
- Workloads are low-to-moderate and read/query pressure is manageable.

Prefer Elasticsearch/OpenSearch when:

- You need high-throughput, high-volume execution at scale.
- You rely on heavy filtering/sorting/search workloads.
- You require Optimize without introducing a second storage technology.


## Caveats and interpretation guidance

- These results are from controlled benchmark scenarios and should not be interpreted as guaranteed production numbers.
- Results can change as product and exporter optimizations evolve.
- Always validate final sizing with production-like workload tests.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/rdbms-benchmark-results
