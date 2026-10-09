# Property reference — Security — `camunda.security.transport-layer-security.cluster`

| Property                                                                         | Description                                                                                                                           | Default value             | Overridable per Physical Tenant |
| :------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ | :------------------------ | :------------------------------ |
| `camunda.security.transport-layer-security.cluster.enabled`                      | Enables TLS authentication for internal cluster (broker-to-broker) communication.                                              | `false`                   | No                              |
| `camunda.security.transport-layer-security.cluster.certificate-chain-path`       | Sets the path to the certificate chain file.                                                                                   |                           | No                              |
| `camunda.security.transport-layer-security.cluster.certificate-private-key-path` | Sets the path to the private key file location.                                                                                |                           | No                              |
| `camunda.security.transport-layer-security.cluster.key-store.file-path`          | Configures the keystore file containing both the certificate chain and the private key. Currently only supports PKCS12 format. | `'./cluster.jks'`         | No                              |
| `camunda.security.transport-layer-security.cluster.key-store.password`           | Configures the keystore password.                                                                                              | `${CLUSTER_KEY_STORE_PW}` | No                              |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
