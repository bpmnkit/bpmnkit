# Batch operations — Lifecycle management

Batch operations support several lifecycle management operations:

### Suspend and resume

- **Suspend**: Temporarily stops execution of a running batch operation
- **Resume**: Restarts execution of a suspended batch operation
- Operations can be suspended during initialization or execution phases

### Cancel

- **Cancel**: Permanently stops a batch operation
- Cannot be resumed once canceled
- Partially processed items remain in their modified state


## Batch operations in distributed clusters

![distributed-batch-operation](assets/batch-operation.png)

Zeebe clusters are distributed systems with multiple brokers and partitions. Each partition manages a subset of process instances.

When a batch operation starts:

1. The batch operation (command + filter) is created and distributed to all partitions.
2. Each partition processes the batch independently:
   - It uses the filter to query relevant process instances from the secondary database.
   - It applies the batch command to each matched instance.
3. After all partitions finish, the final statuses are collected, and the batch is marked `COMPLETED`.

This distributed, asynchronous approach allows parallel processing of many process instances.

### Important considerations

#### Partition independence

Each partition fetches and processes matching instances independently.  
 At the start of very large batches, the total number of known items may vary until all partitions finish fetching.  
 This is due to multiple paged queries to the secondary database.

#### Leader-follower coordination

The leader partition coordinates the overall operation status while follower partitions focus on execution.  
 Inter-partition communication ensures consistent final status reporting.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/batch-operations
