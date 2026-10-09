# Deploy an EKS cluster with eksctl — 2. EKS cluster — (Optional) IAM access management

Kubernetes access is divided into two distinct layers. The **first layer** involves **AWS IAM permissions**, which enable basic Amazon EKS functionalities such as using the Amazon EKS UI and generating Amazon EKS access through the AWS CLI. The **second layer** provides **cluster access**, determining the user's permissions within the Kubernetes cluster.

As a result, we must initially grant the user adequate AWS IAM permissions and subsequently assign them a specific role within the Kubernetes cluster for proper access management.

<!-- Multiline code not supported in raw HTML. Classes are automatically injected by Docusaurus) -->

  First Layer: IAM Permissions
  

A minimum set of permissions is required to gain access to an Amazon EKS cluster. These two permissions allow a user to execute `aws eks update-kubeconfig` to update the local `kubeconfig` with cluster access to the Amazon EKS cluster.

The policy should look as follows and can be restricted further to specific Amazon EKS clusters if required:

```json
cat <<EOF >./policy-eks.json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "eks:DescribeCluster",
                "eks:ListClusters"
            ],
            "Resource": "*"
        }
    ]
}
EOF
```

Via the AWS CLI, you can run the following to create the policy above in IAM.

```shell
aws iam create-policy --policy-name "BasicEKSPermissions" --policy-document file://policy-eks.json
```

The created policy `BasicEKSPermissions` has to be assigned to a group, a role, or a user to work. Consult the [AWS documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_manage-attach-detach.html#add-policy-cli) to find the correct approach for you.

  

<!-- Multiline code not supported in raw HTML. Classes are automatically injected by Docusaurus) -->

  Second Layer: Cluster Access
  

By default, the user creating the Amazon EKS cluster has admin access. To allow other users to access it, we have to adjust the `aws-auth` configmap. This can either be done manually via `kubectl` or via `eksctl`. In the following sections, we explain how to do this.

#### eksctl

With `eksctl`, you can create an AWS IAM user to Kubernetes role mapping with the following command:

```shell
eksctl create iamidentitymapping \
  --cluster=$CLUSTER_NAME \
  --region=$REGION \
  --arn arn:aws:iam::0123456789:user/ops-admin \
  --group system:masters \
  --username admin
```

- `arn` is the identifier of your user.
- `group` is the Kubernetes role and as an example `system:masters` is a Kubernetes group for the admin role.
- `username` is either the username itself or the role name. It can also be any arbitrary value as it is used for the audit logs to identify the operation owner.

Example:

```shell
eksctl create iamidentitymapping \
  --cluster=$CLUSTER_NAME \
  --region=$REGION \
  --arn arn:aws:iam::0123456789:user/ops-admin \
  --group system:masters \
  --username admin
```

More information about usage and other configuration options can be found in the [eksctl documentation](https://eksctl.io/usage/iam-identity-mappings/).

#### kubectl

The same can also be achieved by using `kubectl` and manually adding the mapping as part of the `mapRoles` or `mapUsers` section.

```shell
kubectl edit configmap aws-auth -n kube-system
```

For detailed examples, review the [documentation provided by AWS](https://docs.aws.amazon.com/eks/latest/userguide/auth-configmap.html).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl
