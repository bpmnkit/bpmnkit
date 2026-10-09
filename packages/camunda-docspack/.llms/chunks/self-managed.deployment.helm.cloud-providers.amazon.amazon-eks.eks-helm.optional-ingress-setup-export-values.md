# Install Camunda 8 on an EKS cluster — (Optional) Ingress Setup — Export Values

Set the following values for your Ingress configuration:

```shell reference
https://github.com/camunda/camunda-deployment-references/blob/main/generic/kubernetes/single-region/procedure/export-ingress-setup-vars.sh
```

Additionally, obtain these values by following the guide for either [eksctl](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl) or [Terraform](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup), as they will be needed in later steps:

- `EXTERNAL_DNS_IRSA_ARN`
- `CERT_MANAGER_IRSA_ARN`
- `REGION`

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm
