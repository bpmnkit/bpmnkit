# Deploy to Amazon ECS — Deploy Management Identity with OIDC authentication — Resources created for Management Identity

`../../modules/ecs/fargate/management-identity` is deployed when `authentication_mode = "oidc"` and contains the definitions for:

- ECS Service and task definition, running Management Identity in generic OIDC mode.
- Task-specific IAM role, isolated to this component.
- Load balancer configuration to add a listener rule to the shared Application Load Balancer, serving Management Identity under the `/identity` context path.
- Networking configuration that registers Management Identity with ECS Service Connect, reachable inside the VPC as `identity` on port `8084`, with the management endpoint on port `8082`.

Management Identity uses a dedicated `identity` database on the shared Aurora PostgreSQL cluster with IAM database authentication, the same mechanism the Orchestration Cluster uses. The image ships the AWS Advanced JDBC wrapper, and the reference architecture points the Spring datasource at it, so the task authenticates with short-lived IAM tokens and never receives a static database password. The database name and role are configurable through `identity_db_name` and `identity_db_username`. A password for the role still exists in AWS Secrets Manager, used only by the database seed task to bootstrap the role.

In generic OIDC mode, Management Identity validates tokens and handles login. The identity provider owns clients and users, and role-to-principal mapping is done on the Camunda side.

The base Terraform documentation for this module can be found [alongside the repository](https://github.com/camunda/camunda-deployment-references/tree/main/aws/modules/ecs/fargate/management-identity).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs
