# Camunda back up and restore — Considerations — ContextPath

If you are defining the `contextPath` in the Camunda Helm chart or the `management.server.servlet.context-path` in a standalone setup, your API requests must prepend the value specific to the `contextPath` for the individual component. If the `management.server.port` is defined this also applies to `management.endpoints.web.base-path`. You can learn more about this behavior in the [Spring Boot documentation](https://docs.spring.io/spring-boot/docs/2.1.7.RELEASE/reference/html/production-ready-monitoring.html#production-ready-customizing-management-server-context-path).

**Warning: Optimize Helm chart Exception**
Setting the `contextPath` in the Helm chart for Optimize will not overwrite the `contextPath` of the management API, it will remain as `/`.

Example

If you are defining the `contextPath` for the Orchestration Cluster in the Camunda Helm chart:

```bash
orchestration:
   contextPath: /example
```

A call to the management API of the Orchestration Cluster would look like the following example:

```bash
ORCHESTRATION_CLUSTER_MANAGEMENT_API=http://localhost:9600

curl $ORCHESTRATION_CLUSTER_MANAGEMENT_API/example/actuator/health
```

Without the `contextPath` it would just be:

```bash
ORCHESTRATION_CLUSTER_MANAGEMENT_API=http://localhost:9600

curl $ORCHESTRATION_CLUSTER_MANAGEMENT_API/actuator/health
```

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore
