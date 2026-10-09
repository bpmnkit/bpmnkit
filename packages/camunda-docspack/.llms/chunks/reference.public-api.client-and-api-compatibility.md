# Camunda 8 public API — Client and API compatibility

Public API components follow strict compatibility guarantees so you can upgrade clients and clusters independently.

| Component                                                                                                               | Forward-compatible | Backward-compatible |
| ----------------------------------------------------------------------------------------------------------------------- | :----------------: | :-----------------: |
| [Camunda Java client](https://docs.camunda.io/docs/next/apis-tools/java-client/getting-started)                                                       |       ✅ Yes       |       ✅ Yes        |
| [Spring SDK](https://docs.camunda.io/docs/next/apis-tools/camunda-spring-boot-starter/getting-started)                                                |       ✅ Yes       |       ✅ Yes        |
| [Node.js SDK](https://github.com/camunda/camunda-nodejs-sdk)                                                            |       ✅ Yes       |       ✅ Yes        |
| [Camunda Process Test](https://docs.camunda.io/docs/next/apis-tools/testing/getting-started)                                                          |       ✅ Yes       |       ✅ Yes        |
| [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview) |         —          |       ✅ Yes        |

- **Forward-compatible**: A client can work with a _newer_ version of the Orchestration Cluster than the client version.
- **Backward-compatible**: A client can be upgraded to a _newer_ version without requiring changes to your application code.

### Clients and SDKs

The Camunda Java client, Spring SDK, Node.js SDK, and Camunda Process Test (CPT) are both **forward-compatible** with new releases of the Orchestration Cluster while being **backward-compatible** regarding application integration.

- **Forward compatibility**: Your application can use an older client version and still work correctly against a newer cluster. For example, an application using Camunda Java client **8.8.3** works against an Orchestration Cluster running **8.9.1**. This allows you to upgrade the Orchestration Cluster first without immediately updating your client libraries.

- **Backward compatibility**: When you upgrade the client or SDK version in your application, no code changes are required. New minor and patch versions of the clients do not introduce breaking changes. For example, upgrading the Spring SDK dependency from **8.8.x** to **8.9.x** does not require changes to your application code.

### Camunda Process Test (CPT)

CPT is both forward-compatible with the Orchestration Cluster and Connectors runtime and backward-compatible regarding application integration:

- **Forward-compatible**: You can change the version of the Orchestration Cluster/Connectors bundle in your tests to a newer version without any changes.
- **Backward-compatible**: Upgrading the CPT dependency version does not require changes to your existing tests.

### REST APIs

The [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview) is **backward-compatible**. No breaking changes are introduced to existing endpoints in newer versions of the Orchestration Cluster. For example, if you build a custom client implementation against the **8.8** REST APIs, it continues to work against a newer Orchestration Cluster version such as **8.9**.

**Note**
As REST API endpoints are part of the Orchestration Cluster itself, forward compatibility does not apply. Your cluster version determines the available endpoints.

### Recommended upgrade order

When upgrading across minor versions, the recommended approach is:

1. **Upgrade the Orchestration Cluster first.** Forward compatibility of clients ensures your existing applications continue to work.
2. **Upgrade your client libraries.** Backward compatibility of clients ensures no code changes are needed.

---
Source: https://docs.camunda.io/docs/next/reference/public-api
