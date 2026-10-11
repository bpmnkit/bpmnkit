# Upgrade Helm chart — Upgrade flow

After completing the prerequisites in your version-specific guide, follow this flow for each supported minor-version upgrade:

1. Run the [Camunda Helm Toolkit](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/camunda-helm-toolkit) to migrate and validate override files.
1. Review the report and complete the version-specific manual actions.
1. Render and test the complete, layered configuration in non-production.
1. Back up data and run the Helm upgrade.
1. Validate the deployed platform.

The toolkit is the recommended first step for values-file preparation. Check its [supported version pairs](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/camunda-helm-toolkit#check-version-compatibility) and upgrade one minor version at a time. A clean report is a useful sanity check, not proof of production readiness; follow all required actions in the version-specific guide.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/index
