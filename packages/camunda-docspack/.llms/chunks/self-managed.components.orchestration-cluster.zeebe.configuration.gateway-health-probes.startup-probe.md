# Gateway health probes — Startup probe

The started probe is available at `{zeebe-gateway}:9600/actuator/health/startup`.

In the default configuration this is merely an alias for the **Gateway Started** health indicator. Other configurations are possible (see below).


## Liveness probe

The liveness probe is available at `{zeebe-gateway}:9600/actuator/health/liveness`.

It is based on the health indicators mentioned above.

In the default configuration, the liveness probe is comprised of the following health indicators:

- **Gateway Started** - Checks if the gateway is running (i.e. not currently starting and not yet shut down).
- **Liveness Gateway Responsive** - Checks if the gateway can handle a request within an ample timeout, but will only report a `DOWN` health status after the underlying health indicator is down for more than 10 minutes.
- **Liveness Gateway Cluster Awareness** - Based on gateway cluster awareness, but will only report a `DOWN` health status after the underlying health indicator is down for more than five minutes.
- **Liveness Gateway Partition Leader Awareness** - Based on gateway partition leader awareness, but will only report a `DOWN` health status after the underlying health indicator is down for more than five minutes.
- **Liveness Disk Space** - Checks that the free disk space is greater than 1 MB.
- **Liveness Memory** - Checks that at least 1% of max memory (heap) is still available.

**Note**
Health indicators with the _liveness_ prefix are intended to be customized for the liveness probe. This allows defining tighter thresholds (e.g. for free memory 1% for liveness vs. 10% for health), as well as adding tolerance for short downtimes (e.g. gateway has no awareness of other nodes in the cluster for more than five minutes).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway-health-probes
