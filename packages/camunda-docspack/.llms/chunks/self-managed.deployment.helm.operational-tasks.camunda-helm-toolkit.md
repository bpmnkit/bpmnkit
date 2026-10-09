# Use the Camunda Helm Toolkit

Migrate and validate Camunda Helm override files with the local Web UI or Docker CLI, then review findings before upgrading.

Use the Camunda Helm Toolkit to migrate Helm override files between Camunda versions and check their configuration.

The toolkit rewrites supported configuration keys and reports changes that need your attention. It doesn't upgrade your deployment, migrate stored data, or replace the [Helm upgrade procedure](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100).


## Check version compatibility

Migrate one adjacent Camunda minor version at a time, then review the output before continuing.

| Source version | Migration target | Post-migration validation |
| -------------- | ---------------- | ------------------------- |
| 8.7            | 8.8              | 8.8                       |
| 8.8            | 8.9              | 8.9                       |
| 8.9            | 8.10             | 8.10                      |

Standalone validation supports 8.8, 8.9, and 8.10. You can't validate an 8.7 file directly; migrate it to 8.8 first. Support for 8.10 is preliminary, and some changes require manual configuration.

The source and target arguments are Camunda versions, such as `8.9`, not Helm chart versions, such as `14.x`. Use the [Helm chart version matrix](https://helm.camunda.io/camunda-platform/version-matrix/) to identify your deployment's Camunda version.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/camunda-helm-toolkit
