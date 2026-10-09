# Red Hat OpenShift Dual-Region — Requirements

- You need access to the [Advanced Cluster Management operator](https://www.redhat.com/en/technologies/management/advanced-cluster-management) and the [Submariner operator](https://catalog.redhat.com/software/container-stacks/detail/5f0c67b7ce85fb9e399f3a12).
- The clusters must be separated by a reasonable latency as outlined in the [installation environment guidelines](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region#installation-environment).
- Each of your OpenShift clusters must meet at least the minimum capacity requirements for a cluster. Refer to the [cluster specification guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift#cluster-specification) for details on resource allocation and infrastructure needs.
- Administrative privileges are required for both clusters to perform configurations and operator deployments.
- A reliable means of communication between the two clusters is necessary. Ensure that each cluster can establish network connections with the other.
- The version of your OpenShift clusters must be included in the [supported versions list](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift#supported-versions).
- Review the [requirements of OpenShift Advanced Cluster Management](https://docs.redhat.com/en/documentation/red_hat_advanced_cluster_management_for_kubernetes/2.12/html/install/installing#installing) if it's not already configured.
- Review the [requirements of OpenShift Submariner](https://docs.redhat.com/en/documentation/red_hat_advanced_cluster_management_for_kubernetes/2.12/html/networking/networking#submariner) if it's not already configured.
- Review the [requirements of Submariner](https://submariner.io/getting-started/#prerequisites) if it's not already configured, especially the flows to open.

### CLI Requirements

In addition to the general prerequisites outlined above, the following CLI tools are required for interacting with the clusters and deploying Camunda 8, these are the same CLI tools required as mentioned in the [OpenShift Guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift#requirements):

- [subctl](https://github.com/submariner-io/subctl) a CLI tool used to interact with [Submariner](https://submariner.io/).

### OpenShift clusters

The architecture of your OpenShift clusters may vary depending on your specific configuration.
This guide assumes a generic deployment on OpenShift. If you are interested in a tested topology, follow the [ROSA Dual-Region Guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/openshift/terraform-setup-dual-region).

#### Cluster requirements

To deploy infrastructure components successfully, it’s essential that the OpenShift clusters you use have a `cluster-admin` role, which grants full privileges within the cluster. This level of access is necessary for the proper setup and configuration of the infrastructure components.

However, **Camunda 8 deployment does not require cluster-admin access**. For the best security practice and to follow the principle of least privilege, it is recommended to deploy Camunda 8 with a **standard, limited user**. This approach helps minimize security risks by restricting unnecessary administrative privileges.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/dual-region
