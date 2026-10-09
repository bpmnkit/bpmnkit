# Optimize export filtering — Variable filtering

Use variable filtering to control which variables are exported to Optimize. It is an effective mitigation for Optimize's impact on Elasticsearch or OpenSearch sizing. See [impact of Optimize](https://docs.camunda.io/docs/next/components/best-practices/architecture/sizing-your-environment#impact-of-optimize) for details.

You can disable variable export entirely, filter by name, or filter by value type.

### Disable all variable export

Set `variable: false` to stop the exporter from writing any variable records to Optimize indices.

### elasticsearch

```yaml
camunda:
  data:
    exporters:
      elasticsearch:
        args:
          index:
            variable: false
```

### opensearch

```yaml
camunda:
  data:
    exporters:
      opensearch:
        args:
          index:
            variable: false
```

### Filter by variable name

Use name-based inclusion and exclusion lists to export only the variables you need. You can match by exact name, prefix (`startsWith`), or suffix (`endsWith`). Exclusion wins over inclusion when both rules match the same variable name.

| Goal                       | Options                                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| Include specific variables | `variableNameInclusionExact`, `variableNameInclusionStartWith`, `variableNameInclusionEndWith` |
| Exclude specific variables | `variableNameExclusionExact`, `variableNameExclusionStartWith`, `variableNameExclusionEndWith` |

**Example**

### elasticsearch

```yaml
camunda:
  data:
    exporters:
      elasticsearch:
        args:
          index:
            variableNameInclusionStartWith:
              - business
            variableNameExclusionStartWith:
              - business_debug
```

### opensearch

```yaml
camunda:
  data:
    exporters:
      opensearch:
        args:
          index:
            variableNameInclusionStartWith:
              - business
            variableNameExclusionStartWith:
              - business_debug
```

### Filter by variable type

Use type-based inclusion and exclusion lists to filter variables by their inferred JSON type. Valid types are `String`, `Number`, `Boolean`, `Object`, and `Null`.

| Goal                        | Options                      |
| --------------------------- | ---------------------------- |
| Include specific types only | `variableValueTypeInclusion` |
| Exclude specific types      | `variableValueTypeExclusion` |

**Example**

### elasticsearch

```yaml
camunda:
  data:
    exporters:
      elasticsearch:
        args:
          index:
            variableValueTypeInclusion:
              - String
            variableValueTypeExclusion:
              - Object
```

### opensearch

```yaml
camunda:
  data:
    exporters:
      opensearch:
        args:
          index:
            variableValueTypeInclusion:
              - String
            variableValueTypeExclusion:
              - Object
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/optimize-export-filtering
