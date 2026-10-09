# Dual-region operational procedure (ECS Fargate) — Prerequisites

- A deployment created with the [dual-region ECS Fargate guide](https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region).
- `jq` and the `session-manager-plugin` installed (see [Tooling](https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region#tooling)). The scripts reach the management API through a [Session Manager port-forward](https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region#method-b--session-manager-port-forward), which ECS Exec already supports in this reference architecture.
- The environment variables the scripts read from the Terraform outputs. Export them from `aws/containers/ecs-dual-region-fargate`:

  ```bash
  source ./procedure/export_environment_prerequisites.sh
  ```

  Set `AWS_PROFILE` if you don't use the default credential chain.

Both scripts take `--failed-region 0|1` to name the region being failed away from and restored. The default is `0`.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region-ops
