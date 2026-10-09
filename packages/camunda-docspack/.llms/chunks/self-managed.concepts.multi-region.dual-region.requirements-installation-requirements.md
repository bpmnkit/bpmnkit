# Dual-Region — Requirements — Installation requirements

To install with the Helm chart, you need two Kubernetes clusters.

**Note: Database support**
Dual-region configurations don't support OpenSearch or RDBMS (relational database) secondary storage.

#### Network requirements

- Kubernetes clusters, services, and pods must use distinct, non-overlapping CIDRs to avoid routing issues.
- Both regions must be able to communicate with each other (for example, via VPC peering). See the [example AWS EKS implementation](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region).
  - Kubernetes services in one cluster must be resolvable and reachable from the other cluster and vice-versa:
    - For AWS EKS, configure DNS chaining. See the [Amazon EKS setup guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region).
    - For OpenShift, use [Submariner](https://docs.redhat.com/en/documentation/red_hat_advanced_cluster_management_for_kubernetes/2.11/html/networking/networking#submariner) for multi-cluster networking. See the [OpenShift dual-region setup guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region).
- Network round-trip time (**RTT**) between regions directly affects Raft commit latency and throughput. As a guideline, keep RTT at or below **100 ms**. Higher latencies degrade performance, but are not a hard limit enforced by the engine.
- Required open ports between regions:
  - **9200**: Elasticsearch (cross-region data pushed by Zeebe)
  - **26500**: Zeebe Gateway (client/worker communication)
  - **26501** and **26502**: Zeebe broker and Zeebe Gateway communication

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region
