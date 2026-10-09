# Configure Camunda 8 Run — Enable TLS

TLS can be enabled by providing a local keystore file using the [`--keystore` and `--keystorePassword` configuration options](#configuration-options) at startup. Camunda 8 Run accepts `.jks` certificate files.

Although Camunda 8 Run supports TLS, this is intended only for testing.

**Note**
If you use a proxy together with TLS, ensure internal Camunda services are excluded from proxy routing. JVM-level proxy settings apply to all internal HTTP clients and may block communication between components such as Zeebe, Operate, Admin, or the connector runtime. Add these services to your `nonProxyHosts` configuration.

For details, see [HTTP proxy configuration](https://docs.camunda.io/docs/next/self-managed/components/connectors/http-proxy-configuration).

---
Source: https://docs.camunda.io/docs/next/self-managed/quickstart/developer-quickstart/c8run/configuration
