# IAM Roles for Service Accounts (IRSA) — IRSA configuration validation of a Camunda 8 helm deployment — Advanced troubleshooting for IRSA configuration (2)

For each IAM role, ensure the **trust policy** includes:

1. The correct `Service` field, allowing the pod’s service account to assume the role.
2. An `Action` for `sts:AssumeRoleWithWebIdentity`, as IRSA uses WebIdentity to enable IAM role assumption.

Verify that the policy is configured according to [AWS’s role trust policy guidelines](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_principal.html) for Kubernetes IRSA.

##### Trust policies

For each role, verify that the [trust policy syntax is correct](https://aws.amazon.com/fr/blogs/security/how-to-use-trust-policies-with-iam-roles/), allowing the appropriate service accounts to assume the role. Refer to AWS’s [trust policy validation tool](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_policy-validator.html) for [accurate syntax and configuration](https://docs.aws.amazon.com/IAM/latest/UserGuide/access-analyzer-reference-policy-checks.html).

##### Permission policies

Each IAM role should also have appropriate permission policies attached. These policies define what actions the role can perform on AWS resources. Verify that permission policies:

- Are configured correctly to allow the necessary operations for your resources (e.g., read and write access to S3 buckets or access to RDS).
- Align with your security model by only granting the minimum required permissions.

The AWS’s [policy simulator](https://policysim.aws.amazon.com/) is a valuable tool for testing how permissions are applied and for spotting misconfigurations.

#### If issues persist

If issues remain unresolved, compare your configuration with Camunda’s [reference architecture](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup) deployed with Terraform. This setup has been validated to work with IRSA and contains the correct permissions. By comparing it to your setup, you may identify discrepancies that are causing your issues.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/irsa
