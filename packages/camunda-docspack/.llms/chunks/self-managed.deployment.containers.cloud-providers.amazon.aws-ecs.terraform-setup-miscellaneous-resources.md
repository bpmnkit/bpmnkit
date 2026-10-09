# Deploy to Amazon ECS — Terraform setup — Miscellaneous Resources

`registry-auth.tf` contains the basics to create a secret via the AWS Secrets Manager for any kind of registry to access the Camunda images or bypass rate limitations.

`lb.tf` contains the creation of the main Network Load Balancer (NLB) and the Application Load Balancer (ALB).

`iam.tf` contains various IAM roles and policies.

`secrets.tf` contains the creation of random passwords and storage in AWS Secrets Manager.

`s3.tf` contains a bucket for backup purposes with versioning and encryption enabled. Access is handled through IAM role policies.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs
