# Deploy to Amazon ECS — Terraform setup — Aurora PostgreSQL

**Info: Optional module**

If you do not want to use this module, you can skip this section. However, you will need to adjust the remaining steps to remove any references to it.

If you choose not to use this module, you must provide your own PostgreSQL, Elasticsearch or OpenSearch instance and make required config adjustments.

Additionally, be sure to delete the `postgres.tf` and `postgres_seed.tf` file in your reference copy—otherwise, the resources defined in it will still be created. Additionally, remove the references for the IAM access in `iam.tf` following the `RDS IAM Auth Support` section.

`postgres.tf` provisions an Aurora PostgreSQL cluster with a pre-created `camunda` database and admin credentials saved in the AWS Secrets Manager. This Aurora PostgreSQL cluster is used as secondary storage for the Orchestration Cluster.

`postgres_seed.tf` provisions a temporary ECS task to pre-seed the database for IAM authentication to work. The Aurora PostgreSQL cluster is not easily accessible from the outside as we don't expose it, therefore a workaround is required to do the initial user creation for the IAM authentication to work instead of using hard-coded username/password combinations.

If you're fine with username/password, you can remove the `postgres_seed.tf` and reuse the admin user that was created on creation to configure the Orchestration Cluster to consume said user.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs
