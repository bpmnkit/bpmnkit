# Optimize export filtering — Process definition filtering

Use process definition filters to include or exclude entire processes from Optimize. Records tied to excluded processes (including process instances, variables, and incidents) are dropped before they reach Optimize's import indices.

This is useful when you have high-volume processes that don't need analytics in Optimize.

| Goal                           | Option                   |
| ------------------------------ | ------------------------ |
| Export only specific processes | `bpmnProcessIdInclusion` |
| Exclude specific processes     | `bpmnProcessIdExclusion` |

Both options can coexist in the same configuration, with exclusion taking precedence when an ID appears in both lists. Value types without a `bpmnProcessId`, such as `DEPLOYMENT` and `DECISION`, are not affected by these filters.

**Example**

### elasticsearch

```yaml
camunda:
  data:
    exporters:
      elasticsearch:
        args:
          index:
            bpmnProcessIdInclusion:
              - orderProcess
            bpmnProcessIdExclusion:
              - debugProcess
```

### opensearch

```yaml
camunda:
  data:
    exporters:
      opensearch:
        args:
          index:
            bpmnProcessIdInclusion:
              - orderProcess
            bpmnProcessIdExclusion:
              - debugProcess
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/optimize-export-filtering
