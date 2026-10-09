# Property reference — Configuration of the `restapi` component — application.yaml

```yaml
server:
  ssl:
    enabled: true # optional, default: false
    certificate: file:/full/path/to/certificate.pem
    certificate-private-key: file:/full/path/to/key.pem

management:
  server:
    ssl:
      enabled: true # optional, default: false
      certificate: file:/full/path/to/certificate.pem
      certificate-private-key: file:/full/path/to/key.pem

camunda.hub:
  pusher:
    ssl-enabled: true # optional, default: false; enables SSL to the websocket component
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
