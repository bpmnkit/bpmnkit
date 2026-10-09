# HTTP Webhook connector — Make your HTTP Webhook connector executable — XML payloads

You can send XML to the webhook or return XML using the response expression, but XML content is treated as a plain string. It will not be parsed or extracted into process variables.

If you need to use correlation keys with XML payloads, send the correlation key in a request header and retrieve it using the **Correlation key (payload)** property. For example:

```feel
=request.headers["x-correlation-id"]
```

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/http-webhook
