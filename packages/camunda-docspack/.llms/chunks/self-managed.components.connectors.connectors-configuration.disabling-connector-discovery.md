# Configuration — Disabling connector discovery

**Warning**
We do not guarantee that all the Camunda provided connectors will be discovered via SPI.
If you want to have a connector runtime without out-of-the-box connectors, we recommend building a custom runtime with only the connectors you want to use.

To disable the discovery of connectors via SPI or environment variables as explained [in this section](#manual-discovery-of-connectors),
set the following environment variables: `CONNECTOR_INBOUND_DISCOVERY_DISABLED` and `CONNECTOR_OUTBOUND_DISCOVERY_DISABLED`.

Note that this does not prevent the registration of connectors via Spring Beans or
other mechanisms.


## Configure inbound webhook request limits

Use the following Spring properties or equivalent environment variables to configure HTTP Webhook request limits:

| Spring property                                           | Environment variable                                      | Default            | Description                                                                                                     |
| --------------------------------------------------------- | --------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------- |
| `camunda.connector.webhook.max-request-body-bytes`        | `CAMUNDA_CONNECTOR_WEBHOOK_MAX_REQUEST_BODY_BYTES`        | `10485760` (10 MB) | Maximum request body size in bytes, except for `multipart/form-data`. The value must be a non-negative integer. |
| `camunda.connector.webhook.rate-limit.enabled`            | `CAMUNDA_CONNECTOR_WEBHOOK_RATE_LIMIT_ENABLED`            | `true`             | Enables the global request rate limit shared by all webhook paths.                                              |
| `camunda.connector.webhook.rate-limit.permits-per-second` | `CAMUNDA_CONNECTOR_WEBHOOK_RATE_LIMIT_PERMITS_PER_SECOND` | `1000`             | Maximum sustained requests per second across all webhook paths. The value must be positive and finite.          |
| `spring.servlet.multipart.max-file-size`                  | `SPRING_SERVLET_MULTIPART_MAX_FILE_SIZE`                  | `10MB`             | Maximum size of each file in a `multipart/form-data` request.                                                   |
| `spring.servlet.multipart.max-request-size`               | `SPRING_SERVLET_MULTIPART_MAX_REQUEST_SIZE`               | `10MB`             | Maximum total size of a `multipart/form-data` request.                                                          |

Requests that exceed a body or multipart limit receive an HTTP `413` response. Requests that exceed the available rate-limit permits receive an HTTP `429` response. These responses have an empty body.

Spring parses `multipart/form-data` requests before the Connector Runtime applies `camunda.connector.webhook.max-request-body-bytes`, so configure multipart limits separately. The global rate limit also applies to multipart requests, but the servlet container can parse them before the rate limit is evaluated. Rate limiting controls sustained throughput across all webhook paths; it does not limit the number of concurrent requests.

The Connector Runtime fails to start if the request-body limit is negative or an enabled rate limit has an invalid permits-per-second value.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/connectors/connectors-configuration
