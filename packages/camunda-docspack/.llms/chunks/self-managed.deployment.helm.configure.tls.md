# Configure TLS

Enable TLS for Camunda 8 Self-Managed component connections to datastores using the Helm chart's values-tls.yaml overlay.


## What's covered

| Connection                                                                                 | Mechanism                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Camunda components → Elasticsearch (private CA, self-hosted or AWS)                        | `global.tls.caBundle`                                                                                                                                                                         |
| Camunda components → OpenSearch (private CA, self-hosted or AWS-managed)                   | `global.tls.caBundle`                                                                                                                                                                         |
| Camunda components → PostgreSQL JDBC (`sslmode=verify-full` + CA)                          | `global.tls.caBundle` + JDBC URL                                                                                                                                                              |
| Camunda components → external OIDC issuer with private CA (Entra, Okta, internal Keycloak) | `global.tls.caBundle`                                                                                                                                                                         |
| Browser / external client → Ingress / GatewayAPI (UI, gRPC)                                | Standard Kubernetes Ingress TLS — configured via per-component `*.ingress.tls` or `global.gateway.tls`, _not_ `global.tls.caBundle`. See [Ingress configuration](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/ingress/ingress-setup). |

In-cluster pod-to-pod traffic is not covered by this overlay — see [In-cluster transport (service mesh required)](#in-cluster-transport-service-mesh-required).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/tls
