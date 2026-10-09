# Deploy an EKS cluster with eksctl — Prerequisites — Considerations

This is a basic setup to get started with Camunda 8 but does not reflect a high performance setup. For a better starting point towards production, we recommend utilizing [Infrastructure as Code tooling](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/infrastructure-as-code) and following our [Terraform guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup).

We refer to this architecture as the **standard installation**, which can be set up with or without a **domain** ([Ingress](https://docs.aws.amazon.com/eks/latest/userguide/alb-ingress.html)).
The standard installation utilizes a username and password connection for the Camunda components (or simply relies on network isolation for certain components). This option is straightforward and easier to implement, making it ideal for environments where simplicity and rapid deployment are priorities, or where network isolation provides sufficient security.

**Note: Secondary storage alternatives**
This guide includes one example path for the Orchestration Cluster's secondary storage. Depending on the guide, that example may use Elasticsearch, OpenSearch, or RDBMS.

If you use a different secondary storage backend, skip the guide-specific storage setup steps and follow [using external OpenSearch in Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/using-external-opensearch) or [configure RDBMS in Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms).

To try out Camunda 8 or develop against it, consider signing up for our [SaaS offering](https://camunda.com/platform/), or if you already have an Amazon EKS cluster, consider skipping to the [Helm guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm).

While the guide is primarily tailored for UNIX systems, it can also be run under Windows by utilizing the [Windows Subsystem for Linux](https://learn.microsoft.com/windows/wsl/about).

**Note: Cost management**
This guide provisions resources that can incur costs in your cloud provider account. Review your provider's pricing before you begin.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eksctl
