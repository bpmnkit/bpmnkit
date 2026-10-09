# REST connector — Request — Allow redirects

- **Follow redirects**: When enabled, the connector automatically follows HTTP 3xx redirect responses, resolving the final destination URL. When disabled (default), the connector returns the original 3xx response including the `Location` header, leaving redirect handling to your process logic.

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/rest
