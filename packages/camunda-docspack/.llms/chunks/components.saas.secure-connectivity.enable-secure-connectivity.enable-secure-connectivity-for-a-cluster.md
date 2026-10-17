# Enable secure connectivity — Enable secure connectivity for a cluster

1. Open Camunda Hub.
1. In the left navigation, click **Environments**, and then click **Clusters**.
1. Select a cluster.
1. Open the **Private networking** tab. The **Private networking** tab is available only for clusters hosted in AWS. It is not displayed for clusters hosted in other cloud providers.
1. Select **Activate PrivateLink endpoint service**.

### Allowed principals

1. In **Principal ARN**, enter the ARN of an AWS principal that should be allowed to connect. For supported principal types, see the [AWS documentation on configuring endpoint service permissions](https://docs.aws.amazon.com/vpc/latest/privatelink/configure-endpoint-service.html#add-remove-permissions).
2. Select **Add principal**.
3. Repeat for additional principals as needed.
4. Select **Next**.

Validation requirements for principal ARNs are described in [validation and activation requirements](#validation-and-activation-requirements).

### Supported regions

The AWS region where the Orchestration Cluster is located is always supported and is preselected by default.

You can add additional AWS regions to allow cross-region endpoint connections. Cross-region connectivity may increase network latency and incur additional AWS charges.

1. Review the cluster's AWS region (preselected).
2. Optionally add additional regions to allow cross-region endpoint connections.
3. Select **Activate service**.

After activation, Hub provisions a VPC endpoint service for the cluster and displays the connection details.

---
Source: https://docs.camunda.io/docs/next/components/saas/secure-connectivity/enable-secure-connectivity
