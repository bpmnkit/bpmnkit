# Configuration — Licensing

See the [core settings documentation](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/licensing).


## Webserver

See the [core settings documentation](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/webserver).


## Secondary storage

Review the [secondary storage documentation](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#secondary-storage) and [secondary storage configuration](https://docs.camunda.io/docs/next/self-managed/concepts/secondary-storage/configuring-secondary-storage).


## Intra-cluster secure connection

You can enable intra-cluster TLS-secured connections between Tasklist and Zeebe by applying the following configuration properties:

| Name                                                  | Description                                                                                                  | Example value                       |
| :---------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- | :---------------------------------- |
| `zeebe.gateway.cluster.initialContactPoints`          | Zeebe Gateway initial contact points.                                                                        | `[gateway-0:26502,gateway-1:26502]` |
| `zeebe.gateway.cluster.security.enabled`              | Enables secure connections via Transport Layer Security (TLS).                                               | `true`                              |
| `zeebe.gateway.cluster.security.certificateChainPath` | Path to the certificate used by Zeebe. Required if the certificate isn't registered in the operating system. | `/path/to/cert.pem`                 |
| `zeebe.gateway.cluster.security.privateKeyPath`       | Path to the certificate's private key used by Zeebe.                                                         | `/path/to/private.key`              |
| `zeebe.gateway.cluster.advertisedHost`                | Advertised hostname in the cluster.                                                                          | `tasklist`                          |
| `zeebe.gateway.cluster.memberId`                      | Member ID for the cluster.                                                                                   | `tasklist`                          |

For extended configuration and guidelines, refer to [Secure cluster communication](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/security/secure-cluster-communication) and [Gateway configuration](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/tasklist/tasklist-configuration
