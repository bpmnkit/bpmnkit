# Copilot — Configuration — applicationYaml

```yaml
camunda.hub.copilot.providers.open-ai:
  default-model-id: gpt-4.1
  api-key: sk-live-******** # conditionally required
  endpoint: https://my-proxy.example.com/v1 # conditionally required
  bearer: my-shared-bearer-token # optional
  username: api_user # optional
  password: s3cr3t # optional
  headers: '{"X-Org":"camunda","X-Trace":"on"}' # optional
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/copilot
