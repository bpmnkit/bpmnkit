# Install Camunda for production with Helm — Prerequisites

Before proceeding with the setup, ensure the following requirements are met:

- **Kubernetes Cluster**: A functioning Kubernetes cluster with kubectl access and block storage persistent volumes for stateful components. This guide will use an AWS EKS cluster for reference. Step-by-step documentation is available to deploy an EKS cluster with [Terraform](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup), and [install Camunda 8](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm).
- **Helm**: Make sure the [Helm CLI v4](https://docs.camunda.io/docs/next/reference/supported-environments#clients) is installed.
- **DNS Configuration**: You must have access to configure DNS for your domain in order to point to the Kubernetes cluster Ingress.
- **TLS Certificates**: Obtain valid X.509 certificates for your domain from a trusted Certificate Authority.
- **External Dependencies**: Provision the following external dependencies:
  - **PostgreSQL-compatible database**: Required for Camunda Hub persistence. This guide uses Amazon Aurora PostgreSQL as an example. For AWS-specific steps, see [Aurora PostgreSQL module setup](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup#postgresql-module-setup).
  - **Secondary storage backend for the Orchestration Cluster**: Choose one option:
    - **Non-SQL**: Elasticsearch/OpenSearch (this guide uses Amazon OpenSearch as the example). For AWS-specific steps, see [OpenSearch](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl#4-opensearch-domain).
    - **RDBMS**: See [configure RDBMS in Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms) and the [RDBMS example deployment](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/helm-with-rdbms).
  - **Identity Provider (IdP)**: An OIDC-compatible identity provider for authentication. See [Authentication and authorization](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/authentication-and-authorization/index) for supported options.

**Tip: No managed services available?**
  If managed PostgreSQL, Elasticsearch, or an external OIDC provider are not available in your organization, you can deploy these infrastructure components on Kubernetes using official operators. See [Required infrastructure](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure) for instructions.

- **Ingress controller**: Ensure an Ingress controller supporting gRPC and HTTP/2 is set up in the cluster. The reference architectures deploy [Contour](https://projectcontour.io/) by choice, but any such controller works, for example Traefik or HAProxy; select yours through `global.ingress.className`. Alternatively, use the [Gateway API](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/gateway-api-setup), which the chart also supports.
- **AWS OpenSearch Snapshot Repository** - To store the backups of the Camunda web applications. This repository must be configured with OpenSearch to take backups which are stored in Amazon S3. See the [official AWS guide](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/managedomains-snapshot-registerdirectory.html) for detailed steps.
- **Amazon S3** - An additional bucket to store backup files of the Orchestration Cluster brokers.
- **Resource Planning**: Make sure you have understood the considerations for [sizing Camunda Clusters](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-your-environment), and have evaluated sufficient CPU, memory, and storage necessary for the deployment.

Ensure all prerequisites are in place to avoid issues during installation or when upgrading in a production environment.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index
