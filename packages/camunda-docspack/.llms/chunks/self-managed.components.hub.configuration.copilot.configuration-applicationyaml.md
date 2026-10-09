# Copilot — Configuration — applicationYaml

```yaml
camunda.hub:
  feature.ai-enabled: true

  copilot:
    default-bpmn-copilot-llm-provider: BEDROCK
    default-feel-copilot-llm-provider: OPENAI
    default-form-copilot-llm-provider: VERTEX_AI
  client.copilot-request-timeout: 200s # optional, default: 300s
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/copilot
