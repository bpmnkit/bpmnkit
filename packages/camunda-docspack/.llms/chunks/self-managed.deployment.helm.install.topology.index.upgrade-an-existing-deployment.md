# Install the Camunda 8.10 deployment topology — Upgrade an existing deployment

This guide covers fresh releases.

To upgrade an existing 8.9 deployment, first complete the in-place version upgrade while preserving the existing release name, namespace, Orchestration Cluster primary storage, and external data services. See [upgrade Camunda 8.9 to 8.10 using Helm](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100).

Adopting this topology afterwards is a separate operation with its own data and rollback planning. See [move from a combined release to the split topology](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/combined-to-split-topology).


## Existing configurations

The default `global.topology.mode: combined` preserves the existing single-release and single-namespace behavior.

Existing multi-namespace configurations that use `global.identity.auth.*.alwaysRegister`, component authentication values under disabled components, or manual `camundaHub.restapi.clusters` remain supported. This release doesn't deprecate or remove those values.

In `hub` mode, topology values replace the legacy Identity registration presets. An explicitly configured `camundaHub.restapi.clusters` or legacy `webModeler.restapi.clusters` list still takes precedence over generated Hub inventory.

Any future removal must retain compatibility for at least one minor release, emit GitOps-visible deprecation warnings with migration guidance, and occur only in the next major chart release according to the Helm chart deprecation policy.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/topology/index
