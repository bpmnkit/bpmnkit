# Migrate from Web Modeler to the Camunda Hub API — General changes — Search filters

Web Modeler API v1 uses equality-only filters, except for dates:

```json title="Web Modeler API v1"
{
  "filter": {
    "name": "my-process",
    "type": "bpmn"
  }
}
```

You can still use simple equality filters in Camunda Hub API v2, and you can also use more advanced explicit filter operators:

```json title="Camunda Hub API v2"
{
  "filter": {
    "name": { "$eq": "my-process" },
    "type": { "$in": ["bpmn"] }
  }
}
```

The following advanced filter operators are available in Camunda Hub API v2:

| Operator         | Description                             | Example                                                                     |
| ---------------- | --------------------------------------- | --------------------------------------------------------------------------- |
| `$eq`            | Equals (same as v1 default)             | `{ "name": { "$eq": "my-process" } }`                                       |
| `$neq`           | Not equals                              | `{ "type": { "$neq": "dmn" } }`                                             |
| `$gt` / `$gte`   | Greater than / greater than or equal to | `{ "created": { "$gte": "2024-01-01T00:00:00Z" } }`                         |
| `$lt` / `$lte`   | Less than / less than or equal to       | `{ "created": { "$lt": "2024-06-01T00:00:00Z" } }`                          |
| `$like`          | Pattern match (SQL LIKE)                | `{ "name": { "$like": "%order%" } }`                                        |
| `$in` / `$notIn` | In / not in list                        | `{ "type": { "$in": ["bpmn", "form"] } }`                                   |
| `$exists`        | Null check                              | `{ "folderKey": { "$exists": false } }`                                     |
| `$or`            | Logical OR                              | `{ "$or": [{ "type": { "$eq": "bpmn" } }, { "type": { "$eq": "form" } }] }` |

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api
