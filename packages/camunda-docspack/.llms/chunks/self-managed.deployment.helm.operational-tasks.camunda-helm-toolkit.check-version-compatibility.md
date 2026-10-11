# Prepare Helm upgrades with the Camunda Helm Toolkit — Check version compatibility

Migrate one adjacent Camunda minor version at a time, then review the output before continuing.

| Source version | Migration target | Post-migration validation |
| -------------- | ---------------- | ------------------------- |
| 8.7            | 8.8              | 8.8                       |
| 8.8            | 8.9              | 8.9                       |
| 8.9            | 8.10             | 8.10                      |

Standalone validation supports 8.8, 8.9, and 8.10. You can't validate an 8.7 file directly; migrate it to 8.8 first.

The toolkit migrates supported configuration changes and reports actions that need review. Complete the applicable manual steps in the [version-specific upgrade guide](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/index).

The source and target arguments are Camunda versions, such as `8.9`, not Helm chart versions, such as `14.x`. Use the [Helm chart version matrix](https://helm.camunda.io/camunda-platform/version-matrix/) to identify your deployment's Camunda version.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/camunda-helm-toolkit
