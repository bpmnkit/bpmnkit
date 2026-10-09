# Property reference — Security — `CAMUNDA_SECURITY_TRANSPORTLAYERSECURITY_CLUSTER`

| Property                                                                    | Description                                                                                                                           | Default value             | Overridable per Physical Tenant |
| :-------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ | :------------------------ | :------------------------------ |
| `CAMUNDA_SECURITY_TRANSPORTLAYERSECURITY_CLUSTER_ENABLED`                   | Enables TLS authentication for internal cluster (broker-to-broker) communication.                                              | `false`                   | No                              |
| `CAMUNDA_SECURITY_TRANSPORTLAYERSECURITY_CLUSTER_CERTIFICATECHAINPATH`      | Sets the path to the certificate chain file.                                                                                   |                           | No                              |
| `CAMUNDA_SECURITY_TRANSPORTLAYERSECURITY_CLUSTER_CERTIFICATEPRIVATEKEYPATH` | Sets the path to the private key file location.                                                                                |                           | No                              |
| `CAMUNDA_SECURITY_TRANSPORTLAYERSECURITY_CLUSTER_KEYSTORE_FILEPATH`         | Configures the keystore file containing both the certificate chain and the private key. Currently only supports PKCS12 format. | `'./cluster.jks'`         | No                              |
| `CAMUNDA_SECURITY_TRANSPORTLAYERSECURITY_CLUSTER_KEYSTORE_PASSWORD`         | Configures the keystore password.                                                                                              | `${CLUSTER_KEY_STORE_PW}` | No                              |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
