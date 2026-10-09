# Filter process instances — Known limitations

- **Numeric operators**: Greater than, less than, and range operators are not available. Use exact match or prefix matching with **contains**.
- **OR logic**: Filters are combined with AND logic only; OR conditions are not supported.
- **Variable name autocomplete**: Variable names must be entered as free text. Variable name suggestions based on process definitions are a planned future enhancement.
- **Nested JSON path filtering**: Filtering on nested properties within JSON objects (for example, `customer.region`) is not supported; filter on the top-level variable only.
- **Value truncation**: Value-based operators (`equals`, `not equal`, `is one of`, and `contains`) search only the first ~8,000 characters of a variable value.
- **Filter sharing**: Filter state is stored in your browser session and cannot be shared via URL. See [filter persistence](#filter-persistence) for details.

---
Source: https://docs.camunda.io/docs/next/components/operate/userguide/filter-process-instances
