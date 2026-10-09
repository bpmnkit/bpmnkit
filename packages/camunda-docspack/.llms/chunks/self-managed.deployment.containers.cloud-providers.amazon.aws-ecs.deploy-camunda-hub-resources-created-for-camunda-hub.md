# Deploy to Amazon ECS — Deploy Camunda Hub — Resources created for Camunda Hub

`../../modules/ecs/fargate/camunda-hub` is deployed when `enable_camunda_hub = true` and contains the definitions for:

- ECS Service and task definition with both Camunda Hub containers sharing a task.
- Task-specific IAM role, isolated to this component.
- Load balancer configuration to add listener rules and target groups for the web interface and the websockets relay.

Alongside the module, the root workspace creates a dedicated `camunda-hub` database on the shared Aurora PostgreSQL cluster using IAM authentication, seeded by a one-time ECS task in the same way as the Orchestration Cluster database. It also generates the Pusher application key and secret shared by both containers, and an optional license secret, storing all of them in AWS Secrets Manager.

Camunda Hub connects to the Orchestration Cluster over ECS Service Connect using the signed-in user's bearer token, so no additional cluster credentials are required.

The base Terraform documentation for this module can be found [alongside the repository](https://github.com/camunda/camunda-deployment-references/tree/main/aws/modules/ecs/fargate/camunda-hub).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs
