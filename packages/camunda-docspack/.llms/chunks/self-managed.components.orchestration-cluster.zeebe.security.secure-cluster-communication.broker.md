# Secure cluster communication — Broker

To configure secure communication for a broker, configure its `zeebe.broker.network.security` section, which looks like this:

```yaml
security:
  # Enables TLS authentication between this gateway and other nodes in the cluster
  # This setting can also be overridden using the environment variable ZEEBE_BROKER_NETWORK_SECURITY_ENABLED.
  enabled: false

  # Sets the path to the certificate chain file.
  # This setting can also be overridden using the environment variable ZEEBE_BROKER_NETWORK_SECURITY_CERTIFICATECHAINPATH.
  certificateChainPath:

  # Sets the path to the private key file location
  # This setting can also be overridden using the environment variable ZEEBE_BROKER_NETWORK_SECURITY_PRIVATEKEYPATH.
  privateKeyPath:

  # Configures the keystore file containing both the certificate chain and the private key.
  # Currently only supports PKCS#12 format.
  keyStore:
    # The path for the keystore file
    # This setting can also be overridden using the environment variable ZEEBE_BROKER_NETWORK_SECURITY_KEYSTORE_FILEPATH
    filePath:

    # Sets the password for the keystore file, if not set it is assumed there is no password
    # This setting can also be overridden using the environment variable ZEEBE_BROKER_NETWORK_SECURITY_KEYSTORE_PASSWORD
    password:
```

> The `certificateChainPath`, `privateKeyPath` and `keyStore.filePath` can be relative to your broker's working directory, or can be absolute paths.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/security/secure-cluster-communication
