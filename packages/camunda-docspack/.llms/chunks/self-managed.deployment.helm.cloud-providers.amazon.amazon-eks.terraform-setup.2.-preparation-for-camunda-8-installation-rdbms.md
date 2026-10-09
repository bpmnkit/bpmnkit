# Deploy an EKS cluster with Terraform — 2. Preparation for Camunda 8 installation — rdbms

The RDBMS variant exports the orchestration database variables.

```bash reference
https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region-rdbms/procedure/export-helm-values.sh
```

  

Ensure that you use the actual values you passed to the Terraform module during the setup of PostgreSQL and OpenSearch.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
