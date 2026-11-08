# Prepare Helm upgrades with the Camunda Helm Toolkit — What to do with the report

Inspect the migrated YAML and act on the findings before using the output for an upgrade.

| Report result | Your next action                                                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Errors        | Resolve errors before using the migrated output. If the tool fails, correct the failure and rerun it.                                             |
| Warnings      | Review each warning and complete the applicable manual action before upgrading.                                                                   |
| No findings   | Continue with the version-specific upgrade guide, render and test the complete layered configuration, and complete backups and deployment checks. |

A clean report is a useful sanity check, not proof of production readiness. For CLI automation, see [reports and exit codes](#interpret-reports-and-exit-codes).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/camunda-helm-toolkit
