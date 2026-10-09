# Install Camunda 8 on an AKS cluster — Deploy Camunda 8 via Helm charts — rdbms

The RDBMS values file disables Elasticsearch and Optimize, and configures PostgreSQL as the secondary storage for the orchestration cluster:

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/azure/kubernetes/aks-single-region-rdbms/helm-values/values-domain.yml
```

**Danger: Exposure of the Zeebe Gateway Service**

For secure operation, do not publicly expose the Zeebe Gateway Service. Keep it reachable only within your Azure Virtual Network (for example, by deploying it without a public Ingress) and access it from internal services or over a private network extension such as an Azure VPN or ExpressRoute connection. This reduces external attack surface while preserving controlled operational access.

Additionally, implement fine-grained [Kubernetes NetworkPolicies](https://kubernetes.io/docs/concepts/services-networking/network-policies/) to explicitly allow only required internal components to initiate connections to the Zeebe Gateway Service. Deny all other Ingress traffic at the network layer to reduce blast radius if another workload in the cluster is compromised. See [required network traffic](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index#required-network-traffic) for the flows Camunda depends on.

#### Reference the credentials in secrets

Before installing the Helm chart, create Kubernetes secrets to store the database authentication credentials.

To create the secrets, run the following commands:

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/azure/microsoft-aks/aks-helm
