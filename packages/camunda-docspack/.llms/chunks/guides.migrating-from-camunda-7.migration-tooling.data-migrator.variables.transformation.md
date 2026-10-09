# Variables — Transformation

Variable transformations are handled by built-in transformers that run in a specific execution order. Validators run first (Order: 1-3) to reject unsupported types, followed by transformers (Order: 10-20) that convert supported types.

### Date

- Input: Java `Date` objects from Camunda 7
- Output: ISO 8601 formatted strings (`yyyy-MM-dd'T'HH:mm:ss.SSSZ`)
- Example: `2024-07-25T14:30:45.123+0200`
- Timezone: Uses the JVM's default timezone setting

### JSON

JSON variables are handled differently depending on their origin and migration mode:

Spin JSON Variables and JSON Object Variables (serialized with `application/json`):

- Runtime migration:
  - Deserializes JSON into Map structures for Camunda 8.
  - Preserves the nested object structure.
  - Example: `{"name": "John", "age": 30}` becomes a Map object.
- History migration:
  - Preserves JSON values as raw strings.
  - Example: `{"name": "John", "age": 30}` is stored as-is.

**Invalid JSON**:
If JSON cannot be parsed during runtime migration, the migrator skips the process instance.

### XML

Spin XML Variables and XML Object Variables (serialized with `application/xml`):

- Raw XML string content is preserved
- No parsing or transformation applied

### Name compatibility

The migrator handles variable names that are invalid in FEEL expressions:

- Names starting with numbers (e.g., `1stVariable`)
- Names with spaces (e.g., `my variable`)
- Names with special characters (e.g., `var/name`, `var-name`)
- Reserved keywords (e.g., `null`)

These variables are migrated as-is, but may require special handling in FEEL expressions using bracket notation.

---
Source: https://docs.camunda.io/docs/next/guides/migrating-from-camunda-7/migration-tooling/data-migrator/variables
