# Upgrade Camunda components from 8.9 to 8.10 — Optimize — Default objectVariable inclusion changed

This is a breaking change for Self-Managed. In 8.10, the default value of `zeebe.includeObjectVariableValue` changed from `true` to `false`. Optimize no longer flattens object variables into per-property fields or stores their raw value by default. See the [8.10 breaking change announcement](https://docs.camunda.io/docs/next/reference/announcements-release-notes/8100/8100-announcements#optimize-self-managed-no-longer-flattens-object-variables-by-default) for the full rationale.

| Setting                            | 8.9    | 8.10    |
| ---------------------------------- | ------ | ------- |
| `zeebe.includeObjectVariableValue` | `true` | `false` |

**Action:** If your reports, filters, or Raw Data Reports rely on flattened object variable properties, set `zeebe.includeObjectVariableValue: true` (environment variable `CAMUNDA_OPTIMIZE_ZEEBE_INCLUDE_OBJECT_VARIABLE=true`) before upgrading:

```yaml
zeebe:
  includeObjectVariableValue: true
```

Optimize logs a `WARN` on startup whenever object variable values are not being imported. The message includes the opt-in setting.

[Object variables configuration](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/object-variables)

In 8.10, Optimize accepts the same `camunda.security.*` configuration as the Orchestration Cluster, and its authentication behavior changes accordingly. See [Optimize authentication in Self-Managed](https://docs.camunda.io/docs/next/self-managed/concepts/authentication/authentication-to-optimize) for the full configuration reference. The following sections cover the configuration key changes.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100
