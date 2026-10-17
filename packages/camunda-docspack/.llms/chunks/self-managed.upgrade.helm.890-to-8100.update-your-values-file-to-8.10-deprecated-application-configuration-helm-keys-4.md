# Upgrade Camunda 8.9 to 8.10 using Helm — Update your values file to 8.10 — Deprecated application configuration Helm keys (4)

Optimize no longer accepts the static API token (`api.accessToken` or `OPTIMIZE_API_ACCESS_TOKEN`), unless you set the temporary fallback `optimize.security.csl.enabled=false`. See [component-specific security configuration keys](https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100#component-specific-security-configuration-keys-are-deprecated) and [static API access token](https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100#static-api-access-token-is-no-longer-accepted).

#### Camunda Hub

Move these legacy keys to `camundaHub.restapi.extraConfiguration`:

| Deprecated keys                                                     | Notes                                                                                                                                                                                                                                                                         |
| :------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `webModeler.restapi.mail.fromAddress`                               | `camunda.hub.mail.from-address`. `camundaHub.restapi.mail.fromAddress` is also deprecated. The chart fails the render when you set none of these keys. See [Render fails because the Hub sender address is missing](#render-fails-because-the-hub-sender-address-is-missing). |
| `webModeler.restapi.mail.fromName`                                  | `camunda.hub.mail.from-name`.                                                                                                                                                                                                                                                 |
| `webModeler.restapi.mail.{smtpHost,smtpPort,smtpUser}`              | `spring.mail.host`, `spring.mail.port`, and `spring.mail.username`.                                                                                                                                                                                                           |
| `webModeler.restapi.mail.smtpTlsEnabled`                            | `spring.mail.properties.mail.smtp.starttls.enable` and `spring.mail.properties.mail.smtp.starttls.required`. Set both. The chart renders both properties from the Helm key.                                                                                                   |
| `webModeler.restapi.logging.level.{"io.camunda.modeler","io.grpc"}` | `logging.level.io.camunda.hub` and `logging.level.io.grpc`. The `io.camunda.hub` logger replaces `io.camunda.modeler`.                                                                                                                                                        |

The chart reads these keys from the merged `camundaHub.restapi` and `webModeler.restapi` values. It also warns when you set a key under `camundaHub.restapi.mail` or `camundaHub.restapi.logging`, but the message names the `webModeler.restapi.*` key.

Hub authentication settings require no change for this upgrade. Hub continues to authenticate with its own properties. It doesn't use the `camunda.security.authentication.oidc.*` settings of the Orchestration Cluster. See [authentication configuration](https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100#authentication-configuration).

#### Global

Move each key to the `extraConfiguration` of the component that uses it:

| Deprecated key                                         | Notes                                                                                                                                                                                                                                                                                              |
| :----------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `global.config.requestBodySize`                        | Set `spring.servlet.multipart.max-file-size` and `spring.servlet.multipart.max-request-size` on the Orchestration Cluster, Optimize, Management Identity, and the Hub REST API. Also set `server.tomcat.max-http-form-post-size` on the Orchestration Cluster.                                     |
| `global.zeebeClusterName`                              | Set `zeebe.broker.cluster.clusterName` on the Orchestration Cluster.                                                                                                                                                                                                                               |
| `global.documentStore.type.{aws,gcp,inmemory}.storeId` | Use the unified `camunda.document.*` configuration (`default-store-id` plus the store definition) in `orchestration.extraConfiguration`. The Orchestration Cluster is the only component that chart 15.x configures from `global.documentStore`. See [Troubleshooting](#custom-document-store-id). |

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
