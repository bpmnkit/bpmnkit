# Deploy to Amazon ECS

Learn how to install Camunda 8 on AWS ECS.

This guide walks you through deploying the [Camunda 8 Orchestration Cluster](https://docs.camunda.io/docs/next/reference/glossary#orchestration-cluster) and Connectors on AWS Elastic Container Service (ECS) using Fargate and Aurora PostgreSQL, and verifying that all components are working.

**Tip: New to AWS ECS?**
If you are new to AWS ECS or Terraform, consider reviewing the [AWS ECS documentation](https://docs.aws.amazon.com/ecs/) and [Terraform documentation](https://developer.hashicorp.com/terraform/docs) before proceeding with this guide.


## Prerequisites

- **AWS account** – An AWS account to provision resources with permissions for **ecs**, **iam**, **elasticloadbalancing**, **kms**, **logs**, and **rds** services.
  - For detailed permissions, refer to this [example policy](https://github.com/camunda/camunda-deployment-references/tree/main/aws/containers/ecs-single-region-fargate/example/policy.json).
- **Terraform** – Infrastructure as code tool (v1.7 or later). [Install Terraform](https://developer.hashicorp.com/terraform/install).
- **AWS CLI** – Command-line tool to manage AWS resources, used for `local-exec` to trigger the initial Aurora PostgreSQL user seeding. [Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).

For the exact tool versions used during testing, refer to the repository's [.tool-versions](https://github.com/camunda/camunda-deployment-references/blob/main/.tool-versions) file.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs
