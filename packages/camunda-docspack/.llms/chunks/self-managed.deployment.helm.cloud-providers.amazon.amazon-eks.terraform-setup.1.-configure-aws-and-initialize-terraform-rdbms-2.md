# Deploy an EKS cluster with Terraform — 1. Configure AWS and initialize Terraform — rdbms

The RDBMS variant uses the same cluster module as the standard variant, so this `cluster.tf` is identical to the standard one:

   ```hcl reference
   https://github.com/camunda/camunda-deployment-references/blob/main/aws/kubernetes/eks-single-region/terraform/cluster/cluster.tf
   ```

   
   

1. Configure user access to the cluster. By default, the user who creates the Amazon EKS cluster has administrative access.

   
     Grant cluster access to other users
     

   If you want to grant access to other users, you can configure this by using the `access_entries` input.

   Amazon EKS access management is divided into two distinct layers:
   - The **first layer** involves **AWS IAM permissions**, which allow basic Amazon EKS functionalities such as interacting with the Amazon EKS UI and generating EKS access through the AWS CLI. The module handles this part for you by creating the necessary IAM roles and policies.

   - The **second layer** controls **cluster access** within Kubernetes, defining the user's permissions inside the cluster (for example, policy association). This can be configured directly through the module's `access_entries` input.

   To manage user access, use the `access_entries` configuration:

   ```hcl
   access_entries = {
     example = {
       kubernetes_groups = []
       principal_arn     = "<arn>"

       policy_associations = {
         example = {
           policy_arn   = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSViewPolicy"
           access_scope = {
             namespaces = ["default"]
             type       = "namespace"
           }
         }
       }
     }
   }
   ```

   In this configuration:
   - Replace `principal_arn` with the ARN of the IAM user or role.
   - Use `policy_associations` to define policies for fine-grained access control.

   For a full list of available policies, refer to the [AWS EKS Access Policies documentation](https://docs.aws.amazon.com/eks/latest/userguide/access-policies.html).

   
   

1. Customize the cluster setup. The module offers various input options that allow you to further customize the cluster configuration. For a comprehensive list of available options and detailed usage instructions, refer to the [EKS module documentation](https://github.com/camunda/camunda-deployment-references/blob/main/aws/modules/eks-cluster/README.md).

**Note: Private cluster**

   By default, this cluster is accessible from the internet.
   To restrict access, set `private_vpc = true`. This creates a private cluster that is only accessible through the [private subnets](https://docs.aws.amazon.com/vpc/latest/userguide/configure-subnets.html) of your VPC. Optionally, you can expose a public Ingress by setting the `expose_public_elb` variable in the EKS module.

   ⚠️ Because private subnets are not reachable from the internet, you must connect your network to the cluster using either a [bastion host](https://docs.aws.amazon.com/mwaa/latest/userguide/tutorials-private-network-bastion.html) or a Client VPN.

   See the [VPN module setup](#vpn-module-setup) to configure an [AWS Client VPN endpoint](https://docs.aws.amazon.com/vpn/latest/clientvpn-admin/cvpn-getting-started.html) for secure access to the private cluster.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
