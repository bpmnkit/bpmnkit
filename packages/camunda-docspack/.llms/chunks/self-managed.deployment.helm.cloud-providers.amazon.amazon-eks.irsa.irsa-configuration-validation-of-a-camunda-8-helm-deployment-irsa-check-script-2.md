# IAM Roles for Service Accounts (IRSA) — IRSA configuration validation of a Camunda 8 helm deployment — IRSA check script (2)

**Example Command:**

```bash
./checks/kube/aws-irsa.sh -n camunda-primary -p "identity,webModeler" -l "orchestration"
```

In this example, the script will check **`identity`** and **`webModeler`** components (references of the component name in the helm chart) for Aurora PostgreSQL access and only **`orchestration`** for OpenSearch access in the `camunda-primary` namespace.

#### Script output overview

The script offers detailed output to confirm that each component is properly configured for IRSA. Below is an outline of the checks it performs and the expected output format:

**Example Output:**

```
[OK] AWS CLI version 2.15.20 is compatible and user is logged in.
[OK] AWS environment detected. Proceeding with the script.
[INFO] Chart camunda-platform is deployed in namespace camunda-primary.
[INFO] Retrieved values for Helm deployment: camunda-platform-11.0.1.
[FAIL] The service account keycloak-sa does not have a valid eks.amazonaws.com/role-arn annotation. You must add it in the chart, see https://docs.camunda.io/docs/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/eks-helm/
[FAIL] RoleArn name for component 'identityKeycloak' is empty. Skipping verification.
```

The script highlights errors with the `[FAIL]` prefix, and these are directed to `stderr` for easier filtering. We recommend capturing `stderr` output to quickly identify failed configurations.

If the script returns a false positive—indicating success when issues are actually present—manually review each output line to ensure reported configuration details (like Role ARNs or annotations) are accurate. For example, ensure that each service account has the correct Role ARN and associated permissions to avoid undetected issues.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/irsa
