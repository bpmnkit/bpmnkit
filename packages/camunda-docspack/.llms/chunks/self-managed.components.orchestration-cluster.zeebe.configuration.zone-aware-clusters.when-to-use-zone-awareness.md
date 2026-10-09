# Zone-aware clusters — When to use zone awareness

Zone awareness is the recommended approach for new deployments, whether single-region (to skew leaders to a preferred AZ), dual-region, or three or more zones.


## What is a zone?

A zone is a failure domain, typically a cloud region or availability zone, into which brokers are grouped. Each broker declares which zone it belongs to, and the cluster uses that information to:

- Place partition replicas across zones, so no single zone holds all replicas of a partition.
- Assign Raft election priorities per zone, so partition leaders are skewed toward the highest-priority zone.

Compared to using even/odd node ID depending on the zone, zone awareness makes multi-region and multi-AZ setups simpler to configure across all deployment targets (Kubernetes, Amazon ECS, bare metal).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/zone-aware-clusters
