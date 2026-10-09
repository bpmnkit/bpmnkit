# IAM Roles for Service Accounts (IRSA) — Document store (S3) — Verify

1. Confirm the pods start successfully without an AWS credentials secret:
   ```bash
   kubectl get pods -n <namespace>
   ```
2. Confirm the IRSA environment variables are injected and the static credentials are absent:
   ```bash
   kubectl exec -n <namespace> <orchestration-pod> -- env | grep AWS
   ```
   You should see `AWS_ROLE_ARN` and `AWS_WEB_IDENTITY_TOKEN_FILE`, and no `AWS_ACCESS_KEY_ID`.
3. Upload and download a document to confirm S3 access works end to end.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/irsa
