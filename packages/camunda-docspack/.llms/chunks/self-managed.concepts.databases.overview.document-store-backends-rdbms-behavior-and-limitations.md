# Overview — Document-store backends — RDBMS behavior and limitations

When using an RDBMS as secondary storage, keep the following limitations in mind:

- **Length limits for user-defined values:** Most user-defined strings that are exported to secondary storage or stored in identity management are length-limited. See [string length limits for user-defined values](#string-length-limits-for-user-defined-values).

- **Variable comparisons:** For String and JSON variables, comparison operators (`equals`, `notEquals`, `in`, `notIn`) only consider the first 8191 characters (or 4000 characters with Oracle). `LIKE` comparisons are not affected.

- **Sorting may differ by vendor:** Because collation behavior varies across database vendors, results sorted by string fields may differ between systems.

#### String length limits for user-defined values

Camunda limits most user-defined strings before they are exported to secondary storage or stored in identity management.

| Scope                                      | Limit                 | Notes                                                                                                |
| ------------------------------------------ | --------------------- | ---------------------------------------------------------------------------------------------------- |
| Elasticsearch/OpenSearch secondary storage | **32,768 characters** | This matches the practical limit for the relevant Elasticsearch / OpenSearch string fields.          |
| RDBMS secondary storage                    | **256 characters**    | This limit is chosen to align exported field lengths with the supported RDBMS schema.                |
| Identity objects                           | **256 characters**    | This limit applies independently of the secondary storage backend used by the Orchestration Cluster. |

These limits are enforced using Java string length semantics rather than raw UTF-8 byte counts. In practice, most common Latin, CJK, and Arabic characters count as one character, while characters represented as surrogate pairs in Java count as two. Because of that, the effective visible-character limit can be lower for some inputs.

The limits apply to the following user-defined fields:

- BPMN element IDs and names
- DMN element IDs and names
- Job worker types in task definitions
- Variable names
- Resource names of deployed BPMN, DMN, and form files
- Form IDs
- Message names and correlation keys
- Identity object identifiers and names

Special case for DMN on RDBMS: if a rule does not define its own ID, Camunda generates one from the decision ID, decision version, and rule index. In that case, keep the decision ID at **235 characters or fewer** so the generated rule ID stays within the RDBMS limit.

These limits are currently not configurable. In particular, the RDBMS-backed limits are tied to the database schema and do not increase automatically if you change application configuration.

#### Working with variables

When retrieving variables through the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview), the following comparison operators only apply to the first 4000 characters of large String or JSON variables:

- equals
- notEquals
- in
- notIn

This ensures consistent performance on large datasets. For details, see the [get variable specification](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-variable.api).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/overview
