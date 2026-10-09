# HTTP Webhook connector — Activate the HTTP Webhook connector by deploying your diagram — Request limits

The Connector Runtime applies the following limits to HTTP Webhook requests:

| Request                                   | Default limit                                      | Response when exceeded |
| ----------------------------------------- | -------------------------------------------------- | ---------------------- |
| Request body except `multipart/form-data` | 10 MB                                              | HTTP `413`             |
| `multipart/form-data` request body        | 10 MB total                                        | HTTP `413`             |
| `multipart/form-data` file                | 10 MB per file                                     | HTTP `413`             |
| Request rate                              | 1,000 requests per second across all webhook paths | HTTP `429`             |

One global rate limiter is shared by all webhook paths, including unregistered paths. For non-multipart requests, the controller applies the rate limit before it returns HTTP `404` for an unregistered path or reads the request body. The servlet container can parse and size-check `multipart/form-data` requests before the controller applies the rate limit. Requests that exceed the global rate limit return HTTP `429`. HTTP `404`, `413`, and `429` responses have an empty body.

For Self-Managed deployments, you can [configure the request limits](https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration#configure-inbound-webhook-request-limits).

---
Source: https://docs.camunda.io/docs/next/components/connectors/protocol/http-webhook
