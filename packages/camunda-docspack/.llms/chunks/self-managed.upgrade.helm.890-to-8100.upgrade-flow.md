# Upgrade Camunda 8.9 to 8.10 using Helm — Upgrade flow

After completing the prerequisites, follow this flow for each supported minor-version upgrade:

1. Run the [Camunda Helm Toolkit](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/camunda-helm-toolkit) to migrate and validate override files.
1. Review the report and complete the version-specific manual actions.
1. Render and test the complete, layered configuration in non-production.
1. Back up data and run the Helm upgrade.
1. Validate the deployed platform.


## Run the Camunda Helm Toolkit

Start values-file preparation by running the toolkit against your Helm override files. Review and address its findings before completing the manual upgrade steps below.

1. Keep a copy of your original 8.9 overrides. Run the toolkit with source `8.9` and target `8.10` to create `values-8.10.yaml`. For layered overrides, migrate each file separately and retain the Helm `-f` order.
1. Inspect the migrated YAML and [act on the report](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/camunda-helm-toolkit#what-to-do-with-the-report). Resolve errors before using the output and review warnings for manual actions.
1. Review the [manual configuration changes](#update-your-values-file-to-810), including [changed chart defaults](#review-changed-chart-defaults), and complete all actions that apply to your deployment, including actions not identified by the report.

A clean report is a useful sanity check, not proof of production readiness. Complete the applicable manual actions even when the report has no findings. The toolkit prepares override files; it doesn't upgrade your deployment, migrate stored data, or validate a live cluster. Follow the complete upgrade procedure, including the [Hub database migration](#migrate-web-modeler-and-console-to-camunda-hub) if you run Web Modeler.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
