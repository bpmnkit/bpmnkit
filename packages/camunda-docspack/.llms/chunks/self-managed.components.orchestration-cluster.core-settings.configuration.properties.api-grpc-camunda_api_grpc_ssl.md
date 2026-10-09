# Property reference — API - gRPC — `CAMUNDA_API_GRPC_SSL`

| Property                                     | Description                                                                                                                          | Default value       | Overridable per Physical Tenant |
| :------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- | :------------------ | :------------------------------ |
| `CAMUNDA_API_GRPC_SSL_ENABLED`               | Enable SSL (Secure Sockets Layer) authentication for the gateway.                                                             | `false`             | No                              |
| `CAMUNDA_API_GRPC_SSL_CERTIFICATE`           | Set the path to the certificate chain file.                                                                                   | Null                | No                              |
| `CAMUNDA_API_GRPC_SSL_CERTIFICATEPRIVATEKEY` | Set the path to the private key file location.                                                                                | Null                | No                              |
| `CAMUNDA_API_GRPC_SSL_KEYSTORE_FILEPATH`     | Configure the keystore file containing both the certificate chain and the private key. Currently only supports PKCS12 format. | `/path/to/keystore` | No                              |
| `CAMUNDA_API_GRPC_SSL_KEYSTORE_PASSWORD`     | Configure the keystore password.                                                                                              | Null                | No                              |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
