# Copilot — Configuration — applicationYaml

```yaml
camunda.hub.copilot.providers.azure-ai:
  default-model-id: gpt-4o-mini
  endpoint: https://my-resource.cognitiveservices.azure.com/openai/deployments/gpt-4o
  api-key: "az-ai-key-***" # conditionally required (alternative to OAuth)
  client-id: 00000000-0000-0000-0000-000000000000 # conditionally required (OAuth)
  client-secret: "***" # conditionally required (OAuth)
  tenant-id: 11111111-2222-3333-4444-555555555555 # conditionally required (OAuth)
  authority-host: https://login.microsoftonline.com # conditionally required (OAuth)
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/copilot
