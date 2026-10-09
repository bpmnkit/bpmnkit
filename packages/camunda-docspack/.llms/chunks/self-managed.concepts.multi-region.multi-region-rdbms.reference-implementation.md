# Multi-Region RDBMS — Reference implementation

Camunda publishes one implementation of this architecture, on Amazon Web Services:

- [Multi-region setup with RDBMS on Amazon EKS](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms) deploys three EKS clusters connected by AWS Transit Gateway. It uses Submariner for cross-cluster service discovery and Aurora Global Database as secondary storage.
- [Multi-Region RDBMS operational procedure](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/multi-region-rdbms-ops) covers region loss, failback, and adding a region.

The architecture is not AWS-specific. Each of its three layers has an equivalent on other platforms. For example, Red Hat OpenShift provides Submariner through Advanced Cluster Management, as the [OpenShift dual-region setup](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region) already uses.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms
