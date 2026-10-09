# Install Camunda 8 on an AKS cluster — Architecture

In addition to the infrastructure diagram provided in the [Terraform setup guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/terraform-setup), this section installs Camunda 8 following the architecture described in the [reference architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture).

The architecture includes the following core components:

- **Orchestration Cluster**: Core process execution engine (Zeebe, Operate, Tasklist, and Admin)
- **Management plane**: Design and management tools (Camunda Hub and Management Identity)

To demonstrate how to deploy with a custom domain, the following stack is also included:

- **cert-manager**: Automates TLS certificate management with [Let's Encrypt](https://letsencrypt.org/)
- **external-dns**: Manages DNS records in Azure DNS for domain ownership confirmation
- **Contour**: Ingress controller backed by the Envoy proxy, providing HTTP/HTTPS load balancing and routing to Kubernetes services

**Note: Single namespace deployment**
This guide uses a single Kubernetes namespace for simplicity, since the deployment uses a single Helm chart. This differs from the [reference architecture](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#camunda-hub-vs-orchestration-cluster), which recommends separating the Orchestration Cluster from the [management plane](https://docs.camunda.io/docs/next/reference/glossary#management-plane) into different namespaces in production to improve isolation and enable independent scaling.

### Considerations

While this guide is primarily tailored for UNIX systems, it can also be run under Windows by utilizing the [Windows Subsystem for Linux](https://learn.microsoft.com/windows/wsl/about).

Multi-tenancy is disabled by default and is not covered further in this guide. If you decide to enable it, you may use the same PostgreSQL instance and add an extra database for multi-tenancy purposes.

[Workload Identities](https://learn.microsoft.com/en-us/azure/aks/workload-identity-overview) offer a way to connect to Azure-managed PostgreSQL. This is not yet supported by Camunda.

### Secondary storage

This guide supports two [secondary storage](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index) backends. If you have not chosen a variant yet, refer to the [Terraform setup guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/terraform-setup#variants) for details.

| Variant           | Secondary storage                                                                                                      | Optimize      | Reference architecture    |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------- |
| **Elasticsearch** | [Elasticsearch via ECK](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#deploy-elasticsearch) | Supported     | `aks-single-region`       |
| **RDBMS**         | [Azure Database for PostgreSQL](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms)                             | Not available | `aks-single-region-rdbms` |

**Note**
Select a variant using the **Elasticsearch**/**RDBMS** tabs throughout this guide. All tabbed sections will switch together automatically.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/aks-helm
