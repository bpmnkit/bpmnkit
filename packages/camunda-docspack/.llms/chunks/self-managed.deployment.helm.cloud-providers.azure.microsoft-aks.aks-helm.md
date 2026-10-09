# Install Camunda 8 on an AKS cluster

Set up your Camunda 8 environment with Helm on Azure Kubernetes Service.

This guide provides a comprehensive walkthrough for installing the Camunda 8 Helm chart on your existing Azure Kubernetes Service (AKS) cluster and confirming that it is working as intended.


## Requirements

- A Kubernetes cluster; refer to the [Terraform guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/terraform-setup) for details.
- [Helm CLI v4](https://helm.sh/docs/intro/install/) (recommended; see [supported versions](https://docs.camunda.io/docs/next/reference/supported-environments#clients)).
- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl) to interact with the cluster.
- [jq](https://jqlang.github.io/jq/download/) to interact with some variables.
- [GNU envsubst](https://www.man7.org/linux/man-pages/man1/envsubst.1.html) to generate manifests.
- A namespace to host Camunda; in this guide we will reference `camunda` as the target namespace.
- (optional) Custom domain name/[DNS zone](https://learn.microsoft.com/en-us/azure/dns/dns-zones-records) in Azure DNS. This allows you to expose Camunda 8 endpoints and connect via community-supported [zbctl](https://github.com/camunda-community-hub/zeebe-client-go/blob/main/cmd/zbctl/zbctl.md) or [Camunda Modeler](https://camunda.com/download/modeler/).
- (optional) Permissions to install Kubernetes operators (cluster-admin or equivalent) to deploy infrastructure services such as Elasticsearch, PostgreSQL, and Keycloak. This guide installs them directly from source to provide full control over versions and configuration.
  For the tool versions used, check the [.tool-versions](https://github.com/camunda/camunda-deployment-references/blob/main/.tool-versions) file in the related repository. This contains an up-to-date list of versions we also use for testing.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/aks-helm
