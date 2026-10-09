# Dual-region setup (EKS) — Requirements — Considerations

This setup provides a solid starting point for running Camunda 8 on AWS in a dual-region configuration. It is not optimized for peak performance. Use it as a foundation you can extend and adapt for production with [Infrastructure as Code (IaC) tools](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/infrastructure-as-code).

- To test or develop against Camunda 8, consider signing up for our [SaaS offering](https://camunda.com/platform/).
- If you already have two Amazon EKS clusters (peered together) and an Amazon S3 bucket, skip ahead to [deploy Camunda 8 via Helm charts](#3-deploy-camunda-8-via-helm-charts).

**Warning**

Reference architectures and examples provided in this guide are not turnkey modules. Camunda recommends cloning the repository and modifying it locally.

You are responsible for operating and maintaining the infrastructure. Camunda updates the reference architecture over time and changes may not be backward compatible. You can use these updates to upgrade your customized codebase as needed.

**Note: Cost management**
This guide provisions resources that can incur costs in your cloud provider account. Review your provider's pricing before you begin.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/dual-region
