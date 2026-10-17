# Upgrade Camunda 8.9 to 8.10 using Helm — Create your 8.10 values file

Use your existing 8.9 configuration as the starting point for the upgrade.

1. Create `values-8.10.yaml` from your existing overrides. Copy the original file. Alternatively, use the [Camunda Helm Toolkit](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/camunda-helm-toolkit) with source `8.9` and target `8.10` to migrate supported settings. Review the toolkit findings. Complete the required configuration changes below. Toolkit support for 8.10 is preliminary.

1. Download the default values for the Camunda 8.10 Helm chart:

   ```bash
   helm repo update
   helm show values camunda/camunda-platform --version <CHART_VERSION> > values-8.10-default.yaml
   ```

   To identify the latest available version of chart 15.x, including prereleases, run:

   ```bash
   helm search repo camunda/camunda-platform --versions --devel \
     | awk '$2 ~ /^15\./ { print; exit }'
   ```

1. Use the sections below to update `values-8.10.yaml`.

1. Find the remaining changes before you run `helm upgrade`:
   - Download the defaults of your current chart with `helm show values camunda/camunda-platform --version <8.9_CHART_VERSION> > values-8.9-default.yaml`. Compare `values-8.9-default.yaml` with `values-8.10-default.yaml` to find new options and changed defaults.
   - Compare `values-8.10.yaml` with `values-8.10-default.yaml` to find keys that no longer exist.
   - Render the chart. Then search the output for deprecation warnings:

     ```bash
     helm template <RELEASE> camunda/camunda-platform \
       --version <CHART_VERSION> \
       -f values-8.10.yaml > rendered-8.10.yaml
     grep 'DEPRECATION' rendered-8.10.yaml
     ```

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
