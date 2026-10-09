# Gateway health probes

This section outlines health status, probes, and responsiveness.

The health status for a standalone gateway is available at `{zeebe-gateway}:9600/actuator/health`.

The following health indicators are enabled by default:

- **Gateway Started** - Checks if the gateway is running (i.e. not currently starting and not yet shut down).
- **Gateway Responsive** - Checks if the gateway can handle a request within a given timeout.
- **Gateway Cluster Awareness** - Checks if the gateway is aware of other nodes in the cluster.
- **Gateway Partition Leader Awareness** - Checks if the gateway is aware of partition leaders in the cluster.
- **Disk Space** - Checks that the free disk space is greater than 10 MB.
- **Memory** - Checks that at least 10% of max memory (heap) is still available.

Health indicators are set to sensible defaults. For specific use cases, it might be necessary to customize health probes.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway-health-probes
