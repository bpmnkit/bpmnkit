# Helm chart dual-region operational procedure — Disclaimer

**Caution**

Running a dual-region configuration requires users to detect and manage any regional failures, and implement the operational procedure for failover and failback that matches their environment.


## Prerequisites

- A dual-region Camunda 8 setup installed in two different regions, preferably derived from our [AWS dual-region concept](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region) or [OpenShift dual-region concept](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region).
  - In that guide, we're showcasing Kubernetes dual-region installation, based on the following tools:
    - [Helm](https://helm.sh/docs/intro/install/) for installing and upgrading the [Camunda Helm chart](https://artifacthub.io/packages/helm/camunda/camunda-platform).
    - [Kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl) to interact with the Kubernetes cluster.
- `cURL` or similar to interact with the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
