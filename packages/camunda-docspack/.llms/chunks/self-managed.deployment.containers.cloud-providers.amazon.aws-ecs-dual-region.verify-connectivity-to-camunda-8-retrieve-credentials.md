# Dual-region setup (ECS Fargate) — Verify connectivity to Camunda 8 — Retrieve credentials

The admin password is generated once during the infra layer apply and shared by both regions:

```bash
cd terraform/infra
ADMIN_PASS=$(terraform output -raw admin_user_password)
echo "admin / $ADMIN_PASS"
```

The Connectors password is also stored in Secrets Manager. Retrieve it with the AWS CLI:

```bash
SECRET_ARN=$(terraform output -raw connectors_password_secret_region_0_arn)
CONNECTORS_PASS=$(aws secretsmanager get-secret-value \
  --secret-id "$SECRET_ARN" \
  --query SecretString --output text)
```

You can also locate the secrets in the AWS console at **Secrets Manager > `<cluster_name>-r0-oc-admin-user-password-*`**.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region
