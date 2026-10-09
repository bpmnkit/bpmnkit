# Configure Orchestration REST and gRPC TLS modes — Supported modes

| Mode                | `global.tls.orchestration.rest.enabled` | `global.tls.orchestration.grpc.enabled` | `/orchestration` Ingress backend | gRPC Ingress backend-protocol | Web Modeler gRPC | Connectors gRPC | REST clients |
| ------------------- | --------------------------------------- | --------------------------------------- | -------------------------------- | ----------------------------- | ---------------- | --------------- | ------------ |
| Plaintext (default) | `false`                                 | `false`                                 | HTTP                             | `GRPC`                        | `grpc://`        | `http://`       | `http://`    |
| REST TLS only       | `true`                                  | `false`                                 | HTTPS                            | `GRPC`                        | `grpc://`        | `http://`       | `https://`   |
| gRPC TLS only       | `false`                                 | `true`                                  | HTTP                             | `GRPCS`                       | `grpcs://`       | `https://`      | `http://`    |
| Both TLS            | `true`                                  | `true`                                  | HTTPS                            | `GRPCS`                       | `grpcs://`       | `https://`      | `https://`   |

The chart derives Web Modeler and Connectors endpoints automatically. Explicit `webModeler.restapi.clusters` and `connectors.configuration` blocks remain authoritative — set them only if you need an endpoint shape the helpers do not produce.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/orchestration-tls-modes
