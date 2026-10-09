# Property reference — Configuration of the `restapi` component — application.yaml

```yaml
camunda.hub:
  pusher:
    host: hub-websockets
    port: 8060 # default: 8060
    app-id: hub
    key: "***"
    secret: "***"
    client:
      host: ws.example.com
      port: 443 # default: 80
      path: /hub-ws # optional, default: /
      force-tls: true # default: false
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
