# Authentication — Use a token

Include the previously captured token as an authorization header in each request: `Authorization: Bearer <TOKEN>`.

For example, to send a request to the Administration API's `/members` endpoint:

```shell
curl --header "Authorization: Bearer ${TOKEN}" \
     https://api.cloud.camunda.io/members
```

A successful response includes [a list of organization members](https://console.cloud.camunda.io/customer-api/openapi/docs/#/default/GetMembers). For example:

```json
[
  {
    "name": "User Userton",
    "email": "user@example.com",
    "roles": ["admin"],
    "invitePending": false
  }
]
```


## Token expiration

Access tokens expire according to the `expires_in` property of a successful authentication response. After this duration, in seconds, you must request a new access token.

---
Source: https://docs.camunda.io/docs/next/apis-tools/administration-api/authentication
