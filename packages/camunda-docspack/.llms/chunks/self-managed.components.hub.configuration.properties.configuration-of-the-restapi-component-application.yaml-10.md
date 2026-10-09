# Property reference — Configuration of the `restapi` component — application.yaml

```yaml
camunda:
  ca-certificate-path: /path/to/certificate # optional
  client:
    config-path: /path/to/credentials/cache.txt # optional; when unset, OAuth credentials are cached in memory only
    request-timeout: 60000 # optional, default: 10000
  auth:
    connect-timeout: 30000 # optional, default: 5000
    read-timeout: 30000 # optional, default: 5000
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/properties
