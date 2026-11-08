# Secure cluster communication — Broker

To configure secure communication for a broker, configure its `camunda.security.transport-layer-security.cluster` section, which looks like this:

```yaml
camunda:
  security:
    transport-layer-security:
      cluster:
        # Enables TLS authentication between this broker and other nodes in the cluster
        # This setting can also be overridden using the environment variable CAMUNDA_SECURITY_TRANSPORTLAYERSECURITY_CLUSTER_ENABLED.
        enabled: false

        # Sets the path to the certificate chain file.
        # This setting can also be overridden using the environment variable CAMUNDA_SECURITY_TRANSPORTLAYERSECURITY_CLUSTER_CERTIFICATECHAINPATH.
        certificate-chain-path:

        # Sets the path to the private key file location
        # This setting can also be overridden using the environment variable CAMUNDA_SECURITY_TRANSPORTLAYERSECURITY_CLUSTER_CERTIFICATEPRIVATEKEYPATH.
        certificate-private-key-path:

        # Configures the keystore file containing both the certificate chain and the private key.
        # Currently only supports PKCS#12 format.
        key-store:
          # The path for the keystore file
          # This setting can also be overridden using the environment variable CAMUNDA_SECURITY_TRANSPORTLAYERSECURITY_CLUSTER_KEYSTORE_FILEPATH
          file-path:

          # Sets the password for the keystore file, if not set it is assumed there is no password
          # This setting can also be overridden using the environment variable CAMUNDA_SECURITY_TRANSPORTLAYERSECURITY_CLUSTER_KEYSTORE_PASSWORD
          password:
```

> The `certificate-chain-path`, `certificate-private-key-path` and `key-store.file-path` can be relative to your broker's working directory, or can be absolute paths.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/security/secure-cluster-communication
