# Gateway configuration — Configuration — zeebe.gateway.cluster.security

The cluster security configuration options allow securing communication between the gateway and other nodes in the cluster.

**Note**

You can read more about intra-cluster security on [its dedicated page](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/security/secure-cluster-communication).

| Field                | Description                                                                                                                                                                                                   | Example value |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| enabled              | Enables TLS authentication between this gateway and other nodes in the cluster. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_CLUSTER_SECURITY_ENABLED`.                  | false         |
| certificateChainPath | Sets the path to the certificate chain file. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_CLUSTER_SECURITY_CERTIFICATECHAINPATH`.                                        |               |
| privateKeyPath       | Sets the path to the private key file location. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_CLUSTER_SECURITY_PRIVATEKEYPATH`.                                           |               |
| keyStore             | Configures the keystore file containing both the certificate chain and the private key; currently only supports PKCS12 format.                                                                                |               |
| keyStore.filePath    | The path for keystore file; This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_CLUSTER_SECURITY_KEYSTORE_FILEPATH`.                                                            | /path/key.pem |
| keyStore.password    | Sets the password for the keystore file, if not set it is assumed there is no password; This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_CLUSTER_SECURITY_KEYSTORE_PASSWORD` | changeme      |

#### YAML snippet

```yaml
security:
  enabled: false
  certificateChainPath: null
  privateKeyPath: null
  keyStore:
    filePath: null
    password: null
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway
