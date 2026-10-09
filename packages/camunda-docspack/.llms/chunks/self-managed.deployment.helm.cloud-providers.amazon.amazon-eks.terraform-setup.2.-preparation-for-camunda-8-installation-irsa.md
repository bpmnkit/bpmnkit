# Deploy an EKS cluster with Terraform — 2. Preparation for Camunda 8 installation — irsa

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region-irsa/procedure/export-helm-values.sh
```

**Note: IRSA users**

To authenticate and authorize access to PostgreSQL and OpenSearch, **you do not need to export the PostgreSQL or OpenSearch passwords**, IRSA will handle the authentication.

**However**, you will still need to export the relevant usernames and other settings to Helm.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
