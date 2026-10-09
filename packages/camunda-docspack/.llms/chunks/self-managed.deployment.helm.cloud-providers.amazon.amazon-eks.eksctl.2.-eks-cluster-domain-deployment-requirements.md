# Deploy an EKS cluster with eksctl — 2. EKS cluster — Domain deployment requirements

If you plan to deploy Camunda using an external domain associated with an external certificate, you will need to set up some IAM policies to allow both **external-dns** and **cert-manager** to interact with Route 53, which controls the DNS.

By default, the cluster uses **Pod Identity** to manage IAM roles for your applications. This means that service accounts are associated with IAM roles, allowing your pods to securely access AWS resources without hardcoding credentials. For more information on configuring Pod Identity, refer to the [AWS documentation](https://docs.aws.amazon.com/eks/latest/userguide/pod-identities.html).

#### Enable OIDC and IAM roles for Service Accounts (IRSA)

To [enable OpenID Connect (OIDC) and IAM Roles for Service Accounts (IRSA)](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html) on your cluster, complete the following steps:

1. Determine the OIDC issuer ID for your cluster.

   First, ensure that your EKS cluster is set up with an OIDC provider. The following command should show you the OIDC issuer:

   ```bash
   export oidc_id=$(aws eks describe-cluster --name "$CLUSTER_NAME" --query "cluster.identity.oidc.issuer" --output text | cut -d '/' -f 5)
   echo "$oidc_id"
   ```

   Determine whether an IAM OIDC provider with your cluster’s issuer ID is already in your account:

   ```bash
   aws iam list-open-id-connect-providers | grep $oidc_id | cut -d "/" -f4
   ```

   If output is returned, an IAM OIDC provider is already set up for your cluster, so you can skip the next step. If no output is returned, you will need to set up an IAM OIDC provider for your cluster.

1. Create an IAM OIDC identity provider for your cluster with the following command:

   ```bash
   eksctl utils associate-iam-oidc-provider --region "$REGION" --cluster "$CLUSTER_NAME" --approve
   ```

#### Policy for external-dns

The following instructions are based on the [external-dns](https://github.com/kubernetes-sigs/external-dns/blob/master/docs/tutorials/aws.md) guide concerning the AWS setup and only covers the required IAM setup. The Helm chart will be installed in the [follow-up guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm).

The following relies on the previously mentioned feature around IAM Roles for Service Accounts (IRSA) to simplify the external-dns setup.

The IAM policy document below allows external-dns to update Route53 resource record sets and hosted zones. You need to create this policy in AWS IAM first. In our example, we will call the policy `AllowExternalDNSUpdates`.

You may fine-tune the policy to permit updates only to explicit Hosted Zone IDs.

```shell
cat <<EOF >./policy-dns.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["route53:ChangeResourceRecordSets"],
      "Resource": ["arn:aws:route53:::hostedzone/*"]
    },
    {
      "Effect": "Allow",
      "Action": [
        "route53:ListHostedZones",
        "route53:ListResourceRecordSets",
        "route53:ListTagsForResource"
      ],
      "Resource": ["*"]
    }
  ]
}
EOF
```

Create AWS IAM policy with the AWS CLI:

```shell
aws iam create-policy --policy-name "AllowExternalDNSUpdates" --policy-document file://policy-dns.json

# example: arn:aws:iam::XXXXXXXXXXXX:policy/AllowExternalDNSUpdates
export EXTERNAL_DNS_POLICY_ARN=$(aws iam list-policies \
 --query 'Policies[?PolicyName==`AllowExternalDNSUpdates`].Arn' \
 --output text)

echo "EXTERNAL_DNS_POLICY_ARN=$EXTERNAL_DNS_POLICY_ARN"
```

The `EXTERNAL_DNS_POLICY_ARN` will be used in the next step to create a role mapping between the Kubernetes Service Account and AWS IAM Service Account.

Use `eksctl` to create the required role mapping for external-dns:

```shell
eksctl create iamserviceaccount \
  --cluster $CLUSTER_NAME \
  --name "external-dns" \
  --namespace "external-dns" \
  --attach-policy-arn $EXTERNAL_DNS_POLICY_ARN \
  --role-name="external-dns-irsa" \
  --role-only \
  --approve
```

```shell
export EXTERNAL_DNS_IRSA_ARN=$(aws iam list-roles \
  --query "Roles[?RoleName=='external-dns-irsa'].Arn" \
  --output text)

echo "EXTERNAL_DNS_IRSA_ARN=$EXTERNAL_DNS_IRSA_ARN"
```

The variable `EXTERNAL_DNS_IRSA_ARN` contains the `arn` (it should look like this: `arn:aws:iam::XXXXXXXXXXXX:role/external-dns-irsa`).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl
