# Migrate from Web Modeler to the Camunda Hub API — Workspace API — Search workspaces

In addition to the [general field changes](#workspace-api-field-mapping), the following request fields have changed:

| Web Modeler API v1       | Camunda Hub API v2 | Notes                                                                                           |
| ------------------------ | ------------------ | ----------------------------------------------------------------------------------------------- |
| `filter`                 | `filter`           | Now uses [advanced operators](#search-filters), including `$eq`, `$in`, and `$like`             |
| `filter.id`              | -                  | Removed                                                                                         |
| `filter.description`     | -                  | Removed                                                                                         |
| `filter.createdBy.email` | `filter.createdBy` | In v1, `createdBy` is an object. In v2, it's a string representing the creator's email address. |
| `filter.updatedBy.email` | `filter.updatedBy` | In v1, `updatedBy` is an object. In v2, it's a string representing the updater's email address. |
| `sort.direction`         | `sort.order`       | Renamed                                                                                         |

The following example shows a v1 request:

```json title="Web Modeler API v1"
{
  "filter": {
    "createdBy": {
      "email": "jane.doe@email.com"
    }
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
    "createdBy": "jane.doe@email.com"
  },
  "sort": {
    "field": "name",
    "order": "DESC"
  }
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api
