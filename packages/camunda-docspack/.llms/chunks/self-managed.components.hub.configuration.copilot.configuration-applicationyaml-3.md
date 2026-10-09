# Copilot — Configuration — applicationYaml

```yaml
camunda.hub.copilot.default-feel-copilot-llm-configuration:
  temperature: 0.2 # optional, default: 0.3
  top-p: 0.90 # optional, default: 0.95
  top-k: 100 # optional, default: 64
  max-tokens: 4096 # optional, default: 8192
  timeout: 45s # optional, default: 60s
  log-request: true # optional, default: false
  log-response: true # optional, default: false
  connection-acquisition-timeout: 10s # optional, default: 30s
  logit-bias: '{"123":-2,"456":3}' # optional, default: {}
  max-connections: 300 # optional, default: 200
  read-timeout: 120s # optional, default: 60s
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/hub/configuration/copilot
