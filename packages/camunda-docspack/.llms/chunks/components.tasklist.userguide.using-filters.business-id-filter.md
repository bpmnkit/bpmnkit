# Using filters — Business ID filter

A [business ID](https://docs.camunda.io/docs/next/components/concepts/process-instance-creation#business-id) is a domain-specific process instance identifier, such as an order number, case reference, or ticket ID. Starting in 8.10, you can filter tasks by business ID directly in the Tasklist filter dialog.

To filter by business ID, open the filter dialog and use the **Business ID** field.

| UI operator   | Behavior                                           | Wildcards                                                   |
| :------------ | :------------------------------------------------- | :---------------------------------------------------------- |
| **Equals**    | Exact match on the business ID value.              | —                                                           |
| **Contains**  | Pattern match.                                     | `*` matches multiple characters, `?` matches one character. |
| **Is one of** | Matches any business ID in a comma-separated list. | —                                                           |

For additional operators (`$neq`, `$exists`, `$notIn`), use the [search user tasks API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/search-user-tasks.api) with the `businessId` filter field.

---
Source: https://docs.camunda.io/docs/next/components/tasklist/userguide/using-filters
