# Size clusters with Physical Tenants — Size broker memory

Size native RocksDB memory and Java heap separately. RocksDB memory grows with partition replicas per broker, and Java heap grows with the tenant count.

### Size RocksDB memory

Each partition replica on a broker, leader or follower, needs at least 32 MiB of RocksDB memory, and by default all tenants' replicas share one pool. The broker checks this at startup for every allocation strategy. With the default `FRACTION` strategy:

```text
broker memory × memory-fraction  ≥  partition replicas on the broker × 32 MiB

partition replicas on the broker  =  Σ over tenants (partitions × replication factor) / brokers
```

**Warning**
If the check fails, the broker doesn't start and logs `Expected the allocated memory for RocksDB per partition to be at least 33554432 bytes, but was <bytes> bytes.`

For example, [baseline](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-self-managed#baseline-resource-configuration) brokers with 2 GiB and the default fraction of `0.1` have about 205 MiB, enough for six replicas. With three brokers and three partitions at replication factor three per tenant, each tenant adds three replicas per broker, so a third tenant stops the brokers from starting.

To meet the minimum, raise broker memory, raise `camunda.data.primary-storage.rocksdb.memory-fraction`, change the RocksDB allocation strategy, or add brokers. A higher fraction leaves less memory for the heap and page cache, so raising broker memory is usually safer.

See [memory](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-self-managed#memory) for how these budgets fit together. Disk is a separate budget, covered in [RocksDB](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-self-managed#rocksdb).

### Size Java heap

With RDBMS secondary storage, every broker creates a connection pool and database mapping metadata for every tenant at startup. Heap usage grows with the tenant count, independent of load and broker count. If the heap is too small, brokers run out of memory during startup, so validate heap at your target tenant count.

In an internal test, each tenant held about 4.4 MB of heap, about 700 MB across 160 tenants. The figure covers only the retained database mapping metadata, so treat it as a lower bound. The heap cost per tenant for Elasticsearch or OpenSearch hasn't been measured.

  Heap test configuration

Camunda 8.10 with 160 tenants plus the default tenant, one partition each, replication factor three. 20 brokers with 6 vCPU, 8 GiB memory, and a 2 GiB heap. PostgreSQL behind PgBouncer. Brokers ran out of memory at startup, before any load.

---
Source: https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-physical-tenants
