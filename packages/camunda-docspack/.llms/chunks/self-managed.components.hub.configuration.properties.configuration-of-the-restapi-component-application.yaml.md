# Property reference — Configuration of the `restapi` component — application.yaml

```yaml
camunda.hub.server:
  url: https://hub.example.com # or https://example.com/hub
  https-only: true # optional, default: true

server:
  servlet:
    context-path: /hub # optional; required if server-url does not point to root path
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
