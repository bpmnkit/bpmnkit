# RDBMS search APIs and result count behavior

Understand how totalResults is computed in RDBMS-backed search APIs, result limits, and best practices for query performance.

When using RDBMS as secondary storage, search APIs behave similarly to Elasticsearch/OpenSearch, but with important differences in how result counts are computed and limited.


## Result count behavior

### Total results capping

In RDBMS-backed deployments, `totalResults` is capped at **10,000** to improve performance and match Elasticsearch/OpenSearch behavior. See [query performance guidance](#query-performance-guidance) for optimization strategies.

Example response:

```json
{
  "items": [
    /* 100 items */
  ],
  "totalResults": 10000,
  "hasMoreTotalItems": true
}
```

### hasMoreTotalItems field

When the actual result set exceeds the cap, the `hasMoreTotalItems` boolean field is set to `true`. This indicates there are more results available and that pagination is still possible—you can continue querying with `searchAfter` or `page` parameters. Use this field in UI components to display "more results available" without computing exact counts.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-search-and-result-limits
