# HTTP Webhook connector — Activate the HTTP Webhook connector by deploying your diagram — How to extract roles from JWT data

To extract roles from the JWT payload, specify the **JWT role property expression** using the FEEL expression syntax.

**Note**
This expression will be evaluated only against the JWT payload, therefore you cannot access process variables or secrets here.

#### JWT payload and role property expression example

Let's observe a typical JWT payload example below:

```json
{
  "iss": "https://idp.local",
  "aud": "api1",
  "sub": "5be86359073c434bad2da3932222dabe",
  "client_id": "my_client_app",
  "exp": 1786822616,
  "iat": 1686819016,
  "jti": "114f8c84c53703ac2120d302611e358c",
  "roles": ["admin", "superadmin"],
  "admin": true
}
```

To extract the roles you can set the **JWT role property expression** to:

```feel
if admin = true then ["admin"] else roles
```

Note: the result of this expression should always be an array.

In this particular case, the if statement is evaluated to true, the extracted roles will be:

```feel
["admin"]
```

If you provide _["admin"]_ for **Required roles**, the message _can be correlated_.

If you provide _["superadmin"]_ or _["admin","superadmin"]_, for **Required roles**, for example, the message _can NOT be correlated_ and the connector will throw an exception.

**Note**
For GitHub, there is a simplified [GitHub Webhook connector](https://docs.camunda.io/docs/next/components/connectors/out-of-the-box-connectors/github).

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/http-webhook
