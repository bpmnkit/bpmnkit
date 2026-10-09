# Deploy to Amazon ECS — Troubleshooting

### Logs

Logs are by default exported to CloudWatch unless configured otherwise by you. Those are both visible in the CloudWatch dashboard and the ECS Service alongside each task.

### Accessing task or management API

ECS tasks are not easily accessible without workarounds, some options are the following:

- EC2 / ECS debug instance / task within the same VPC to try to ping and use the [management API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api)
- AWS VPN connected to the VPC
- Lambda functions
- Step functions
- Temporarily exposing the management API
- Temporarily set `task_enable_execute_command` to `true` and redeploy to allow accessing the running container

```sh
aws ecs execute-command \
  --cluster $ECS_CLUSTER \
  --task $ECS_TASK_ID \
  --container orchestration-cluster \
  --command "/bin/sh" \
  --interactive
```

You can find more information about `AWS ECS Exec` within the [AWS documentation](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs-exec-run.html).

For general troubleshooting assistance, consult the [operational guides troubleshooting documentation](https://docs.camunda.io/docs/next/self-managed/operational-guides/troubleshooting).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs
