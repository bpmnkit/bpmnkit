# Upgrade Camunda 8.9 to 8.10 using Helm — Migrate Web Modeler and Console to Camunda Hub

Camunda 8.10 combines the Web Modeler and Console components from 8.9 into Camunda Hub. The database migration from 8.9 to 8.10 is not backward compatible. Stop all Web Modeler and Console workloads, take a verified database backup, and complete the migration before restoring traffic. For background on how Hub performs the database migration, see [how Camunda Hub upgrades between versions](https://docs.camunda.io/docs/next/self-managed/components/hub/version-upgrade).

**Warning**
Do not use `helm upgrade --atomic` for this upgrade. After the database migration starts, do not roll the Helm release back to 8.9 without first restoring the 8.9 database backup. An 8.9 application cannot start successfully or serve requests with a partially or fully migrated 8.10 database.

The `camundaHub.upgrade.phase` value controls the Hub workloads during the migration:

| Phase     | REST API replicas            | WebSockets replicas | Serves traffic |
| :-------- | :--------------------------- | :------------------ | :------------- |
| `quiesce` | `0`                          | `0`                 | No             |
| `migrate` | `1`                          | `0`                 | No             |
| `normal`  | The configured replica count | `1`                 | Yes            |

The Hub Services select only pods in the `normal` phase. The migration pod is therefore unavailable to user traffic.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
