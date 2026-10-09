# IAM Roles for Service Accounts (IRSA) — IRSA configuration validation of a Camunda 8 helm deployment — Advanced troubleshooting for IRSA configuration

The troubleshooting script provides essential checks but may not capture all potential issues, particularly those related to IAM policies and configurations. If IRSA is not functioning as expected and no errors are flagged by the script, follow the steps below for deeper troubleshooting.

#### Spawn a debug pod to simulate the pod environment

To troubleshoot in an environment identical to your pod, deploy a debug pod with the necessary service account. Here are examples of debug manifests you can customize for your needs:

- [OpenSearch client pod](https://github.com/camunda/camunda-deployment-references/blob/main/aws/modules/fixtures/opensearch-client.yml)
- [PostgreSQL client pod](https://github.com/camunda/camunda-deployment-references/blob/main/aws/modules/fixtures/postgres-client.yml)

1. Adapt the manifests to use the specific `serviceAccountName` (e.g., `aurora-access-sa`) you want to test.
2. Insert a sleep timer in the command to allow time to exec into the pod for live debugging.
3. Create the pod with the `kubectl apply` command:
   ```bash
   kubectl apply -f debug-client.yaml
   ```
4. Once the pod is running, connect to it with a bash shell (make sure to adjust the app label with your value):
   ```bash
   kubectl exec -it $(kubectl get pods -l app=REPLACE-WITH-LABEL -o jsonpath='{.items[0].metadata.name}') -- /bin/bash
   ```
5. Inside the pod, display all environment variables to check for IAM and AWS configurations:
   ```bash
   env
   ```
   This command will print out all environment variables, including those related to IRSA.
   Inside the pod, validate that key environment variables are correctly injected:
   - `AWS_WEB_IDENTITY_TOKEN_FILE`: Path to the token (JWT) file for WebIdentity.
   - `AWS_ROLE_ARN`: ARN of the associated IAM role.
   - `AWS_REGION`, `AWS_STS_REGIONAL_ENDPOINTS`, and other AWS configuration variables.

To ensure that IRSA and role associations are functioning:

- Check that the expected `AWS_ROLE_ARN` and token are present.
- Decode the JWT token to validate the correct trust relationship with the service account and namespace.

#### Verify OpenSearch fine-grained access control (fgac) configuration

For OpenSearch clusters, ensure [fine-grained access control](https://docs.aws.amazon.com/opensearch-service/latest/developerguide/fgac.html) is set up to allow the role’s access to the cluster. If you deployed OpenSearch with the [terraform reference architecture implementation for EKS](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup), fgac should already be configured. For manual deployments, follow the process outlined in the [OpenSearch configuration guide](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup#configure-opensearch-fine-grained-access-control) to apply similar controls.

#### Confirm PostgreSQL IAM role access

Verify that PostgreSQL roles are correctly configured to support IAM-based authentication. The database user should have the `rds_iam` role to allow IAM authentication. If the setup was automated with the [terraform reference architecture implementation for EKS](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup), the necessary access configuration should already be in place. For manual configurations, refer to [PostgreSQL configuration instructions](https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/terraform-setup#configure-the-database-and-associated-access).

To test connectivity:

- Run a manual connection test using the [PostgreSQL client manifest](https://raw.githubusercontent.com/camunda/camunda-deployment-references/refs/heads/main/aws/modules/fixtures/postgres-client.yml).
- Use `psql` within the pod to verify the correct roles are assigned. Run:
  ```bash
  SELECT * FROM pg_roles WHERE rolname='<your-username>';
  ```
  Confirm that `rds_iam` is listed among the assigned roles.

#### Validate IAM Policies for each role

Both trust and permission policies are crucial in configuring IAM Roles for Service Accounts (IRSA) in AWS. Each IAM role should have policies that precisely permit necessary actions and correctly trust the relevant Kubernetes service accounts associated with your components.

##### AssumeRole policies

In AWS, [AssumeRole](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) allows a user or service to assume a role and temporarily gain permissions to execute specific actions. Each role needs an **AssumeRole policy** that precisely matches AWS requirements for the specific services and actions your components perform.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/irsa
