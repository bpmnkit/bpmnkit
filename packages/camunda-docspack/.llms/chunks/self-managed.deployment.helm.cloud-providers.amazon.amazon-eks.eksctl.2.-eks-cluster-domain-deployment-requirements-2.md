# Deploy an EKS cluster with eksctl — 2. EKS cluster — Domain deployment requirements (2)

Alternatively, you can deploy the Helm chart first and then use `eksctl` with the option `--override-existing-serviceaccounts` instead of `--role-only` to reconfigure the created service account.

#### Policy for cert-manager

The following instructions are taken from the [cert-manager](https://cert-manager.io/docs/configuration/acme/dns01/route53/) guide concerning the AWS setup and only covers the required IAM setup. The Helm chart will be installed in the [follow-up guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm).

The following relies on the previously mentioned feature around IAM Roles for Service Accounts (IRSA) to simplify the cert-manager setup.

The IAM policy document below allows cert-manager to update Route53 resource record sets and hosted zones. You need to create this policy in AWS IAM first. In our example, we call the policy `AllowCertManagerUpdates`.

If you prefer, you may fine-tune the policy to permit updates only to explicit Hosted Zone IDs.

```shell
cat <<EOF >./policy-cert.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "route53:GetChange",
      "Resource": "arn:aws:route53:::change/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "route53:ChangeResourceRecordSets",
        "route53:ListResourceRecordSets"
      ],
      "Resource": "arn:aws:route53:::hostedzone/*"
    },
    {
      "Effect": "Allow",
      "Action": "route53:ListHostedZonesByName",
      "Resource": "*"
    }
  ]
}
EOF
```

Create AWS IAM policy with the AWS CLI:

```shell
aws iam create-policy --policy-name "AllowCertManagerUpdates" --policy-document file://policy-cert.json

# example: arn:aws:iam::XXXXXXXXXXXX:policy/AllowCertManagerUpdates
export CERT_MANAGER_POLICY_ARN=$(aws iam list-policies \
 --query 'Policies[?PolicyName==`AllowCertManagerUpdates`].Arn' \
 --output text)

echo "CERT_MANAGER_POLICY_ARN=$CERT_MANAGER_POLICY_ARN"
```

The `CERT_MANAGER_POLICY_ARN` is used in the next step to create a role mapping between the Amazon EKS Service Account and the AWS IAM Service Account.

Use `eksctl` to create the required role mapping for cert-manager:

```shell
eksctl create iamserviceaccount \
  --cluster=$CLUSTER_NAME \
  --name="cert-manager" \
  --namespace="cert-manager" \
  --attach-policy-arn=$CERT_MANAGER_POLICY_ARN \
  --role-name="cert-manager-irsa" \
  --role-only \
  --approve
```

```shell
export CERT_MANAGER_IRSA_ARN=$(aws iam list-roles \
  --query "Roles[?RoleName=='cert-manager-irsa'].Arn" \
  --output text)

echo "CERT_MANAGER_IRSA_ARN=$CERT_MANAGER_IRSA_ARN"
```

The variable `CERT_MANAGER_IRSA_ARN` will contain the `arn` (it should look like this: `arn:aws:iam::XXXXXXXXXXXX:role/cert-manager-irsa`).

Alternatively, you can deploy the Helm chart first and then use `eksctl` with the option `--override-existing-serviceaccounts` instead of `--role-only` to reconfigure the created service account.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl
