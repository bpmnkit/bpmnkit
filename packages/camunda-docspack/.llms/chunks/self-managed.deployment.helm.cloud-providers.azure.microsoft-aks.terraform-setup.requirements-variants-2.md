# Deploy an AKS cluster with Terraform (advanced) — Requirements — Variants (2)

> **Note:** While open API access simplifies testing and development, production clusters should always restrict API server access to known IP ranges.

AVD-AZU-0013 (CRITICAL): Vault network ACL does not block access by default

#### Reasoning

This finding indicates that your Azure Key Vault network access controls are not configured to deny access by default. This means that unless specifically restricted, traffic can reach your Key Vault from any source.

#### Potential resolution

- Enable the ["Deny" default action](https://learn.microsoft.com/en-us/azure/key-vault/general/how-to-azure-key-vault-network-security) for network ACLs.
- Allow [specific IP ranges or virtual networks](https://learn.microsoft.com/en-us/azure/key-vault/general/how-to-azure-key-vault-network-security).
- Use a [Private Endpoint](https://learn.microsoft.com/en-us/azure/key-vault/general/private-link-service) for Key Vault access.
- Use [service endpoints](https://learn.microsoft.com/en-us/azure/key-vault/general/overview-vnet-service-endpoints) to limit Azure service access.
- Enable [Soft Delete](https://learn.microsoft.com/en-us/azure/key-vault/general/soft-delete-overview) and [Purge Protection](https://learn.microsoft.com/en-us/azure/key-vault/general/soft-delete-overview) for recovery and data safety.

> **Note:** Default deny configurations provide better security posture but may complicate initial setup and testing. For automated testing environments, clearly document these exceptions.

AVD-AZU-0040 (MEDIUM): Cluster does not have logging enabled via OMS Agent

#### Reasoning

This finding indicates that comprehensive logging is not enabled on your Kubernetes cluster using the OMS (Operations Management Suite) Agent. Without proper logging, you have limited visibility into cluster operations, making it difficult to detect and respond to security incidents.

#### Potential resolution

- Enable [Azure Monitor for containers](https://learn.microsoft.com/en-us/azure/azure-monitor/containers/container-insights-overview) on your AKS cluster.
- Configure the [OMS Agent](https://learn.microsoft.com/en-us/azure/azure-monitor/containers/container-insights-onboard#enable-using-azure-resource-manager-template-or-terraforms) to collect container logs and metrics.
- Set up a [Log Analytics workspace](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/log-analytics-workspace-overview) for centralized log storage.
- Create [custom queries and alerts](https://learn.microsoft.com/en-us/azure/azure-monitor/logs/log-analytics-tutorial) based on collected logs.
- Consider implementing [Microsoft Defender for Cloud](https://learn.microsoft.com/en-us/azure/defender-for-cloud/defender-for-containers-introduction) (formerly Azure Security Center) for enhanced monitoring and threat detection.

> **Note:** While disabling logging simplifies testing environments and reduces costs, production environments should always have comprehensive logging enabled. For testing purposes, consider using a shared Log Analytics workspace with appropriate retention policies.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/terraform-setup
