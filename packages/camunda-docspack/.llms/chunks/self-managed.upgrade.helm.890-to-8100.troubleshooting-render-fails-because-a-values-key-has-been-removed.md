# Upgrade Camunda 8.9 to 8.10 using Helm — Troubleshooting — Render fails because a values key has been removed

If `helm upgrade` fails with `[camunda][error] The Helm values file key "<KEY>" has been removed.`, your values file still sets a key that chart 15.x no longer accepts. The chart checks for these keys before it changes any workloads. Remove or replace the key. For details, see [Remove keys rejected by chart 15.x](#remove-keys-rejected-by-chart-15x).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
