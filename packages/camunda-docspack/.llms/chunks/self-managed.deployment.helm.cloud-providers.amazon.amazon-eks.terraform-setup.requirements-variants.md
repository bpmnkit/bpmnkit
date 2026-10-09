# Deploy an EKS cluster with Terraform — Requirements — Variants

We support the following variants of this architecture:

- **Standard installation** - Uses username and password connection for the Camunda components (or relies on network isolation for specific components). This option is straightforward and easier to implement, making it ideal for environments where simplicity and rapid deployment are priorities, or where network isolation provides sufficient security.

- **IRSA** (IAM Roles for Service Accounts) - Uses service accounts to perform authentication with IAM policies. This approach offers stronger security and better integration with AWS services, as it eliminates the need to manage credentials manually. It is especially beneficial in environments with strict security requirements, where fine-grained access control and dynamic role-based access are essential.

- **RDBMS** - Uses an Amazon Aurora PostgreSQL database as the [secondary storage](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/index) for the Orchestration Cluster instead of Amazon OpenSearch. This variant (`eks-single-region-rdbms`) builds on the standard installation, provisions an additional `camunda_orchestration` database, and does not create an OpenSearch domain, which results in a lighter infrastructure footprint. For configuration details, see [configure RDBMS in Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms) and [install Camunda 8 with RDBMS](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/helm-with-rdbms).

#### How to choose

- If you prefer a simpler setup with Basic authentication or network isolation, and your security needs are moderate, the **standard installation** is a suitable choice.
- If you require enhanced security, dynamic role-based access management, and want to leverage AWS’s identity services for fine-grained control, the **IRSA** variant is the better option.
- If you want a lighter infrastructure without an OpenSearch domain and do not need Optimize, choose the **RDBMS** variant. Optimize requires Elasticsearch or OpenSearch and is not available with RDBMS secondary storage.

Each variant can be set up with or without a **Domain** ([Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup
