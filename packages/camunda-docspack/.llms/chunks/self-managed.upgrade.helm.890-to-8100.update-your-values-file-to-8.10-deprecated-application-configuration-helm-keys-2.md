# Upgrade Camunda 8.9 to 8.10 using Helm — Update your values file to 8.10 — Deprecated application configuration Helm keys (2)

#### Connectors

Move these keys to `connectors.extraConfiguration`:

| Deprecated key                                    | Notes                                   |
| :------------------------------------------------ | :-------------------------------------- |
| `connectors.logging.level."io.camunda.connector"` | `logging.level."io.camunda.connector"`. |

#### Optimize

Move these keys to `optimize.extraConfiguration`, except where noted. Entries marked `Native config` use Optimize's own configuration property names rather than the `camunda.*` namespace; set them in `optimize.extraConfiguration` as well:

| Key                                                                           | Notes                                                                                                                                                                                                                                           |
| :---------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `optimize.logLevel`, `optimize.upgradeLogLevel`, `optimize.esLogLevel`        | `logging.level.{"io.camunda.optimize","io.camunda.optimize.upgrade","org.elasticsearch"}`.                                                                                                                                                      |
| `optimize.profiles`                                                           | `spring.profiles.active`.                                                                                                                                                                                                                       |
| `optimize.caches.cloudTenantAuthorizations.{maxSize,minFetchIntervalSeconds}` | `camunda.optimize.caches.cloud-tenant-authorizations.{max-size,min-fetch-interval-seconds}`.                                                                                                                                                    |
| `optimize.partitionCount`                                                     | Native config `zeebe.partitionCount`.                                                                                                                                                                                                           |
| `optimize.database.{elasticsearch,opensearch}.prefix`                         | Native config `zeebe.name`.                                                                                                                                                                                                                     |
| `optimize.multitenancy.enabled`                                               | Move to `global.multitenancy.enabled` (not `extraConfiguration`). This is a platform-wide switch that requires Identity with an external database. See [Logical Tenants](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configure-logical-tenants). |

#### Camunda Hub

Move these legacy keys to `camundaHub.restapi.extraConfiguration`:

| Deprecated keys                                                                            | Notes                                     |
| :----------------------------------------------------------------------------------------- | :---------------------------------------- |
| `webModeler.restapi.mail.{fromAddress,fromName,smtpHost,smtpUser,smtpPort,smtpTlsEnabled}` | `camunda.hub.mail.*` and `spring.mail.*`. |
| `webModeler.restapi.logging.level.{"io.camunda.modeler","io.grpc"}`                        | `logging.level.*`.                        |

Camunda Hub authentication settings require no change for this upgrade. Your existing settings continue to work, and are translated to their 8.10 equivalents at startup. They are deprecated, however, and are removed in 8.11, so migrate to their 8.10 equivalents before upgrading to 8.11. For the mapping, see [authentication configuration](https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100#authentication-configuration).

#### Global

Move each key to the consuming component's `extraConfiguration`:

| Deprecated key                                         | Notes                                                                                                                                                                          |
| :----------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `global.config.requestBodySize`                        | The relevant `spring.servlet.multipart.*`, `server.tomcat.max-http-form-post-size`, and message-size properties per component.                                                 |
| `global.zeebeClusterName`                              | `zeebe.broker.cluster.clusterName` on the orchestration component.                                                                                                             |
| `global.documentStore.type.{aws,gcp,inmemory}.storeId` | The unified `camunda.document.*` config (`default-store-id` plus the store definition) on each document-consuming component. See [Troubleshooting](#custom-document-store-id). |

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
