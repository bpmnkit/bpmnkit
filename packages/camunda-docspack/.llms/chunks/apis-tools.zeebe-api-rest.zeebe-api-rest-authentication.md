# Authentication

Describes authentication options that can be used to access Zeebe REST API.

**Warning**
The Zeebe REST API is **deprecated**. While it continues to function, new development should use the Orchestration Cluster REST API by referencing the [Orchestration Cluster REST API migration documentation](https://docs.camunda.io/docs/next/apis-tools/migration-manuals/migrate-to-camunda-api).

The Zeebe REST API uses the same authentication mechanism as the [Orchestration Cluster REST API](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-authentication).

If your environment uses **OIDC-based authentication**, obtain an access token following [Using a token (OIDC/JWT)](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-authentication#using-a-token-oidcjwt).

If **no authentication is configured** (for example, for local development), see [No authentication (local development)](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-authentication#no-authentication-local-development).

When making requests to Zeebe, replace the base URL used in examples with your Zeebe API URL.

Example:

```bash
curl "$ZEEBE_BASE_URL/v2/topology" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

#### Token expiration

Access tokens expire according to the `expires_in` property of a successful authentication response. After this duration, in seconds, you must request a new access token.

---
Source: https://docs.camunda.io/docs/next/apis-tools/zeebe-api-rest/zeebe-api-rest-authentication
