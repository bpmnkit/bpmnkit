# Gateway configuration — Configuration — zeebe.gateway.security

The client security configuration options allow securing the communication between a gateway and clients.

**Note**

You can read more about client-gateway security on [its dedicated page](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/security/secure-client-communication).

| Field                | Description                                                                                                                                                      | Example value |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| enabled              | Enables TLS authentication between clients and the gateway. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_SECURITY_ENABLED`. | false         |
| certificateChainPath | Sets the path to the certificate chain file. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_SECURITY_CERTIFICATECHAINPATH`.   |               |
| privateKeyPath       | Sets the path to the private key file location. This setting can also be overridden using the environment variable `ZEEBE_GATEWAY_SECURITY_PRIVATEKEYPATH`.      |               |

#### YAML snippet

```yaml
security:
  enabled: false
  certificateChainPath:
  privateKeyPath:
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway
