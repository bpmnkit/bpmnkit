# Zone-aware clusters

With zone awareness, a cluster distributes brokers and partition replicas across zones (regions or availability zones) for resilience.

With zone awareness, an Orchestration Cluster distributes its brokers and partition replicas across multiple zones (regions or availability zones). Spreading replicas across zones lets the cluster survive the loss of an entire zone and bias partition leadership toward a preferred zone.

Zone awareness controls where the application places partition replicas among brokers. It does not control where Kubernetes schedules the broker pods themselves — on Kubernetes, also configure [topology spread constraints](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/pod-scheduling#spread-orchestration-cluster-pods-across-availability-zones) so the broker pods actually land in different zones; without it, brokers assigned to different logical zones can still be scheduled onto nodes in the same physical zone. Configure both together: topology spread constraints put each broker pod in the zone Kubernetes actually schedules it into, and zone awareness places partition replicas according to each broker's assigned zone.

Zone awareness is required for topologies with three or more zones. It also simplifies managing zones: brokers are named after the zone they belong to, so you describe the topology in terms of zones rather than individual numeric node IDs.

Because zones are named explicitly, zone awareness supports topologies that the round-robin numbering strategy cannot express, such as three or more zones. Adding a zone means changing the zone list rather than renumbering every broker. It isn't a configuration-only change, though: existing partitions have to be told about the new zone through the [cluster management API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#add-or-re-add-a-zone).

Zone awareness is also useful in a single-region setup. By mapping zones to availability zones (AZs) and giving one AZ a higher priority, you can skew partition leaders to stay in that AZ. Keeping leaders in one AZ reduces cross-AZ traffic to the single writer instance of a relational database (RDBMS), which lowers the associated cost. This optimization matters less for Elasticsearch, which distributes load across all three zones.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/zone-aware-clusters
