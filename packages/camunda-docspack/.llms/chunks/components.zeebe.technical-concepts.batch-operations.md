# Batch operations

How distributed batch operations work in Zeebe engine.

When you create a [batch operation](https://docs.camunda.io/docs/next/components/concepts/batch-operations), you provide filter criteria (such as process definition, version, or state) rather than a specific list of instances. The system then:

1. Distributes the operation across all partitions in your cluster
2. Each partition queries the secondary database to find matching instances
3. Executes operations in parallel across partitions
4. Tracks progress and aggregates results

This distributed approach enables efficient processing of large numbers of instances while maintaining cluster performance.
Batch operations execute concurrently with regular partition processing—they do not block it. Just as multiple process instances can run in parallel on the same partition, batch operations process their target instances alongside all other partition activity without interruption.

---
Source: https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/batch-operations
