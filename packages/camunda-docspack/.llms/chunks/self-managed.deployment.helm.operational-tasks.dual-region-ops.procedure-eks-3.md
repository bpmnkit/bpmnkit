# Helm chart dual-region operational procedure — Procedure — EKS

Retrieve the name of the bucket via Terraform. Go to `aws/kubernetes/eks-dual-region/terraform` within the repository and retrieve the bucket name from the Terraform state:

   ```bash
   export S3_BUCKET_NAME=$(terraform output -raw s3_bucket_name)
   ```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops
