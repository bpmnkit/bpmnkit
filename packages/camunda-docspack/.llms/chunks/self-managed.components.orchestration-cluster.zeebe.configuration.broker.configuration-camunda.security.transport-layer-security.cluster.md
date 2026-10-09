# Broker configuration — Configuration — camunda.security.transport-layer-security.cluster

| Field                        | Description                                                                                                                                                                                                                                                                | Example Value |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| enabled                      | Enables TLS authentication between cluster nodes. This setting can also be overridden using the environment variable `CAMUNDA_SECURITY_TRANSPORTLAYERSECURITY_CLUSTER_ENABLED`.                                                                                            | false         |
| certificate-chain-path       | Sets the path to the certificate chain file. This setting can also be overridden using the environment variable `CAMUNDA_SECURITY_TRANSPORTLAYERSECURITY_CLUSTER_CERTIFICATECHAINPATH`.                                                                                    |               |
| certificate-private-key-path | Sets the path to the private key file. This setting can also be overridden using the environment variable `CAMUNDA_SECURITY_TRANSPORTLAYERSECURITY_CLUSTER_CERTIFICATEPRIVATEKEYPATH`.                                                                                     |               |
| key-store.file-path          | Configures the keystore file containing both the certificate chain and the private key. Currently only PKCS12 format is supported. This setting can also be overridden using the environment variable `CAMUNDA_SECURITY_TRANSPORTLAYERSECURITY_CLUSTER_KEYSTORE_FILEPATH`. | /path/key.p12 |
| key-store.password           | Sets the password for the keystore file. If not set, it is assumed there is no password. This setting can also be overridden using the environment variable `CAMUNDA_SECURITY_TRANSPORTLAYERSECURITY_CLUSTER_KEYSTORE_PASSWORD`.                                           | changeme      |

#### YAML snippet

```yaml
camunda:
  security:
    transport-layer-security:
      cluster:
        enabled: false
        certificate-chain-path: null
        certificate-private-key-path: null
        key-store:
          file-path: null
          password: null
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
