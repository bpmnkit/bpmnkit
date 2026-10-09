# Install Camunda 8 on an EKS cluster — (Optional) Ingress Setup — external-dns

[External-dns](https://github.com/kubernetes-sigs/external-dns) is a Kubernetes add-on that automates the management of DNS records for external resources, such as load balancers or Ingress controllers. It monitors the Kubernetes resources and dynamically updates the DNS provider with the appropriate DNS records.

The following installs `external-dns` in the `external-dns` namespace via Helm. For more configuration options, consult the [Helm chart](https://github.com/kubernetes-sigs/external-dns/tree/master/charts/external-dns).

Consider setting `domainFilters` via `--set` to restrict access to certain hosted zones.

**Tip**
Make sure to have `EXTERNAL_DNS_IRSA_ARN` exported prior by either having followed the [eksctl](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl#policy-for-external-dns) or [Terraform](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup#outputs) guide.

**Danger: Uniqueness of txtOwnerId for DNS**

If you are already running `external-dns` in a different cluster, ensure each instance has a **unique** `txtOwnerId` for the TXT record. Without unique identifiers, the `external-dns` instances will conflict and inadvertently delete existing DNS records.

In the example below, it's set to `external-dns` and should be changed if this identifier is already in use. Consult the [documentation](https://kubernetes-sigs.github.io/external-dns/v0.15.0/#note) to learn more about DNS record ownership.

```shell reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region/procedure/install-external-dns.sh
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm
