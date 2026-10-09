# Deploy an AKS cluster with Terraform (advanced) — Requirements — Variants

This guide supports two secondary storage variants for the Orchestration Cluster. Choose the one that fits your requirements:

| Aspect                 | Elasticsearch                                                                                                                   | RDBMS (PostgreSQL)                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Secondary storage      | [Elasticsearch via ECK Operator](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/operator-based-infrastructure#deploy-elasticsearch) | [Azure Database for PostgreSQL](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms) |
| Optimize               | Supported                                                                                                                       | Not available (requires Elasticsearch)                                                     |
| Infrastructure         | AKS + PostgreSQL + Elasticsearch cluster                                                                                        | AKS + PostgreSQL only (lighter footprint)                                                  |
| Orchestration database | Not required                                                                                                                    | Additional `camunda_orchestration` database                                                |

For more details on secondary storage, see [Secondary storage concepts](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index).

**Note**
Select a variant using the **Elasticsearch**/**RDBMS** tabs throughout this guide. All tabbed sections will switch together automatically.

#### How to choose

- If you need **Optimize** for analytics or prefer the proven Elasticsearch-based setup, choose the **Elasticsearch** variant.
- If you want a **lighter infrastructure** without managing an Elasticsearch cluster and do not need Optimize, choose the **RDBMS** variant. RDBMS secondary storage is available as of Camunda 8.9.

#### Security

The following security considerations were relaxed to streamline adoption and development. These should be reassessed and hardened before deploying to production. The following items were identified using [Trivy](https://trivy.dev/) and can be looked up in the [Aqua vulnerability database](https://avd.aquasec.com/).

These concessions are intentional in this reference infrastructure to simplify onboarding, allow internal-only access, and minimize friction during evaluation. They are not appropriate for production and must be revisited.

This section explains common security findings in Azure deployments and provides guidance on how to address them.

AVD-AZU-0047 (CRITICAL): Security group rule allows unrestricted ingress from any IP address

#### Reasoning

This rule permits inbound traffic from `0.0.0.0/0`, meaning any external source can reach the AKS subnet. It may expose workloads or future public IPs to unsolicited access, increasing the risk of compromise—especially if internal services are misconfigured.

#### Potential resolution

- Restrict incoming traffic to specific IP addresses or CIDR ranges that need access.
- For management access, limit SSH/RDP to your company's IP ranges.
- Use just-in-time access for administrative purposes.
- Implement a bastion host/jump box for secure access.
- Consider using [Azure Private Link](https://learn.microsoft.com/en-us/azure/private-link/private-link-overview) for private connectivity.

> **Note:** This doesn't affect the AKS control plane directly, but still weakens the overall network boundary.

AVD-AZU-0041 (CRITICAL): Cluster does not limit API access to specific IP addresses

#### Reasoning

This finding shows that your Kubernetes cluster's API server is accessible from any IP address. The API server is the control plane for Kubernetes and unrestricted access increases the risk of unauthorized access and potential attacks.

#### Potential resolution

- Configure `authorized_ip_ranges` in `api_server_access_profile` to restrict API server access. ([Review the related documentation](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/kubernetes_cluster#api_server_access_profile)).
- Enable private cluster mode with `private_cluster_enabled = true`. ([Review the related documentation](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/kubernetes_cluster#private_cluster_enabled)).
- Create an `azurerm_private_endpoint` for the AKS Private Link service. ([Review the related documentation](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/private_endpoint)).
- Enable Azure AD–based RBAC via `role_based_access_control { azure_active_directory { ... } }`. ([Review the related documentation](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/kubernetes_cluster#role_based_access_control)).
- Use `azurerm_network_security_group` and `azurerm_network_security_rule` to restrict access to the control-plane subnet. ([NSG](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/network_security_group), [rule](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/network_security_rule)).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/terraform-setup
