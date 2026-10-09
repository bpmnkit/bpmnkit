# Install Camunda 8 on an EKS cluster — Architecture

In addition to the infrastructure diagram provided in the [Terraform setup guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup), this section installs Camunda 8 following the architecture described in the [reference architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture).

The architecture includes the following core components:

- **Orchestration Cluster**: Core process execution engine (Zeebe, Operate, Tasklist, and Admin)
- **Management plane**: Design and management tools (Camunda Hub and Management Identity)

To demonstrate how to deploy with a custom domain, the following stack is also included:

- **cert-manager**: Automates TLS certificate management with [Let's Encrypt](https://letsencrypt.org/)
- **external-dns**: Manages DNS record in Route53 for domain ownership confirmation
- **Contour**: Ingress controller backed by the Envoy proxy, providing HTTP/HTTPS load balancing and routing to Kubernetes services

**Note: Single namespace deployment**
This guide uses a single Kubernetes namespace for simplicity, since the deployment uses a single Helm chart. This differs from the [reference architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#camunda-hub-vs-orchestration-cluster), which recommends separating the Orchestration Cluster from the [management plane](https://docs.camunda.io/docs/next/reference/glossary#management-plane) into different namespaces in production to improve isolation and enable independent scaling.

### Secondary storage

This guide supports two [secondary storage](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index) backends. Select a variant using the authentication and values tabs throughout this guide.

| Backend                              | Setup                                                                                                              | Optimize      | Reference architecture                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------- | ------------------------------------------------------- |
| **Elasticsearch/OpenSearch**         | [Managed Amazon OpenSearch Service](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/using-external-opensearch) | Supported     | `eks-single-region` (`eks-single-region-irsa` for IRSA) |
| **RDBMS (Amazon Aurora PostgreSQL)** | [Configure RDBMS in Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms)                               | Not available | `eks-single-region-rdbms`                               |

Optimize requires Elasticsearch or OpenSearch and is not available with the RDBMS backend. For the RDBMS workflow, see the [RDBMS example deployment](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/helm-with-rdbms).

**Note**
Select your backend using the authentication and values tabs throughout this guide. The **RDBMS** tabs configure Amazon Aurora PostgreSQL as secondary storage.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm
