# Deploy an EKS cluster with Terraform — Requirements — Considerations

#### General considerations

This setup provides a solid starting point for running Camunda 8 on AWS. It is not optimized for peak performance. Use it as a foundation you can extend and adapt for production with [Infrastructure as Code (IaC) tools](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/infrastructure-as-code).

If Terraform feels complex at first, try the [eksctl guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl) for a simpler entry point, which shows the resources created and how they interact with each other.

- To test or develop against Camunda 8, consider signing up for our [SaaS offering](https://camunda.com/platform/).
- If you already have an Amazon EKS cluster, skip ahead to the [Helm setup guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm) to deploy Camunda 8.

#### Security considerations

The following security considerations were flagged by [Trivy](https://trivy.dev/) to simplify adoption and development. Review and address these before production.  
You can look up each ID in the [Aqua vulnerability database](https://avd.aquasec.com/).

```
AVD-AWS-0040 #(CRITICAL): Public cluster access is enabled.
AVD-AWS-0041 #(CRITICAL): Cluster allows access from a public CIDR: 0.0.0.0/0
AVD-AWS-0104 #(CRITICAL): Security group rule allows egress to multiple public internet addresses.

AVD-AWS-0343 #(MEDIUM): Cluster does not have Deletion Protection enabled
AVD-AWS-0178 #(MEDIUM): VPC does not have VPC Flow Logs enabled.
AVD-AWS-0038 #(MEDIUM): Control plane scheduler logging is not enabled.
AVD-AWS-0077 #(MEDIUM): Cluster instance has very low backup retention period.

AVD-AWS-0133 #(LOW): Instance does not have performance insights enabled.
```

**Warning**

Reference architectures and examples provided in this guide are not turnkey modules. Camunda recommends cloning the repository and modifying it locally.

You are responsible for operating and maintaining the infrastructure. Camunda updates the reference architecture over time and changes may not be backward compatible. You can use these updates to upgrade your customized codebase as needed.

**Note: Cost management**
This guide provisions resources that can incur costs in your cloud provider account. Review your provider's pricing before you begin.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
