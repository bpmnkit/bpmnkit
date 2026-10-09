# Authentication — Use a token

Include the previously captured token as an authorization header in each request: `Authorization: Bearer <TOKEN>`.

For example, to send a request to the Web Modeler API's `/info` endpoint:

```shell
curl --header "Authorization: Bearer ${TOKEN}" \
     https://modeler.cloud.camunda.io/api/v1/info
```

**Tip**
The `${WEB_MODELER_REST_URL}` variable below represents the URL of the Web Modeler API. You can configure this value in your Self-Managed installation. The default value is `http://localhost:8070`.

```shell
curl --header "Authorization: Bearer ${TOKEN}" \
     ${WEB_MODELER_REST_URL}/api/v1/info
```

A successful response includes [information about the environment](https://modeler.camunda.io/swagger-ui/index.html#/Info/getInfo). For example:

```json
{
  "version": "v1",
  "authorizedOrganization": "12345678-ABCD-DCBA-ABCD-123456789ABC",
  "createPermission": true,
  "readPermission": true,
  "updatePermission": true,
  "deletePermission": false
}
```

---
Source: https://docs.camunda.io/docs/next/apis-tools/web-modeler-api/authentication
