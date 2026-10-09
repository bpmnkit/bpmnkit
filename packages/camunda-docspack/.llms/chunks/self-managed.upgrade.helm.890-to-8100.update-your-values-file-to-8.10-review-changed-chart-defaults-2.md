# Upgrade Camunda 8.9 to 8.10 using Helm — Update your values file to 8.10 — Review changed chart defaults (2)

These Hub variables replace `RESTAPI_PUSHER_APP_ID`, `RESTAPI_PUSHER_KEY`, `RESTAPI_PUSHER_SECRET`, and `RESTAPI_MAIL_PASSWORD`. If `camundaHub.restapi.env` or `webModeler.restapi.env` sets one of the old names, the chart emits a warning:

- For the Pusher variables, remove the entries. The chart always sets the new names. To supply your own Pusher values, see [Pin the Hub WebSocket secrets](#pin-the-hub-websocket-secrets).
- For `RESTAPI_MAIL_PASSWORD`, configure `camundaHub.restapi.mail.secret` and remove the entry. Alternatively, if you don't configure `camundaHub.restapi.mail.secret`, rename the entry to `SPRING_MAIL_PASSWORD`.

#### Management Identity URL includes the Gateway port

This change applies if you use Gateway API (`global.gateway.enabled: true`) without the shared Ingress, and you do not set `identity.fullURL`.

In chart 14.x, the Management Identity URL and the root URL of the Keycloak login client had no port. In chart 15.x, these URLs use the same origin as the other Gateway URLs. The chart adds the Gateway listener port: `global.gateway.tls.port` when `global.gateway.tls.enabled: true`, otherwise `global.gateway.port`. The chart does not add port 443 to HTTPS URLs or port 80 to HTTP URLs.

If clients reach the Gateway on a port that is different from the listener port, set the public port in `global.gateway.publicPorts` before you upgrade. For example, a LoadBalancer Service sends port 443 to a listener on port 8443:

```yaml
global:
  gateway:
    tls:
      port: 8443
    publicPorts:
      https: 443
```

`global.gateway.publicPorts` changes only the URLs that the chart generates. It does not change the Gateway listeners or Services.

#### Review application default changes

Some 8.10 application defaults change the behavior of a Helm deployment without a change to your values file:

| Component             | Change                                                                                    | Details                                                                                                                                            |
| :-------------------- | :---------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| Orchestration Cluster | The default memory allocation strategy of RocksDB changes from `PARTITION` to `FRACTION`. | [Default RocksDB memory allocation strategy](https://docs.camunda.io/docs/next/reference/announcements-release-notes/8100/8100-announcements#rocksdb-memory-allocation-strategy) |
| Optimize              | Optimize no longer imports object variable values by default.                             | [Default objectVariable inclusion changed](https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100#default-objectvariable-inclusion-changed)               |

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
