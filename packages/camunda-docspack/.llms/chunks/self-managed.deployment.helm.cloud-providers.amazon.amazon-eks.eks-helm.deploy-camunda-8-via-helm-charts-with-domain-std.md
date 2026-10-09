# Install Camunda 8 on an EKS cluster — Deploy Camunda 8 via Helm charts — with-domain-std

The following makes use of the [combined Ingress setup](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/ingress-setup#configuration) by deploying a single Ingress for all HTTP components and a separate Ingress for the gRPC endpoint.

**Info: Cert-manager annotation for domain installation**
The annotation `kubernetes.io/tls-acme=true` will be [interpreted by cert-manager](https://cert-manager.io/docs/usage/ingress/) and automatically results in the creation of the required certificate request, easing the setup.

```yaml reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region/helm-values/values-domain.yml
```

**Danger: Exposure of the Zeebe Gateway Service**
For production-grade security, keep the Zeebe Gateway on a private network (no public Ingress) and access it only from internal workloads or through a secure VPN connection. This limits the attack surface and ensures process and job traffic remain inside your trusted network boundary. See the [VPN module setup](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup#vpn-module-setup) for guidance on establishing secure remote access to a private EKS cluster.

Additionally, implement fine-grained [Kubernetes NetworkPolicies](https://kubernetes.io/docs/concepts/services-networking/network-policies/) to explicitly allow only required internal components to initiate connections to the Zeebe Gateway Service. Deny all other Ingress traffic at the network layer to reduce blast radius if another workload in the cluster is compromised. See [required network traffic](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/production/index#required-network-traffic) for the flows Camunda depends on.

#### Reference the credentials in secrets

Before installing the Helm chart, create Kubernetes secrets to store the database authentication credentials.

To create the secrets, run the following commands:

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region/procedure/create-external-db-secrets.sh
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm
