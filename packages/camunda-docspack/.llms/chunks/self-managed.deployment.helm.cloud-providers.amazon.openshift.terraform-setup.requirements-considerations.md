# Deploy a ROSA HCP Cluster with Terraform — Requirements — Considerations

This setup provides a foundational starting point for working with Camunda 8, though it is not optimized for peak performance. It serves as a solid initial step in preparing a production environment by leveraging [Infrastructure as Code (IaC) tools](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/infrastructure-as-code).

Terraform can initially appear complex. If you're new to it, you might want to start by considering trying out the [Red Hat OpenShift on AWS UI-based tutorial](https://docs.redhat.com/en/documentation/red_hat_openshift_service_on_aws_classic_architecture/4/html/getting_started/rosa-getting-started.html). This guide will show you what resources are created and how they interact with each other.

If you require managed services for PostgreSQL Aurora or OpenSearch, you can refer to the definitions provided in the [EKS setup with Terraform](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup) guide. However, please note that these configurations may need adjustments to fit your specific requirements and have not been tested. This guide uses integrated Helm chart database services in its example path (PostgreSQL and Elasticsearch), but you can choose another supported secondary storage backend for the Orchestration Cluster. To run the Orchestration Cluster on a relational database instead of Elasticsearch, follow the RDBMS steps in the [Red Hat OpenShift Helm guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift#deploy-postgresql), which deploy an in-cluster `pg-camunda` database with CloudNativePG. See also [configure RDBMS in Helm](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms) and the [RDBMS support policy](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy) for the supported engines.

For testing Camunda 8 or developing against it, you might consider signing up for our [SaaS offering](https://camunda.com/platform/). If you already have a Red Hat OpenShift cluster on AWS, you can skip ahead to the [Helm setup guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/openshift/redhat-openshift).

To keep this guide concise, we provide links to additional documentation covering best practices, allowing you to explore each topic in greater depth.

**Note: Cost management**
This guide provisions resources that can incur costs in your cloud provider account. Review your provider's pricing before you begin.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/openshift/terraform-setup
