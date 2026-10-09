# Filter process instances — Business ID filter

A [business ID](https://docs.camunda.io/docs/next/components/concepts/process-instance-creation#business-id) is a domain-specific identifier assigned to a process instance at creation — for example, an order number, case reference, or ticket ID. Starting in 8.10, you can filter process instances by business ID directly in the Operate UI.

To filter by business ID, open the **Filter** panel and use the **Business ID** field.

| UI operator   | Behavior                                           | Wildcards                                                   |
| :------------ | :------------------------------------------------- | :---------------------------------------------------------- |
| **Equals**    | Exact match on the business ID value.              | —                                                           |
| **Contains**  | Pattern match.                                     | `*` matches multiple characters, `?` matches one character. |
| **Is one of** | Matches any business ID in a comma-separated list. | —                                                           |

For additional operators (`$neq`, `$exists`), use the [search process instances API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/search-process-instances.api) with the `businessId` filter field.

---
Source: https://docs.camunda.io/docs/next/components/operate/userguide/filter-process-instances
