# RDBMS search APIs and result count behavior — Configuration

### Maximum result limit

The result count cap is configurable per deployment:

| Parameter                                                   | Type    | Default | Description                                                                                              |
| ----------------------------------------------------------- | ------- | ------- | -------------------------------------------------------------------------------------------------------- |
| `camunda.data.secondary-storage.rdbms.query.max-total-hits` | integer | `10000` | Maximum number of results to count. Set higher to count larger result sets (performance cost increases). |

Current chart style (embedded `application.yml`):

```yaml
orchestration:
  extraConfiguration:
    - file: application.yml
      content: |
        camunda.data.secondary-storage.rdbms.query.max-total-hits: 10000
```

**Warning**
Increasing `maxTotalHits` gives accurate counts for larger result sets but increases database load, especially for queries with large result sets. Test in your environment before setting values above 10,000.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-search-and-result-limits
