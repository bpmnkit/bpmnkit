# Overview — Troubleshooting

#### Optimize reports `nested_limit_exceeded`

**Observed behavior:** Optimize's [error metrics](https://docs.camunda.io/docs/next/self-managed/operational-guides/monitoring/metrics#optimize-error-metrics) show `optimize_error_total{ERROR_TYPE="nested_limit_exceeded"}` increasing, or data stops appearing for very large process instances.

**Why this happens:** A process instance's nested documents (activities, variables, or incidents) exceeded the configured [`nested_documents_limit`](#elasticsearch-index-settings) (default `10000`). Elasticsearch and OpenSearch cap nested documents per parent document to prevent out-of-memory errors.

**How to fix:**

- Raise `es.settings.index.nested_documents_limit` (or the [OpenSearch equivalent](#opensearch-index-settings)) if your process instances legitimately need more than the default.
- Alternatively, enable [`import.skipDataAfterNestedDocLimitReached`](#import) to skip further data for that instance once the limit is reached, instead of the import failing.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration
