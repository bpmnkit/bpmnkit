# Red Hat OpenShift Dual-Region

Deploy Camunda 8 Self-Managed on Red Hat OpenShift in two regions

This guide is designed to assist users aiming to deploy Camunda 8 in a dual-region setup on Red Hat OpenShift.

The primary goal is to configure and integrate **two OpenShift clusters** for use in the dual-region reference architecture. This setup leverages specific components to address key challenges, and users are encouraged to exercise discretion regarding their use, learn more about [Advanced Cluster Management](https://www.redhat.com/en/resources/advanced-cluster-management-kubernetes-datasheet).
While this guide does not cover exhaustive configurations, it aims to provide the key steps needed to achieve the desired outcome.

To enable intercommunication between regions, we will utilize [ACM Advanced Cluster Management](https://www.redhat.com/en/technologies/management/advanced-cluster-management) and [Submariner](https://docs.redhat.com/en/documentation/red_hat_advanced_cluster_management_for_kubernetes/2.2/html/manage_cluster/submariner). Failover will be managed through DNS configurations, while access to the platform will be ensured via OpenShift Routes.

Additionally, depending on whether your OpenShift clusters are managed on a cloud provider or deployed on-premises, certain aspects of the configuration might require adaptation.

**Caution: Dual-region limits and constraints**

Please review our [dual-region concept documentation](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region) to understand the limitations and constraints of this blueprint before proceeding.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region
