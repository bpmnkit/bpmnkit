# Upgrade Camunda 8.9 to 8.10 using Helm — Render and test the complete configuration

After reviewing the toolkit report and completing the manual changes, render your configuration and test the upgrade before upgrading production.

1. Render the chart and inspect the output for deprecation warnings:

   ```bash
   helm template <RELEASE> camunda/camunda-platform \
     --version <CHART_VERSION> \
     --namespace <NAMESPACE> \
     -f values-8.10.yaml > rendered-8.10.yaml
   grep 'DEPRECATION' rendered-8.10.yaml
   ```

   Use the same override files, order, and flags you plan to use for the upgrade. Review and address any rendering errors or deprecation warnings.

1. Complete the non-production upgrade test listed in the [prerequisites](#prerequisites), using a copy of your production configuration.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
