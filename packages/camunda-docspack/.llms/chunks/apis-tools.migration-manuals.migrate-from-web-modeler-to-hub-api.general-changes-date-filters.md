# Migrate from Web Modeler to the Camunda Hub API — General changes — Date filters

Web Modeler API v1 supports a custom date precision syntax that encodes a comparison operator, timestamp, and truncation unit into a single string. Camunda Hub API v2 uses explicit operators instead. You compute period boundaries yourself.

The following examples show equivalent date filters in Web Modeler API v1 and Camunda Hub API v2:

| Web Modeler API v1             | Camunda Hub API v2                                                       | Explanation                          |
| ------------------------------ | ------------------------------------------------------------------------ | ------------------------------------ |
| `2023-09-20T00:00:00Z\|\|/y`   | `{ "$gte": "2023-01-01T00:00:00Z", "$lte": "2023-12-31T23:59:59.999Z" }` | Within year 2023                     |
| `2023-09-20T00:00:00Z\|\|/M`   | `{ "$gte": "2023-09-01T00:00:00Z", "$lte": "2023-09-30T23:59:59.999Z" }` | Within September 2023                |
| `>=2023-09-20T00:00:00Z\|\|/y` | `{ "$gte": "2023-01-01T00:00:00Z" }`                                     | On or after start of 2023            |
| `<2023-09-20T00:00:00Z\|\|/M`  | `{ "$lt": "2023-09-01T00:00:00Z" }`                                      | Before September 2023                |
| `2023-09-20T11:31:20Z`         | `{ "$eq": "2023-09-20T11:31:20Z" }`                                      | Exact match                          |
| `>=2023-09-20T11:31:20Z`       | `{ "$gte": "2023-09-20T11:31:20Z" }`                                     | On or after a specific date and time |

The following date filter operators are available in Camunda Hub API v2:

| Operator | Description                 |
| -------- | --------------------------- |
| `$eq`    | Equals (same as v1 default) |
| `$gt`    | Greater than                |
| `$gte`   | Greater than or equal to    |
| `$lt`    | Less than                   |
| `$lte`   | Less than or equal to       |

---
Source: https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-from-web-modeler-to-hub-api
