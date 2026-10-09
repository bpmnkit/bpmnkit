# Configure Logical Tenants in Helm chart — Prerequisites

- A running Camunda 8 Self-Managed deployment with authentication enabled.

**Note**
Multi-tenancy requires authentication in the Orchestration Cluster Admin. If authentication is disabled, multi-tenancy does not work.

The memory limit for Management Identity is generally suitable for most multi-tenant deployments. If the tenancy model becomes more complex with many tenants, you might encounter memory pressure on the heap.

If you anticipate higher memory usage, consider increasing the memory limit for Management Identity:

```yaml
identity:
  resources:
    limits:
      memory: 4Gi
```

As an additional safeguard, you can increase the JVM heap allocation by setting:

```yaml
identity:
  env:
    - name: JAVA_TOOL_OPTIONS
      value: -XX:MaxRAMPercentage=50.0
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/configure-logical-tenants
