# Property reference — API - gRPC — `camunda.api.grpc.ssl`

| Property                                       | Description                                                                                                                          | Default value       | Overridable per Physical Tenant |
| :--------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------- | :------------------ | :------------------------------ |
| `camunda.api.grpc.ssl.enabled`                 | Enable SSL (Secure Sockets Layer) authentication for the gateway.                                                             | `false`             | No                              |
| `camunda.api.grpc.ssl.certificate`             | Set the path to the certificate chain file.                                                                                   | Null                | No                              |
| `camunda.api.grpc.ssl.certificate-private-key` | Set the path to the private key file location.                                                                                | Null                | No                              |
| `camunda.api.grpc.ssl.key-store.file-path`     | Configure the keystore file containing both the certificate chain and the private key. Currently only supports PKCS12 format. | `/path/to/keystore` | No                              |
| `camunda.api.grpc.ssl.key-store.password`      | Configure the keystore password.                                                                                              | Null                | No                              |

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties
