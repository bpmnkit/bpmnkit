# Upgrade Camunda 8.9 to 8.10 using Helm — Create your 8.10 values file

Use your existing 8.9 configuration as the starting point for the upgrade.

1. Create `values-8.10.yaml` from your existing overrides. Copy the original file, or use the [Camunda Helm Toolkit](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/camunda-helm-toolkit) with source `8.9` and target `8.10` to migrate supported settings. Review its findings and complete the required configuration changes below; toolkit support for 8.10 is preliminary.

1. Download the default values for the Camunda 8.10 Helm chart:

   ```bash
   helm repo update
   helm show values camunda/camunda-platform --version <CHART_VERSION> > values-8.10-default.yaml
   ```

   To identify the latest available 15.x chart version, including prereleases, run:

   ```bash
   helm search repo camunda/camunda-platform --versions --devel \
     | awk '$2 ~ /^15\./ { print; exit }'
   ```

1. Update `values-8.10.yaml` using the sections below.

1. Compare `values-8.10.yaml` with `values-8.10-default.yaml` to identify any remaining new options, changed defaults, and deprecated settings before running `helm upgrade`.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
