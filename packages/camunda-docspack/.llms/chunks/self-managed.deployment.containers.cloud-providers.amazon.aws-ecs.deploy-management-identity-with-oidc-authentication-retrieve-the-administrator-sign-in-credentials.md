# Deploy to Amazon ECS — Deploy Management Identity with OIDC authentication — Retrieve the administrator sign-in credentials

In `oidc` mode, you sign in to Operate, Tasklist, and Camunda Hub as the `admin` user of the identity provider, not as the built-in `admin` user that Basic authentication creates. The two accounts have separate passwords, and `terraform output -raw admin_user_password` only returns the built-in one.

When you use the bundled provider, the identity provider password is generated at apply time and stored in AWS Secrets Manager under `<prefix>-oc1-realm-admin-user-password`. No Terraform output exposes it. For the command that reads it, see step 3 of [Verify connectivity to Camunda 8](#verify-connectivity-to-camunda-8).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs
