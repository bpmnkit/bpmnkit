# IAM Roles for Service Accounts (IRSA) — IRSA configuration validation of a Camunda 8 helm deployment — IRSA check script

The `/checks/kube/aws-irsa.sh` script verifies IRSA setup in your AWS Kubernetes environment by performing two types of checks:

1. **Configuration Verification**: Ensures key IRSA configurations are correctly set, using specific checks on IAM roles, policies, and mappings to service accounts.
2. **Namespace Commands and Job Execution**: Runs commands within the specified namespace using Kubernetes jobs (if necessary) to verify network and access configurations.

This utility is non-intrusive and will not alter any deployment settings.
If the `-s` flag is provided, the script skips spawning debugging pods for network flow verification, which can be helpful if pod creation is restricted or not required for troubleshooting.

**Info: Compatibility with Helm Deployments**

The script relies on Helm chart values and is compatible only with deployments installed or updated through standard Helm commands. It will not work with other deployment methods, such as those using `helm template` (e.g., [ArgoCD](https://argo-cd.readthedocs.io/en/latest/faq/#after-deploying-my-helm-application-with-argo-cd-i-cannot-see-it-with-helm-ls-and-other-helm-commands)).

Compatibility is confirmed for [Camunda Helm chart releases version 11 and above](https://artifacthub.io/packages/helm/camunda/camunda-platform).

#### Key features

- **Helm values retrieval**: Extracts deployment values using Helm to ensure all required configurations are set.
- **EKS and OIDC configuration check**: Confirms that EKS is configured with IAM and OIDC, matching the minimum required version for IRSA compatibility.
- **Service account role validation**: For each specified component, verifies that the service account exists and has the correct IAM role annotations.
- **Network access verification**: Ensures that PostgreSQL (Aurora) or OpenSearch instances are accessible from within the cluster. This step involves an `nmap` scan through a Kubernetes job. Use the `-s` option to skip this step if network flow verification is unnecessary.
- **IRSA value check**: Validates that the Helm deployment values are correctly configured to use IRSA for secure service interactions with AWS.
- **Aurora PostgreSQL and OpenSearch IAM configuration**: Confirms that these services support IAM login, ensuring secure access configurations.
- **Access and Trust Policy verification**: Checks that access and trust policies are correctly set. Note that the script performs basic checks; if issues arise with these policies, further manual verification may be needed.
- **Service Account Role association test**: Tests that the IAM role association with the service account is functioning as expected by spawning a job with the specified service account and validating the resulting ARN. This step can also be skipped using the `-s` option.
- **OpenSearch Access Policy check**: Validates that the OpenSearch access policy is configured correctly to support secure connections from the cluster.

#### Example usage

You can find the complete usage details in the [c8-sm-checks repository](https://github.com/camunda/c8-sm-checks/). Below is a quick reference for common usage options:

**Note: `identityKeycloak` in the default component list**
The default PostgreSQL component list below still contains `identityKeycloak`, the Bitnami subchart removed in Camunda 8.10. The script cannot yet detect an operator-managed or external Keycloak from a boolean `global.identity.keycloak.internal: false`, so it still runs the `identityKeycloak` checks and reports them as failures. Pass `-p "identity,webModeler"` to drop it from the list.

```bash
Usage: ./checks/kube/aws-irsa.sh [-h] [-n NAMESPACE] [-e EXCLUDE_COMPONENTS] [-p] [-l] [-s]
Options:
  -h                              Display this help message
  -n NAMESPACE                    Specify the namespace to use (required)
  -e EXCLUDE_COMPONENTS           Comma-separated list of Components to exclude from the check (reference of the component is the root key used in the chart)
  -p                              Comma-separated list of Components to check IRSA for PostgreSQL (overrides default list: identityKeycloak,identity,webModeler)
  -l                              Comma-separated list of Components to check IRSA for OpenSearch (overrides default list: orchestration,optimize)
  -s                              Disable pod spawn for IRSA and connectivity verification.
                                  By default, the script spawns jobs in the specified namespace to perform
                                  IRSA checks and network connectivity tests. These jobs use the amazonlinux:latest
                                  image and scan with nmap to verify connectivity.
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/cloud-providers/amazon/amazon-eks/irsa
