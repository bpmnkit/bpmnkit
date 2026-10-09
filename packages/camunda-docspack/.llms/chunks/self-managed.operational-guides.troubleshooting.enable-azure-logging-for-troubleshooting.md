# Camunda components troubleshooting — Enable Azure logging for troubleshooting

When using Azure Blob Storage as a backup store, you can enable logging to
troubleshoot issues with the Azure SDK. To do this, go through the following steps:

1. Add logging for Azure SDK, and set it to debug through the Zeebe Broker
   loggers endpoint:

`curl 'http://localhost:9600/actuator/loggers/com.azure' -i -X POST -H 'Content-Type: application/json' -d '{"configuredLevel":"debug"}'`

2. Add the following environment variable to the Zeebe Broker StatefulSet.

`AZURE_HTTP_LOG_DETAIL_LEVEL=BASIC`


## Zeebe Ingress (gRPC)

Zeebe requires an Ingress controller that supports `gRPC` which is built on top of `HTTP/2` transport layer. Therefore, to expose Zeebe Gateway externally, you need the following:

1. An Ingress controller that supports `gRPC`. The reference architectures deploy [Contour](https://projectcontour.io/), which supports it through the `projectcontour.io/upstream-protocol.h2c` annotation on the Orchestration Cluster service. [Ingress-nginx](https://github.com/kubernetes/ingress-nginx) supports it through the `nginx.ingress.kubernetes.io/backend-protocol: GRPC` annotation on the Ingress.
2. TLS (HTTPS) via [Application-Layer Protocol Negotiation (ALPN)](https://www.rfc-editor.org/rfc/rfc7301.html) enabled in the Zeebe Gateway Ingress object.

However, according to the official Kubernetes documentation about [Ingress TLS](https://kubernetes.io/docs/concepts/services-networking/ingress/#tls):

> There is a gap between TLS features supported by various Ingress controllers. Please refer to documentation on nginx, GCE, or any other platform specific Ingress controller to understand how TLS works in your environment.

Therefore, pay attention to the TLS configuration of the Ingress controller of your choice. Find more details about the Zeebe Ingress setup in the [Kubernetes platforms supported by Camunda](https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/quick-install).

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/troubleshooting
