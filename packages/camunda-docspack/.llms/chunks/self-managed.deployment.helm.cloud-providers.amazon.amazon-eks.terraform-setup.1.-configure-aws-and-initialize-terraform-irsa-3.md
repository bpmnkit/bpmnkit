# Deploy an EKS cluster with Terraform — 1. Configure AWS and initialize Terraform — irsa

In addition to using standard username and password authentication, you can opt to use [**IRSA (IAM Roles for Service Accounts)**](https://aws.amazon.com/blogs/opensource/introducing-fine-grained-iam-roles-service-accounts/) for secure, role-based access to your Aurora database. This method allows your EKS workloads to assume IAM roles without needing to manage AWS credentials directly.

**Note**
   Using IRSA is optional. If preferred, you can continue using traditional password-based authentication for database access.

   If you choose to use IRSA, you'll need to take note of the **IAM role** created for Aurora and the **AWS Account ID**, as these will be used later to annotate the Kubernetes service account.

   ##### Aurora IRSA role and policy

   The Aurora module uses outputs from the EKS cluster module to configure the IRSA role and policy. Below are the required parameters:

   Here's how to define the IAM role trust policy and access policy for Aurora:

   ```hcl reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region-irsa/terraform/cluster/db.tf
   ```

   Once the IRSA configuration is complete, ensure you **record the IAM role name** (from the `iam_aurora_role_name` configuration), it is required to annotate the Kubernetes service account in the next step.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
