# RDBMS version support policy — Known limitations

When using RDBMS (including as secondary storage), be aware of the following limitations:

### ID size limits

Most user-defined strings exported to RDBMS-backed secondary storage are limited to **256 characters**. This includes BPMN and DMN IDs and names, job worker types, variable names, resource names, form IDs, and message names or correlation keys.

If a DMN rule does not define its own ID, Camunda generates one from the decision ID, decision version, and rule index. In that case, keep the decision ID at **235 characters or fewer** so the generated rule ID stays within the RDBMS limit.

Identity objects are also limited to **256 characters**, regardless of which secondary storage backend the Orchestration Cluster uses.

For the full backend comparison, including the Elasticsearch/OpenSearch limit of 32,768 characters and details on how length is counted, see [string length limits for user-defined values](https://docs.camunda.io/docs/next/self-managed/concepts/databases/overview#string-length-limits-for-user-defined-values).

### Variable comparison limits

When retrieving variables through the REST API, the following comparison operators only apply to the first **4000 characters** (or **8191 characters**, depending on the database vendor) of large String or JSON variables:

- `equals`
- `notEquals`
- `in`
- `notIn`

The `LIKE` comparison operator is not affected by this limitation.

### Collation and sorting behavior

Because collation behavior varies across database vendors, results sorted by string fields may differ between systems. Ensure your application accounts for potential sorting variations when migrating between different RDBMS vendors.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/rdbms-support-policy
