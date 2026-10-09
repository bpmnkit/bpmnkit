# Kubernetes deployment overview — Reference implementations

This section includes reference deployment architectures:

### Amazon EKS

- [Amazon EKS single-region](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup): Standard production setup.
- [Amazon EKS dual-region](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region): Advanced multi-region setup.
- [Amazon EKS multi-region with RDBMS](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/multi-region-rdbms): Three or more regions with relational secondary storage, so a region loss does not stop processing.

### Red Hat OpenShift on AWS (ROSA)

- [ROSA single-region](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/openshift/terraform-setup): Standard production setup.
- [ROSA dual-region](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/openshift/terraform-setup-dual-region): Advanced multi-region setup.

### Microsoft Azure

- [Microsoft AKS single-region](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/terraform-setup): Standard production setup.

For common issues and mitigation strategies, refer to the [deployment troubleshooting guide](https://docs.camunda.io/docs/next/self-managed/operational-guides/troubleshooting).

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/kubernetes
