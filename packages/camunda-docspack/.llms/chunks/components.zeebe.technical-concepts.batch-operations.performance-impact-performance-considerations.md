# Batch operations — Performance impact — Performance considerations

**During batch creation:**

- RocksDB storage impact from batch metadata
- Memory usage for operation state management

**During initialization:**

- Heavy querying of the secondary database
- Network bandwidth usage for query results
- Partition coordination overhead

**During execution:**

- Command processing load shared with regular operations
- Potential backpressure on high-throughput scenarios
- Resource contention with live process instances

#### Best practices

- **Timing**: Schedule large batch operations during low-traffic periods
- **Sizing**: Break very large operations into smaller batches
- **Monitoring**: Watch cluster performance metrics during batch execution
- **Filtering**: Use precise filters to minimize unnecessary processing

**Warning**
Large batch operations can temporarily impact cluster performance, especially during initialization when partitions query the secondary database individually and in parallel.

**Warning**
Heavy querying of the secondary database can notably affect its performance, especially for large batches with broad filters.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/batch-operations
