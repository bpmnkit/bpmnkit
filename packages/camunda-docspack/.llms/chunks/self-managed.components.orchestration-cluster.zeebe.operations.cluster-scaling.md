# Cluster scaling

Scale an existing cluster by adding or removing brokers.

Zeebe allows scaling an existing cluster by adding or removing brokers and by adding new partitions. Partitions are automatically redistributed over the set of brokers to spread the load evenly.

Zeebe provides a REST API to manage the cluster scaling. The cluster management API is a custom endpoint available via [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/3.1.x/reference/htmlsingle/#actuator.endpoints). This is accessible via the management port of the Zeebe Gateway.

**Important**

- Partition count can only be increased and not decreased.
- Backups are disallowed during partition scaling but can be taken before or after. A backup taken before scaling can only be restored to a cluster with the same partition count. After restoring, you can request scaling again to the desired partition count.
- When scaling up the number of partitions, consider the resulting RocksDB size per partition. Allocate **at least 32 MB of RocksDB memory per partition** after scaling. For details, see the [resource planning guide](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-self-managed).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/cluster-scaling
