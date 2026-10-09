# Multi-Region RDBMS — Requirements — Network requirements

- Kubernetes clusters, services, and pods must use distinct, non-overlapping CIDRs across every region.
- Every region must reach every other region. Zeebe uses a full mesh, not a hub and spoke, so partial connectivity leaves partitions unable to form a quorum.
- Every other cluster must resolve and reach the Kubernetes services in one cluster. The name must be the same from each region's point of view.
- Round-trip time between regions directly affects Raft commit latency and throughput. As a guideline, keep it at or below **100 ms**. Higher latencies degrade performance, but are not a hard limit enforced by the engine.
- Required open ports between regions:
  - **26500**: Zeebe gateway, client and worker communication
  - **26501** and **26502**: Zeebe broker and gateway communication, including Raft
  - **8080**: Orchestration Cluster REST API
  - **53**: DNS, for cross-cluster service resolution

These are the default ports. Change them if you customize them in your configuration.

A private inter-region network is preferred for the database, but it is not required. A public path also works, and it adds egress cost and exposure. You must measure the latency between the regions, and the inter-region connectivity must stay stable.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms
