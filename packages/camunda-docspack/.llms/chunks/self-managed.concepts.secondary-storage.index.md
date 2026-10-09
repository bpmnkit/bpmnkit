# Secondary storage

Learn how secondary storage works in Camunda Self-Managed environments, how it interacts with the Zeebe engine, and how to configure or manage it effectively.

Camunda uses a layered storage model that separates workflow execution data from data used by web applications and APIs.

If you are designing Physical Tenant isolation, see [Physical Tenant isolation model](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index) for the tenant-level execution and routing boundaries that sit on top of secondary storage.


## About secondary storage

Secondary storage is one of the two complementary layers in Camunda’s data model:

| Layer             | Purpose                                                                                                                           | Technologies you can use    |
| :---------------- | :-------------------------------------------------------------------------------------------------------------------------------- | :-------------------------- |
| Primary storage   | Persists real-time workflow execution state managed by [Zeebe](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/overview). | RocksDB (embedded in Zeebe) |
| Secondary storage | Stores workflow, decision, and task data for querying, visualization, and API access.                                             | Document-store or RDBMS     |

**Note**
Secondary storage is not a duplicate of primary data. It represents exported workflow and decision data optimized for querying and visualization.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index
