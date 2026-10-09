# Troubleshoot Zeebe connection issues — How can I provide a custom Zeebe SSL certificate?

You configured a custom SSL certificate in your (remote) Zeebe deployment and want Camunda Hub to accept that certificate.
Camunda Hub strictly validates the remote server certificate trust chain.
If you use a custom SSL server certificate, you must make the signing CA certificate known to Camunda Hub, not the
server certificate itself.

### Provide the certificate via an environment variable

`modeler-restapi` reads a trusted certificate from the environment variable `ZEEBE_CA_CERTIFICATE_PATH`.
This solution is recommended for most users:

```shell
ZEEBE_CA_CERTIFICATE_PATH=/path/to/certificate
```

The provided path has to be accessible from the `modeler-restapi` container (e.g. via a mounted volume).

### Provide the certificate to the JVM trust store

Alternatively, you may pass a custom trust store to `modeler-restapi` via the environment variable `JAVA_TOOL_OPTIONS`:

```shell
JAVA_TOOL_OPTIONS="-Djavax.net.ssl.trustStore=/path/to/truststore.jks -Djavax.net.ssl.trustStorePassword=changeit"
```

Analogous to above, the provided path has to be accessible from the `modeler-restapi` container (e.g. via a mounted volume).

**Caution**
Be aware that passing a custom trust store via `JAVA_TOOL_OPTIONS` overrides the default JVM trust store.
This means that all certificates shipped by default with the Java runtime (e.g. the Amazon Trust Services CA for
connecting to a secured Aurora instance) are no longer trusted unless explicitly added.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/troubleshooting/troubleshoot-zeebe-connection
