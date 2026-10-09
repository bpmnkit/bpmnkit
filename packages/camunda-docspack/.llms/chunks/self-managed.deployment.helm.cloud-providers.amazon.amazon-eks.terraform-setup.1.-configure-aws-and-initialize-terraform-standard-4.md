# Deploy an EKS cluster with Terraform — 1. Configure AWS and initialize Terraform — standard

**Caution: Network based security**
   The standard deployment for OpenSearch relies on the first layer of security, which is the Network.
   While this setup allows easy access, it may expose sensitive data. To enhance security, consider implementing IAM Roles for Service Accounts (IRSA) to restrict access to the OpenSearch cluster, providing a more secure environment.
   For more information, see the [Amazon OpenSearch Service Fine-Grained Access Control documentation](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/fgac.html#fgac-access-policies).

   ```hcl reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region/terraform/cluster/opensearch.tf
   ```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
