# Upgrade Camunda 8.9 to 8.10 using Helm — Migrate Web Modeler and Console to Camunda Hub

Camunda 8.10 combines the Web Modeler and Console components from 8.9 into Camunda Hub. The [component upgrade guide](https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100#camunda-hub) is the authority on how Hub upgrades from 8.9 to 8.10. It explains why the upgrade needs downtime and how the migration changes your data. The steps below apply that procedure to a Helm release with `camundaHub.upgrade.phase`.

**Warning**
Don't use `helm upgrade --rollback-on-failure` (or its deprecated alias `--atomic`) for this upgrade. After the database migration starts, don't return the Helm release to 8.9 before you restore the 8.9 database backup. An 8.9 application isn't compatible with a partially or fully migrated 8.10 database. Flyway doesn't block the startup of the 8.9 application. Therefore, the application can report that it's ready while requests that use removed tables or columns fail.

The `camundaHub.upgrade.phase` value controls the Hub workloads during the migration:

| Phase     | REST API replicas            | WebSockets replicas | Serves traffic |
| :-------- | :--------------------------- | :------------------ | :------------- |
| `quiesce` | `0`                          | `0`                 | No             |
| `migrate` | `1`                          | `0`                 | No             |
| `normal`  | The configured replica count | `1`                 | Yes            |

The Hub Services select only pods in the `normal` phase. The migration pod is therefore unavailable to user traffic.

The commands below use the chart's default resource names. If you set `fullnameOverride` or `nameOverride` under `camundaHub` or `webModeler`, list the names with `kubectl -n <NAMESPACE> get deployment -l app.kubernetes.io/instance=<RELEASE>`. Also list the names with this command if your release name contains `web-modeler`.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
