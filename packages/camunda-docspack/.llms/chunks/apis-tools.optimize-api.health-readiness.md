# Health readiness

The REST API to check the readiness of Optimize.

The purpose of Health-Readiness REST API is to return information indicating whether Optimize is ready to be used.

**Note**
The Health-Readiness REST API does not require an [`Authorization` header](https://docs.camunda.io/docs/next/apis-tools/optimize-api/optimize-api-authentication). If a request includes one, the header is ignored.


## Method & HTTP target resource

GET `/api/readyz`


## Response

The response is an empty body with the status code indicating the readiness of Optimize. The following responses are available:

- `200`: This indicates that Optimize is ready to use. It is connected to both Elasticsearch and at least one of its configured engines.
- `503`: This indicates that Optimize is not ready to use. It cannot connect to either Elasticsearch or any of its configured engines.

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/health-readiness
