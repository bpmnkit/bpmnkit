# Configure Orchestration REST and gRPC TLS modes — Optimize TLS — Configure inbound routing

The dedicated NGINX Ingress template sets its backend protocol to HTTPS when Optimize TLS is enabled. The Gateway API `HTTPRoute` still forwards plaintext unless a `BackendTLSPolicy` targets the Optimize Service. Create that policy according to your Gateway implementation and configure its certificate validation before enabling pod TLS. Without the policy, inbound Optimize traffic through the generated `HTTPRoute` fails.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/orchestration-tls-modes
