# Dual-region setup (ECS Fargate) — Troubleshooting

### Logs

ECS task logs are exported to CloudWatch by default unless you configure otherwise. They are visible in the CloudWatch console and inline in the ECS service view alongside each task.

Retrieve the log group names from the app layer output:

```bash
cd terraform/app
terraform output -raw region_0_log_group_name
terraform output -raw region_1_log_group_name
```

### Accessing task or management API

ECS tasks are not reachable from outside the VPC without a workaround. Options include:

- Use the [Session Manager port-forward method](#method-b--session-manager-port-forward) to reach a running orchestration cluster task without a public IP. The reference architecture sets `task_enable_execute_command = true` by default, so the channel is already available.
- Run an EC2 or ECS debug task inside the same VPC and call the [management API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api) over the private network.
- Connect via an [AWS Client VPN](https://aws.amazon.com/vpn/client-vpn/) attached to the VPC.
- Use Lambda or Step Functions to invoke the API.
- Temporarily expose the management API on the ALB (not recommended for production).

To open an interactive shell on a running task via [AWS ECS Exec](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-exec-run.html):

```bash
CLUSTER=$(cd terraform/infra && terraform output -raw cluster_name)
TASK_ARN=$(aws ecs list-tasks \
  --cluster "${CLUSTER}-r0-cluster" \
  --service-name "${CLUSTER}-r0-oc-orchestration-cluster" \
  --query 'taskArns[0]' --output text)

aws ecs execute-command \
  --cluster "${CLUSTER}-r0-cluster" \
  --task "${TASK_ARN##*/}" \
  --container orchestration-cluster \
  --command "/bin/sh" \
  --interactive
```

For general troubleshooting, see the [operational guides troubleshooting documentation](https://docs.camunda.io/docs/next/self-managed/operational-guides/troubleshooting).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region
