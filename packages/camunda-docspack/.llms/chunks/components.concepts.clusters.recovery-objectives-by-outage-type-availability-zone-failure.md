# Clusters — Recovery objectives by outage type — Availability zone failure

An availability zone (AZ) failure is the loss of an entire zone in the cluster's region, taking every broker hosted there down at once. All cluster types keep three copies of your data, one in each of three availability zones, so losing one zone leaves the cluster fully operational.

**RTO/RPO assessment:** RPO is zero, because the remaining zones already hold every committed record. RTO is near zero. Failover is automatic, doesn't require a restore, and clients recover through their standard retry mechanisms. While the zone is unavailable, the cluster runs with reduced redundancy. A second failure in another zone before recovery can make the cluster unavailable.

**Your responsibilities:** Configure your clients and job workers to retry failed requests. Run job workers across multiple availability zones so that the same outage doesn't disrupt them.

---
Source: https://docs.camunda.io/docs/next/components/concepts/clusters
