# Delete process definition data — Query parameters

No query parameters available.


## Request body

No request body is required.


## Result

No response body. A `202` response confirms the deletion request was accepted and queued.


## Response codes

Possible HTTP response status codes:

| Code | Description                                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------------------------------ |
| 202  | Request accepted. The deletion has been queued for asynchronous processing.                                              |
| 400  | The provided `processDefinitionKey` is not numeric.                                                                      |
| 401  | Authentication credentials are incorrect or missing. See [authentication](https://docs.camunda.io/docs/next/apis-tools/optimize-api/optimize-api-authentication) for details. |
| 404  | No process definition was found for the provided `processDefinitionKey`.                                                 |
| 409  | A deletion request for this `processDefinitionKey` is already queued.                                                    |

---
Source: https://docs.camunda.io/docs/next/apis-tools/optimize-api/delete-process-definition-data
