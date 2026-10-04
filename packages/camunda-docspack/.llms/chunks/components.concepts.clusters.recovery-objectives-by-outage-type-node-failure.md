# Clusters — Recovery objectives by outage type — Node failure

A node failure is the loss of a single Zeebe broker or [secondary storage](https://docs.camunda.io/docs/next/reference/glossary#secondary-storage) node within a cluster. Camunda SaaS clusters replicate each partition across multiple brokers, typically one broker per availability zone. When a single broker fails, the remaining brokers take over its partitions automatically, without data loss. Secondary storage is managed by Camunda and also replicated, so losing a single secondary storage node doesn't lose data. To learn more, see [clustering](https://docs.camunda.io/docs/next/components/zeebe/technical-concepts/clustering).

**RTO/RPO assessment:** RPO is zero, because every committed record is already stored on the remaining nodes. RTO is near zero, and clients recover through their standard retry mechanisms.

**Your responsibilities:** Configure your clients and job workers to retry failed requests. Run job workers across multiple availability zones so that the same outage doesn't disrupt them.

---
Source: https://docs.camunda.io/docs/next/components/concepts/clusters
