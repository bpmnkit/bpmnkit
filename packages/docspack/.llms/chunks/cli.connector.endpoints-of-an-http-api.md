# casen connector — Endpoints of an HTTP API

Most systems have no dedicated connector, so the REST connector calls them. `api` prints the
real base URL, authentication and endpoints from the offline
[API index](/docs/packages/connector-gen#api-index). It searches the service the request names,
or the one `--service` gives:

```
$ casen connector api "refund a stripe payment" --limit 1
api stripe — Stripe API https://api.stripe.com auth=bearer secret=STRIPE_TOKEN
POST /v1/refunds — Create a refund | form body: amount currency charge customer expand instructions_email
```

Write the call as `with <id>: http POST /v1/refunds | api=stripe`. Applying the line adds the
base URL, the authentication with a secret placeholder, and the headers the endpoint needs.
`-o json` prints the endpoints as data.

---
Source: https://bpmnkit.com/docs/cli/connector
