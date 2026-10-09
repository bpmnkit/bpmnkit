# Deploy to Amazon ECS — Terraform setup

The root workspace houses the overall implementation to keep things configurable and interchangeable as needed.

While each Camunda component is kept as a separate module to abstract the need of each component as it's required with their base setup.

If wanting to deploy multiple Camunda 8 setups, it may make sense to abstract the root workspace to a common module as well to allow easier scaling.

If not otherwise indicated, the `.tf` file is corresponding to the [root workspace path](https://github.com/camunda/camunda-deployment-references/tree/main/aws/containers/ecs-single-region-fargate/terraform/cluster).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs
