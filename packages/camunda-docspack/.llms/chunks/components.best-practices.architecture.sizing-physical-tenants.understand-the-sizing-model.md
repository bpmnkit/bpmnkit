# Size clusters with Physical Tenants — Understand the sizing model

Tenants share brokers, gateways, and actor threads, but each tenant brings its own partitions, exporters, and secondary storage connections. The default tenant counts as a tenant in every formula on this page.

```mermaid
graph TD
    subgraph broker["Each broker"]
        rocks["RocksDB pool\ngrows with partition replicas"]
        heap["Java heap\ngrows with tenant count"]
        subgraph tenants["Per tenant, on every broker"]
            pool["Connection pool"]
            meta["Database mapping metadata"]
        end
    end
    pool --> db["Secondary storage\ngrows with combined tenant load"]

    classDef shared fill:#e4eef8,stroke:#2272c9,color:#14082c
    classDef tenant fill:#fde8da,stroke:#fc5d0d,color:#14082c
    classDef storage fill:#e8fdf1,stroke:#10c95d,color:#14082c

    class rocks,heap shared
    class tenants,pool,meta tenant
    class db storage
```

| Resource                                    | Scales with                                                      |
| :------------------------------------------ | :--------------------------------------------------------------- |
| Engine CPU, replication, and broker disk    | Total partitions and throughput across all tenants               |
| RocksDB memory (native)                     | Partition replicas per broker, across all tenants                |
| Java heap (RDBMS)                           | Tenant count, on every broker, regardless of partition placement |
| RDBMS connections                           | Brokers × tenants × pool size                                    |
| Secondary storage capacity                  | Combined load of all tenants that share an instance or cluster   |
| Elasticsearch/OpenSearch indices and shards | Tenants that share a cluster, each with its own index prefix     |
| CPU throttling and thread count             | Tenant count, because each adds stream processors and exporters  |

To see which infrastructure tenants share, read [what is not isolated](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index#what-is-not-isolated).

---
Source: https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-physical-tenants
