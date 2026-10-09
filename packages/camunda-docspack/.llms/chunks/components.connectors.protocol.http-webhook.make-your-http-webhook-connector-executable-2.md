# HTTP Webhook connector — Make your HTTP Webhook connector executable (2)

3. Configure authorization if required in the **Authorization** section. The HTTP Webhook connector supports the following authorization methods:

- **Basic** - The incoming requests must contain an `Authorization` header that contains the word `Basic` followed by a space and a base64-encoded string username:password.
  - Set the **Username** and **Password** properties which will be used to validate the incoming requests.
  - Provide the values in plain text, not base64-encoded.

- **API Key** - The API key can be provided anywhere in the request, for example, in the `Authorization` header or in the request body.
  - Set the **API Key** property to the expected value of the API key.
  - Set the **API Key locator** property that will be evaluated against the incoming request to extract the API key. [See the example](#how-to-configure-api-key-authorization).

- **[JWT authorization](https://jwt.io/)** - The token should be in the _Authorization_ header of the request in the format of Bearer `{JWT_TOKEN}`.
  - Set JWK URL which is used as a well-known public URL to fetch the [JWKs](https://auth0.com/docs/secure/tokens/json-web-tokens/json-web-key-sets).
  - Set JWT role property expression which will be evaluated against the content of the JWT to extract the list of roles. See more details on extracting roles from JWT data [here](#how-to-extract-roles-from-jwt-data).
  - Set the required roles which will be used to validate if the JWT contains all required roles. See more details on extracting roles from JWT data [here](#how-to-extract-roles-from-jwt-data).

4. Configure **Activation Condition**. For example, given external caller triggers a webhook endpoint with the body `{"id": 1, "status": "OK"}`, the **Activation Condition** value might look like `=(request.body.status = "OK")`. Leave this field empty to trigger your webhook every time.
5. Use **Variable Mapping** to map specific fields from the request into process variables using [FEEL](https://docs.camunda.io/docs/next/components/modeler/feel/what-is-feel).
   For example, given the external caller triggers a webhook endpoint with the body `{"id": 1, "status": "OK"}` and you would like to extract `id` as a process variable `myDocumentId`, the **Result Expression** might look like this:

```
= {
  myDocumentId: request.body.id
}
```

6. Fill in the **Correlation** parameters if they are required by the element template.

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/http-webhook
