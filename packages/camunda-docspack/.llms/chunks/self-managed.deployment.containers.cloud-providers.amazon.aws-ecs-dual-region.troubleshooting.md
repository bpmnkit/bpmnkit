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
- Temporarily forward the ALB's port 9600 to the management API (not recommended for production). See [Endpoint reference](#endpoint-reference).

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

### `terraform destroy` hangs on the Aurora resources

**Symptom:** `terraform destroy` in `terraform/infra` doesn't finish while it deletes the Aurora Global Database resources.

**Cause:** the Aurora writer is no longer in region 0, for example after an [unplanned Aurora recovery](https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region-ops#recover-when-the-aurora-writers-region-is-lost), and Terraform still expects the original topology.

**Fix:** move the writer back with `./procedure/failback.sh --failed-region 0 --switch-writer`, then run `terraform destroy` again. If that's not possible, remove the Aurora resources manually and drop them from the Terraform state:

```bash
# 1. Detach both clusters from the global cluster: the secondary (region 0) first, then the writer (region 1)
aws rds remove-from-global-cluster --region <region-0> \
  --global-cluster-identifier <global-id> \
  --db-cluster-identifier <region-0-cluster-arn>
aws rds remove-from-global-cluster --region <region-1> \
  --global-cluster-identifier <global-id> \
  --db-cluster-identifier <region-1-cluster-arn>

# 2. Delete the instances in both regions (skip the final snapshot only for non-production)
aws rds delete-db-instance --db-instance-identifier <r0-instance> --skip-final-snapshot --region <region-0>
aws rds delete-db-instance --db-instance-identifier <r1-instance> --skip-final-snapshot --region <region-1>

# 3. Wait for the instances to be deleted, then delete the clusters
aws rds delete-db-cluster --db-cluster-identifier <r0-cluster> --skip-final-snapshot --region <region-0>
aws rds delete-db-cluster --db-cluster-identifier <r1-cluster> --skip-final-snapshot --region <region-1>

# 4. Delete the global cluster
aws rds delete-global-cluster --global-cluster-identifier <global-id>

# 5. Remove the Aurora resources from the Terraform state and continue the destroy
terraform -chdir=terraform/infra state rm 'module.aurora_global[0].aws_rds_cluster_instance.primary[0]'
terraform -chdir=terraform/infra state rm 'module.aurora_global[0].aws_rds_cluster_instance.secondary[0]'
terraform -chdir=terraform/infra state rm 'module.aurora_global[0].aws_rds_cluster.primary'
terraform -chdir=terraform/infra state rm 'module.aurora_global[0].aws_rds_cluster.secondary'
terraform -chdir=terraform/infra state rm 'module.aurora_global[0].aws_rds_global_cluster.this'
terraform -chdir=terraform/infra destroy
```

For general troubleshooting, see the [operational guides troubleshooting documentation](https://docs.camunda.io/docs/next/self-managed/operational-guides/troubleshooting).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region
