# Red Hat OpenShift Dual-Region — Setup Advanced Cluster Management and Submariner

In order to achieve cross-cluster communication, we use the recommended [Submariner](https://docs.redhat.com/en/documentation/red_hat_advanced_cluster_management_for_kubernetes/2.2/html/manage_cluster/submariner) solution that is designed to securely connect workloads across multiple Kubernetes clusters.

The installation of Submariner on OpenShift differs from the standard installation as it requires the usage of [Red Hat Advanced Cluster Management for Kubernetes](https://www.redhat.com/en/technologies/management/advanced-cluster-management).

**Note: Alternative installations**

You may achieve the same installation without the usage of Red Hat Advanced Cluster Management for Kubernetes, however, this guide will focus on the official supported deployment of Submariner.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region
