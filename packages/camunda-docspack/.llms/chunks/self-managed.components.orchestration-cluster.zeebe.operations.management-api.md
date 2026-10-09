# Management API

The Zeebe Gateway also exposes an HTTP endpoint for cluster management operations.

As well as the [REST](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview) and [gRPC API](https://docs.camunda.io/docs/next/apis-tools/zeebe-api/grpc) for process instance execution, the Zeebe Gateway exposes an HTTP endpoint for cluster management operations.


## About this API

This API is not expected to be used by a typical user, but by a privileged user such as a cluster administrator.

It is exposed via a different port, and configured using configuration `management.server.port` (or via environment variable `MANAGEMENT_SERVER_PORT`). By default, this is set to `9600`.

The API is a custom endpoint available via [Spring Boot Actuator](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.endpoints).

**Info**
For additional configurations such as security, refer to the official [Spring Boot documentation](https://spring.io/guides).

The management port is typically not publicly exposed. If the machine where you run these commands cannot reach the gateway, create a private connection such as `kubectl port-forward svc/camunda-zeebe-gateway 9600:9600`, then use `localhost` as the gateway host. The examples use `http://` for a management endpoint without TLS. If your endpoint uses TLS, use `https://` and the appropriate `curl` TLS options.

### Operations

This API currently supports the following operations:

- [Rebalancing](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/rebalancing)
- [Pause and resume exporting](#exporting-api)
- [Enable and disable exporter](#exporters-api)
- [Update partition distribution](#partitioning-api)
- [Add or re-add a zone](#add-or-re-add-a-zone)
- [Remove a zone](#remove-a-zone)
- [Migrate a zone](#migrate-a-zone-to-a-zone-aware-topology)

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api
