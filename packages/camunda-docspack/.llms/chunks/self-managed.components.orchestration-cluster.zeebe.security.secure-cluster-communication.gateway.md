# Secure cluster communication — Gateway

To configure secure communication for a standalone gateway with the rest of the cluster, configure its `zeebe.gateway.cluster.security` section, which looks like this:

```yaml
security:
  # Enables TLS authentication between this gateway and other nodes in the cluster
  # This setting can also be overridden using the environment variable ZEEBE_GATEWAY_CLUSTER_SECURITY_ENABLED.
  enabled: false

  # Sets the path to the certificate chain file.
  # This setting can also be overridden using the environment variable ZEEBE_GATEWAY_CLUSTER_SECURITY_CERTIFICATECHAINPATH.
  certificateChainPath:

  # Sets the path to the private key file location
  # This setting can also be overridden using the environment variable ZEEBE_GATEWAY_CLUSTER_SECURITY_PRIVATEKEYPATH.
  privateKeyPath:

  # Configures the keystore file containing both the certificate chain and the private key.
  # Currently only supports PKCS#12 format.
  keyStore:
    # The path for the keystore file
    # This setting can also be overridden using the environment variable ZEEBE_GATEWAY_CLUSTER_SECURITY_PKCS12_FILEPATH
    filePath:

    # Sets the password for the keystore file, if not set it is assumed there is no password
    # This setting can also be overridden using the environment variable ZEEBE_GATEWAY_CLUSTER_SECURITY_PKCS12_PASSWORD
    password:
```

**Note**

The `certificateChainPath`, `privateKeyPath`, and `keyStore.filePath` can be relative to the gateway's working directory, or can be absolute paths.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/security/secure-cluster-communication
