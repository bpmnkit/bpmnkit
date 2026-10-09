# Configure TLS — Common gotchas

### Java 21 default `trustStoreType` is PKCS12

The init container builds a PKCS12 truststore; the chart omits `-Djavax.net.ssl.trustStoreType` to match the JVM default. If you supply a legacy JKS via `tls.secret.existingSecret`, add `-Djavax.net.ssl.trustStoreType=jks` to `javaOpts` explicitly.

### Console and Web Modeler websockets are Node.js

The chart sets both `SSL_CERT_FILE` and `NODE_EXTRA_CA_CERTS` on Node.js components automatically. Do not add `NODE_EXTRA_CA_CERTS` via `console.env` or `webModeler.websockets.env` — Kubernetes last-wins env semantics make the value undefined.


## In-cluster transport (service mesh required)

`global.tls.caBundle` covers component-to-datastore and component-to-IdP connections only.
The following in-cluster connections are plaintext by default:

| Connection                                      | Protocol |
| ----------------------------------------------- | -------- |
| Operate / Tasklist / Connectors → Zeebe gateway | gRPC     |
| Web Modeler / Console / Optimize → Identity     | REST     |
| Spring Boot management / metrics (probes)       | HTTP     |

Encrypt these at the pod level with a service mesh (Linkerd, Istio, or Cilium). See the
[TLS coverage matrix](https://github.com/camunda/camunda-platform-helm/blob/main/docs/tls-coverage-810.md) for the full connection inventory.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/tls
