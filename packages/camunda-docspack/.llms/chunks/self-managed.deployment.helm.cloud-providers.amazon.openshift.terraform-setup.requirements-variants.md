# Deploy a ROSA HCP Cluster with Terraform — Requirements — Variants

Unlike the [EKS Terraform setup](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup), we currently support only one main variant of this setup:

- The **standard installation** uses a username and password connection for Camunda components (or relies solely on network isolation for certain components). This option is straightforward and easier to implement, making it ideal for environments where simplicity and rapid deployment are priorities, or where network isolation provides adequate security.

- The second variant, **IRSA** (IAM Roles for Service Accounts), may work but has not been tested. If you’re interested in setting it up, please refer to the EKS guide as a foundational resource.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/openshift/terraform-setup
