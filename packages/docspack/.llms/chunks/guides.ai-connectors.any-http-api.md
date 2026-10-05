# Connectors in AI Generation — Any HTTP API

Most systems have no dedicated connector. The REST connector reaches them, but only with the
right base URL, path and authentication. The
[API index](/docs/packages/connector-gen#api-index) has these for about 80 APIs, built offline
from their OpenAPI specs. A task that names one of them gets an **API card** next to the REST
connector:

```
api stripe — Stripe API https://api.stripe.com auth=bearer secret=STRIPE_TOKEN
POST /v1/customers — Create a customer | form body: name email description address balance business_name
```

The model writes `api=stripe` and the path:

```
with customer: http POST /v1/customers | api=stripe | body=={email: email}
```

The line then gets:

- the base URL;
- the `{params}` of the path as FEEL, from variables of the same name;
- the authentication, with a `{{secrets.STRIPE_TOKEN}}` placeholder;
- the headers the endpoint needs, such as Stripe's form encoding or Notion's
  `Notion-Version`.

A call the index does not have is kept, as a question to check the URL. A dedicated
connector still wins when it covers the task. GitHub's connector creates issues; the index
lists workflow runs.

---
Source: https://bpmnkit.com/docs/guides/ai-connectors
