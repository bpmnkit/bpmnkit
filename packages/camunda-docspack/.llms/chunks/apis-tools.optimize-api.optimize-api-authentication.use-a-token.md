# Authentication — Use a token

Include the previously captured token as an authorization header in each request: `Authorization: Bearer <TOKEN>`.

For example, to send a request to the Optimize API's ["Get dashboard IDs"](https://docs.camunda.io/docs/next/apis-tools/optimize-api/dashboard/get-dashboard-ids) endpoint:

**Tip**
The `${CAMUNDA_OPTIMIZE_BASE_URL}` variable below represents the URL of the Optimize API. You can capture this URL when creating an API client. You can also construct it as `https://${REGION}.optimize.camunda.io/${CLUSTER_ID}`.

**Tip**
The `${CAMUNDA_OPTIMIZE_BASE_URL}` variable below represents the URL of the Optimize API. You can configure this value in your Self-Managed installation. The default value is `http://localhost:8083`.

```shell
curl --header "Authorization: Bearer ${TOKEN}" \
     -G --data-urlencode "collectionId=${COLLECTION_ID}" \
     ${CAMUNDA_OPTIMIZE_BASE_URL}/api/public/dashboard
```

A successful response includes [dashboard IDs](https://docs.camunda.io/docs/next/apis-tools/optimize-api/dashboard/get-dashboard-ids). For example:

```json
[
  {
    "id": "11111111-1111-1111-1111-111111111111"
  },
  {
    "id": "22222222-2222-2222-2222-222222222222"
  }
]
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/optimize-api-authentication
