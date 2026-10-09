# Upgrade Camunda 8.9 to 8.10 using Helm — Update your values file to 8.10 — Camunda Hub `Recreate` strategy requires `existingClaim`

In chart 15.x (8.10), `deploymentStrategy: Recreate` requires `persistence.enabled: true` and `persistence.existingClaim`. If one of these settings is missing, the render fails with a `[camunda][error]` message. The requirement applies to `webModeler.persistence` and `camundaHub.persistence`. The default `RollingUpdate` strategy is not affected.

The 8.9 chart renders `Recreate` with `persistence.enabled: true` and no `existingClaim`. It emits a `[camunda][warning]` instead of an error.

Before you upgrade, do one of the following:

- Set `persistence.existingClaim` with `persistence.enabled: true`.
- Remove `deploymentStrategy: Recreate`.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
