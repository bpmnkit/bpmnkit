# Migrate from Web Modeler to the Camunda Hub API — Version API — Search versions

In addition to the [general field changes](#version-api-field-mapping), the following request fields have changed:

| Web Modeler API v1 | Camunda Hub API v2 | Notes                                                                                  |
| ------------------ | ------------------ | -------------------------------------------------------------------------------------- |
| `filter`           | `filter`           | Now uses [advanced operators](#search-filters), including `$eq`, `$in`, and `$like`    |
| `filter.fileId`    | `filter.fileKey`   | Renamed. In v2, `filter.fileKey` is required. Versions can't be searched across files. |
| `sort.direction`   | `sort.order`       | Renamed                                                                                |

The following example shows a v1 request:

```json title="Web Modeler API v1"
{
  "filter": {
    "fileId": "0ade583b-4022-47b5-8982-93ddd849ee6b"
  },
  "sort": {
    "field": "name",
    "direction": "DESC"
  }
}
```

The equivalent v2 request:

```json title="Camunda Hub API v2"
{
  "filter": {
    "fileKey": { "$eq": "0ade583b-4022-47b5-8982-93ddd849ee6b" }
  },
  "sort": {
    "field": "name",
    "order": "DESC"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api
