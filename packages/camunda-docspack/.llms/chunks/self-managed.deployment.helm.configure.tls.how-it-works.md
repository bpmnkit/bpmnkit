# Configure TLS — How it works

Camunda components span three trust ecosystems that each require a different CA input format:

| Runtime             | Components                                                                                       | Trust input                                           |
| ------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| OS / OpenSSL native | libcurl, Go `crypto/x509`, OpenSearch native client (post-8.6.7), PostgreSQL JDBC `sslrootcert=` | PEM via `SSL_CERT_FILE`                               |
| JVM                 | Operate, Tasklist, Optimize, Web Modeler restapi, Identity, Connectors, Zeebe broker             | PKCS12/JKS keystore via `-Djavax.net.ssl.trustStore=` |
| Node.js             | Console, Web Modeler websockets                                                                  | PEM via `NODE_EXTRA_CA_CERTS`                         |

The `values-tls.yaml` overlay bridges all three from a single PEM bundle:

1. Mounts the bundle at `/etc/camunda/tls/ca.crt`.
2. Sets `SSL_CERT_FILE` and `NODE_EXTRA_CA_CERTS` to that path on every component.
3. Runs a per-JVM-component init container that copies the JRE's `cacerts` (PKCS12 on Java 21) into a shared `emptyDir` and imports each certificate in the bundle via `keytool -importcert`. Override `global.tls.caBundle.image` only if a component image lacks `keytool`.
4. Prepends `JAVA_TOOL_OPTIONS` with `-Djavax.net.ssl.trustStore=/var/camunda/tls-truststore/cacerts -Djavax.net.ssl.trustStorePassword=changeit`.

**Caution: `SSL_CERT_FILE` replaces the system bundle**

`SSL_CERT_FILE` _replaces_ (not appends to) the OS CA bundle for OpenSSL clients. Include all public CAs your components reach alongside your private CA:

```bash
cat /etc/ssl/certs/ca-certificates.crt your-private-ca.pem > camunda-ca-bundle.pem
```

Python-based connector containers are an exception: `requests` reads `REQUESTS_CA_BUNDLE` / `CURL_CA_BUNDLE`, not `SSL_CERT_FILE`. Set `REQUESTS_CA_BUNDLE=/etc/camunda/tls/ca.crt` on those containers.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/tls
