# Prepare Helm upgrades with the Camunda Helm Toolkit

Migrate and validate Camunda Helm override files with the local Web UI or Docker CLI, then review findings before upgrading.

Before every supported Helm minor-version upgrade, run the Camunda Helm Toolkit on your override files. It produces migrated starting points and a report of configuration changes that need review, so you can focus on the remaining upgrade actions instead of finding every values-file change manually.

**Note: Toolkit boundaries**
The toolkit prepares and checks override files. It doesn't upgrade the deployment, migrate stored data, validate a live cluster, or prove that the complete configuration is ready for production.

Use the toolkit as the first step in preparing your values files, then follow the [version-specific Helm upgrade guide](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/index). Review its manual actions, render and test your complete configuration in non-production, back up data, run the upgrade, and validate the deployed platform.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/camunda-helm-toolkit
