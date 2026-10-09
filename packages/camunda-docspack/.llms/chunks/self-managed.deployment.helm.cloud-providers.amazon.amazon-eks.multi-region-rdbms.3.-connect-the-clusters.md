# Multi-region setup with RDBMS (EKS) — 3. Connect the clusters

Two layers connect the regions, and they have different jobs:

- **Transit Gateway**: carries the traffic.
- **Submariner**: publishes service names across clusters.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms
