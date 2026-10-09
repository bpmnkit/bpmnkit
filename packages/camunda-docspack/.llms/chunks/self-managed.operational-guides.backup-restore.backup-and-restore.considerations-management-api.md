# Camunda back up and restore — Considerations — Management API

The management API is an extension of the [Spring Boot Actuator](https://docs.spring.io/spring-boot/reference/actuator/index.html), typically used for monitoring and other operational purposes. This is not a public API and not exposed. You will need direct access to your Camunda cluster to be able to interact with these management APIs. This is why you'll often see the reference to `localhost`.

For the Orchestration Cluster, the management API's backup and exporting-control endpoints are a backward-compatible alternative to the REST API above. Existing automation built against them continues to work; new automation should use the REST API instead. Deprecation of the management API's backup and exporting endpoints is not currently planned, but new capabilities such as [Physical Tenants](#multiple-physical-tenants) are only available through the REST API.

| Management API call                        | REST API equivalent                                                                                                       |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `POST /actuator/exporting/pause?soft=true` | [`POST /exporting/pause?soft=true`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/pause-exporting.api)    |
| `POST /actuator/exporting/resume`          | [`POST /exporting/resume`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/resume-exporting.api)            |
| `POST /actuator/backupRuntime`             | [`POST /backups/runtime`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/take-runtime-backup.api)          |
| `GET /actuator/backupRuntime/{backupId}`   | [`GET /backups/runtime/{backupId}`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-runtime-backup.api) |
| `POST /actuator/backupHistory`             | [`POST /backups/history`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/take-history-backup.api)          |
| `GET /actuator/backupHistory/{backupId}`   | [`GET /backups/history/{backupId}`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-history-backup.api) |

The REST API adds list and delete operations that have no management API equivalent (see the table above), and requires the authentication and authorization already in place for the rest of the Orchestration Cluster API instead of network-level access to the management port.

Direct access will depend on your deployment environment. For example, direct Kubernetes cluster access with [port-forwarding](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_port-forward/) or [exec](https://kubernetes.io/docs/reference/kubectl/generated/kubectl_exec/) to execute commands directly on Kubernetes pods. In a manual deployment you will need to be able to reach the machines that host Camunda. Typically, the management port is on port `9600` but might differ on your setup and on the components. You can find the default for each component in their configuration page.

| Component                                                                                                               | Port |
| ----------------------------------------------------------------------------------------------------------------------- | ---- |
| [Optimize](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration#container)                           | 8092 |
| [Orchestration Cluster](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway#managementserver) | 9600 |

#### Examples for Kubernetes approaches

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore
