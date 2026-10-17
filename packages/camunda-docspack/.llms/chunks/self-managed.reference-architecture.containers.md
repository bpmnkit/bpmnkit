# Container deployment overview

Overview of the Camunda 8 container deployment reference architecture.

With container-based deployments, you can run the [Camunda 8 Orchestration Cluster](https://docs.camunda.io/docs/next/self-managed/reference-architecture/reference-architecture#camunda-hub-vs-orchestration-cluster) in a portable, consistent runtime with the benefits of containerization, without managing Kubernetes.

The following container deployment options are currently available:

- **[Amazon ECS with Fargate (single region)](https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs)**: Deploy to Amazon ECS with Fargate and Aurora PostgreSQL in a single AWS region.
- **[Amazon ECS with Fargate (dual region)](https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region)**: Active-active across two AWS regions, backed by Aurora Global Database. Experimental reference architecture.

---
Source: https://docs.camunda.io/docs/next/self-managed/reference-architecture/containers
