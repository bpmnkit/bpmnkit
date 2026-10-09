# HTTP Webhook connector — Activate the HTTP Webhook connector by deploying your diagram — How to configure API key authorization

External callers can provide an API key anywhere in the requests. Some webhook providers use an `Authorization` header, while others pass the API key in the request body.
To support any scenario, you can configure the HTTP Webhook connector to extract the API key from the request.

Use the **API Key locator** field to provide a FEEL expression that will be evaluated against the request to extract the API key.
The result of this expression will be used as the API key and compared against the expected API key value.

Use the **API Key** field to provide the expected API key value.

#### API key locator examples

Suppose an external caller triggers a webhook endpoint with the following request body:

```json
{
  "id": 1,
  "status": "OK",
  "secret": "my_secret"
}
```

You want to extract the `secret` field and use it as the API key to authorize the webhook request.
In this case, you can set the **API Key locator** to:

```feel
=request.body.secret
```

The expression above will be evaluated to `my_secret`, which will be used as the API key.

Alternatively, you can use the **API Key locator** to extract the API key from the `Authorization` header:

```feel
=request.headers.authorization
```

If your `Authorization` header contains the **Bearer** prefix, you can use the [`split`](https://docs.camunda.io/docs/next/components/modeler/feel/builtin-functions/feel-built-in-functions-string#splitstring-delimiter) function to remove it:

```feel
=split(request.headers.authorization, " ")[2]
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/http-webhook
