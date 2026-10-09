# Red Hat OpenShift Dual-Region — High Level Design

<!-- The following diagram should be exported as an image and as a PDF from the sources https://miro.com/app/board/uXjVL-6SrPc=/ --->
<!-- To export: click on the frame > "Export Image" > as PDF and as JPG (low res), then save it in the ./assets/ folder --->

_Infrastructure diagram for a OpenShift dual-region setup (click on the image to open the PDF version)_
[![Infrastructure Diagram OpenShift Dual-Region](./assets/openshift-dual-region.jpg)](./assets/openshift-dual-region.pdf)

This High-Level Design describes how the following critical components interact to achieve a Camunda 8 deployment across two regions:

- An S3-compatible solution is used for taking snapshots of the Elasticsearch database.
- A DNS entry with an associated domain is used to enable Camunda 8 failover and reroute traffic from one cluster to the other.
- Firewall and networking components are configured to allow unrestricted communication between the two clusters.
- Local storage is provided on each OpenShift cluster for persistent data requirements.
- A non-overlapping network configuration is implemented on the OpenShift clusters. This is a mandatory requirement, as outlined in the [Submariner overlapping guide](https://submariner.io/0.8/getting-started/architecture/globalnet/).
- [Red Hat OpenShift Advanced Cluster Management](https://www.redhat.com/en/technologies/management/advanced-cluster-management) is used to manage the two clusters and configure Submariner.
- [Submariner](https://docs.redhat.com/en/documentation/red_hat_advanced_cluster_management_for_kubernetes/2.2/html/manage_cluster/submariner) is configured on the two clusters to enable cross-namespace and cross-cluster network communication.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region
