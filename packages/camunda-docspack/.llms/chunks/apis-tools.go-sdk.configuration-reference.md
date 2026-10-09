# Configuration reference

# Configuration reference

**Caution: Technical Preview**
The Go SDK is a **technical preview**. Its API surface may still evolve and changes may not follow semantic versioning. Pin an exact version if you need stability.

`CAMUNDA_*` variables are canonical; the `ZEEBE_*` names are accepted as
fallbacks for compatibility with older tooling. Functional options take
precedence over both.


## Connection

| Variable                                          | Default                 | Description                                                            |
| ------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------- |
| `CAMUNDA_REST_ADDRESS` / `ZEEBE_REST_ADDRESS`     | `http://localhost:8080` | Orchestration Cluster REST base address.                               |
| `CAMUNDA_GRPC_ADDRESS` / `ZEEBE_GRPC_ADDRESS`     | `localhost:26500`       | Zeebe gRPC gateway address (`host:port`) for the streaming job worker. |
| `CAMUNDA_DEFAULT_TENANT_ID` / `CAMUNDA_TENANT_ID` | —                       | Default tenant id applied to operations that accept one.               |

---
Source: https://docs.camunda.io/docs/next/apis-tools/go-sdk/configuration-reference
