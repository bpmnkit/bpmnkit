# Move from the Helm v3 CLI to v4 — Why no migration is required

Helm is a client-side tool. The CLI renders chart templates and applies the resulting manifests to the cluster. Helm release metadata is stored as Kubernetes Secrets in the release namespace, and Helm CLI v3 and v4 read and write the same release-storage format.

This means:

- The same release works under both CLIs against the same cluster.
- There is no `helm 3to4` step for Camunda charts.
- You do not need to reinstall, re-import, or back up and restore release state when you change CLI versions.


## Switch from Helm CLI v3 to v4 {#switch-from-the-v3-cli-to-the-v4-cli}

1. Install the Helm CLI v4 on the workstation that runs your Helm commands. See [Installing Helm](https://helm.sh/docs/intro/install/).
2. Verify the CLI version:

   ```bash
   helm version
   ```

   Confirm the output reports a `v4.x` client version.

3. Verify the existing release is visible to the new CLI:

   ```bash
   helm list -n <namespace>
   ```

   Your existing Camunda release appears with the same name, chart version, and revision history.

4. Continue with your normal `helm upgrade` workflow. See [Upgrade Helm chart](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/index).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/moving-helm-v3-to-v4
