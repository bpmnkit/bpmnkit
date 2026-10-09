# IAM Roles for Service Accounts (IRSA) — Instance Metadata Service (IMDS)

[Instance Metadata Service](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html) is a default fallback for the AWS SDK due to the [default credentials provider chain](https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/credentials-chain.html). Within the context of Amazon EKS, it means a pod will automatically assume the role of a node. This can hide many problems, including whether IRSA was set up correctly or not, since it will fall back to IMDS in case of failure and hide the actual error.

If nothing within your cluster relies on the implicit node role, Camunda recommends disabling it by configuring the `http_put_response_hop_limit` to 1. This decreases the default value from two to one, so pods are not allowed to assume the role of the node.

### Configure IMDS hop limit

**For new node groups** that use a Terraform module such as the [Amazon EKS module](https://registry.terraform.io/modules/terraform-aws-modules/eks/aws/latest), you can define the following:

```json
eks_managed_node_group_defaults {
    metadata_options = {
        http_put_response_hop_limit = 1
    }
}
```

**Note: Enabled by default in the terraform reference architecture of EKS**

In the [reference architecture with terraform](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup), this setting is configured like that by default.

**For existing worker node instances**, you can modify the hop limit using the AWS CLI:

```bash
aws ec2 modify-instance-metadata-options \
    --instance-id <instance-id> \
    --http-put-response-hop-limit 1
```

Replace `<instance-id>` with your actual EC2 instance ID. You'll need to run this command for each worker node in your cluster.

More details can be found in the [AWS documentation on modifying IMDS for existing instances](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-IMDS-existing-instances.html#modify-PUT-response-hop-limit).

Overall, this will disable the role assumption of the node for the Kubernetes pod.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/irsa
