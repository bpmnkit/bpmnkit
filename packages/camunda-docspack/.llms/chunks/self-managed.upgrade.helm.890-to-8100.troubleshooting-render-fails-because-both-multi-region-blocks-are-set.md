# Upgrade Camunda 8.9 to 8.10 using Helm — Troubleshooting — Render fails because both multi-region blocks are set

If `helm upgrade` fails with `[camunda][error] orchestration.partitioning and global.multiregion are both configured.`, your values file sets the deprecated `global.multiregion` block and its replacement. Keep `orchestration.partitioning`. Remove `global.multiregion`. See [Move `global.multiregion` to `orchestration.partitioning`](#move-globalmultiregion-to-orchestrationpartitioning).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
