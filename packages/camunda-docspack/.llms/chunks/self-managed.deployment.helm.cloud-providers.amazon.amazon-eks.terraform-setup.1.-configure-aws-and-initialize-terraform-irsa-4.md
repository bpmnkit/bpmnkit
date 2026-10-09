# Deploy an EKS cluster with Terraform — 1. Configure AWS and initialize Terraform — irsa

In addition to standard authentication, which uses anonymous users and relies on the network for access control, you can also use [**IRSA (IAM Roles for Service Accounts)**](https://aws.amazon.com/blogs/opensource/introducing-fine-grained-iam-roles-service-accounts/) to securely connect to OpenSearch. IRSA enables your Kubernetes workloads to assume IAM roles without managing AWS credentials directly.

**Note**
   Using IRSA is optional. If you prefer, you can continue using password-based access to your OpenSearch domain.

   If you choose to use IRSA, you'll need to take note of the **IAM role name** created for OpenSearch and the **AWS Account ID**, as these will be required later to annotate the Kubernetes service account.

   ##### OpenSearch IRSA role and policy

   To configure IRSA for OpenSearch, the OpenSearch module uses outputs from the EKS cluster module to define the necessary IAM role and policies.

   Here's an example of how to define the IAM role trust policy and access policy for OpenSearch, this configuration will deploy an OpenSearch domain with advanced security enabled:

   ```hcl reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region-irsa/terraform/cluster/opensearch.tf
   ```

   Once the IRSA configuration is complete, ensure you **record the IAM role name** (from the `iam_opensearch_role_name` configuration), it is required to annotate the Kubernetes service account in the next step.

   As the OpenSearch domain has advanced security enabled and [fine-grained access control](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/fgac.html), we will later use your provided master username (`advanced_security_master_user_name`) and password (`advanced_security_master_user_password`) to perform the initial setup of the security component, allowing the created IRSA role to access the domain.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
